import "server-only";
import { and, eq, gt, lt } from "drizzle-orm";
import { cookies } from "next/headers";
import { notFound, redirect } from "next/navigation";
import { cache } from "react";
import { env } from "@/config/env";
import { db } from "@/services/db";
import { sessions, users } from "@/services/db/schema";
import { randomToken, sha256 } from "@/services/security/crypto";

export const SESSION_COOKIE = "pl_session";
const SESSION_DAYS = 30;
const RENEW_BEFORE_DAYS = 15;

export type CurrentUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: "customer" | "admin";
  emailVerified: boolean;
};

function cookieOptions(expires: Date) {
  return {
    httpOnly: true,
    secure: env().NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    expires,
  };
}

/** Neue Session anlegen und Cookie setzen (nur in Server Actions / Route Handlern). */
export async function createSession(userId: string, userAgent: string | null) {
  const token = randomToken(32);
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  await db.insert(sessions).values({ id: sha256(token), userId, expiresAt, userAgent });
  (await cookies()).set(SESSION_COOKIE, token, cookieOptions(expiresAt));
}

export async function destroySession() {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (token) await db.delete(sessions).where(eq(sessions.id, sha256(token)));
  store.delete(SESSION_COOKIE);
}

/** Alle Sessions einer Person beenden (z. B. nach Passwort-Reset). */
export async function destroyAllSessions(userId: string) {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

/** Aktuelle Person aus dem Session-Cookie – einmal pro Request (React cache). */
export const getCurrentUser = cache(async (): Promise<CurrentUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token || token.length > 100) return null;
  const id = sha256(token);
  const [row] = await db
    .select({
      sessionId: sessions.id,
      expiresAt: sessions.expiresAt,
      user: {
        id: users.id,
        email: users.email,
        firstName: users.firstName,
        lastName: users.lastName,
        role: users.role,
        emailVerifiedAt: users.emailVerifiedAt,
        disabledAt: users.disabledAt,
      },
    })
    .from(sessions)
    .innerJoin(users, eq(users.id, sessions.userId))
    .where(and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())))
    .limit(1);
  if (!row || row.user.disabledAt) return null;

  // Gleitende Verlängerung in der Datenbank.
  if (row.expiresAt.getTime() - Date.now() < RENEW_BEFORE_DAYS * 86_400_000) {
    await db
      .update(sessions)
      .set({ expiresAt: new Date(Date.now() + SESSION_DAYS * 86_400_000) })
      .where(eq(sessions.id, id));
  }

  return {
    id: row.user.id,
    email: row.user.email,
    firstName: row.user.firstName,
    lastName: row.user.lastName,
    role: row.user.role,
    emailVerified: Boolean(row.user.emailVerifiedAt),
  };
});

/** Für Seiten im Kundenkonto: ohne Login zur Anmeldung mit Rücksprung. */
export async function requireUser(returnTo = "/konto"): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) redirect(`/anmelden?weiter=${encodeURIComponent(returnTo)}`);
  return user;
}

/**
 * Für Admin-Seiten und -Actions. Nicht-Admins erhalten 404, damit der Bereich nicht
 * erkennbar ist. Jede Admin-Action ruft dies serverseitig auf – UI-Ausblendung genügt nie.
 */
export async function requireAdmin(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") notFound();
  return user;
}

/** Abgelaufene Sessions aufräumen (vom Wartungs-Endpunkt aufgerufen). */
export async function purgeExpiredSessions() {
  await db.delete(sessions).where(lt(sessions.expiresAt, new Date()));
}
