import "server-only";
import { hash, verify } from "@node-rs/argon2";
import { and, eq, gt, isNull } from "drizzle-orm";
import { fail, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import {
  changePasswordSchema,
  forgotPasswordSchema,
  loginSchema,
  profileSchema,
  registerSchema,
  resetPasswordSchema,
} from "@/lib/validation/auth";
import { db } from "@/services/db";
import { authTokens, users } from "@/services/db/schema";
import { sendEmail, siteUrl } from "@/services/email";
import { passwordResetTemplate, verifyEmailTemplate } from "@/services/email/templates";
import { randomToken, sha256 } from "@/services/security/crypto";
import { rateLimit, rateLimitMessage } from "@/services/security/rate-limit";
import { clientKey, userAgent } from "@/services/security/request";
import { createSession, destroyAllSessions, destroySession, getCurrentUser } from "./session";

const ARGON = { memoryCost: 19_456, timeCost: 2, parallelism: 1, outputLen: 32 } as const;

export function hashPassword(password: string) {
  return hash(password, ARGON);
}

export async function verifyPassword(passwordHash: string, password: string) {
  try {
    return await verify(passwordHash, password);
  } catch {
    return false;
  }
}

// Konstante Rechenzeit auch bei unbekannter E-Mail (verhindert Nutzer-Enumeration über Timing).
let dummyHash: Promise<string> | null = null;
function getDummyHash() {
  dummyHash ??= hashPassword("unbekannt-dummy-passwort");
  return dummyHash;
}

async function issueToken(userId: string, type: "verify_email" | "reset_password", ttlMinutes: number) {
  const token = randomToken(32);
  await db.insert(authTokens).values({
    userId,
    type,
    tokenHash: sha256(token),
    expiresAt: new Date(Date.now() + ttlMinutes * 60_000),
  });
  return token;
}

async function consumeToken(token: string, type: "verify_email" | "reset_password") {
  const [row] = await db
    .update(authTokens)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(authTokens.tokenHash, sha256(token)),
        eq(authTokens.type, type),
        isNull(authTokens.usedAt),
        gt(authTokens.expiresAt, new Date()),
      ),
    )
    .returning({ userId: authTokens.userId });
  return row?.userId ?? null;
}

export async function sendVerificationEmail(userId: string, email: string, firstName: string) {
  const token = await issueToken(userId, "verify_email", 24 * 60);
  const link = `${siteUrl()}/email-bestaetigen?token=${token}`;
  await sendEmail(email, verifyEmailTemplate(siteUrl(), firstName || "Kundin, Kunde", link));
}

export async function register(input: unknown): Promise<ActionResult<{ userId: string }>> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const limit = await rateLimit(`register:${await clientKey()}`, 5, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));

  const { email, password, firstName, lastName } = parsed.data;
  const existing = await db.select({ id: users.id }).from(users).where(eq(users.email, email)).limit(1);
  if (existing.length) {
    return fail("Für diese E-Mail-Adresse besteht bereits ein Kundenkonto.", {
      email: "Diese E-Mail-Adresse ist bereits registriert. Bitte melden Sie sich an.",
    });
  }
  const [user] = await db
    .insert(users)
    .values({ email, passwordHash: await hashPassword(password), firstName, lastName })
    .returning({ id: users.id });
  await createSession(user.id, await userAgent());
  await sendVerificationEmail(user.id, email, firstName);
  return ok({ userId: user.id }, "Willkommen bei der Parfümerie Liebe.");
}

export async function login(input: unknown): Promise<ActionResult<{ userId: string; role: string }>> {
  const parsed = loginSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const { email, password } = parsed.data;

  const ipLimit = await rateLimit(`login-ip:${await clientKey()}`, 20, 900);
  const emailLimit = await rateLimit(`login-email:${sha256(email)}`, 8, 900);
  if (!ipLimit.ok) return fail(rateLimitMessage(ipLimit));
  if (!emailLimit.ok) return fail(rateLimitMessage(emailLimit));

  const [user] = await db
    .select({ id: users.id, passwordHash: users.passwordHash, role: users.role, disabledAt: users.disabledAt })
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  const valid = user ? await verifyPassword(user.passwordHash, password) : (await verifyPassword(await getDummyHash(), password), false);
  if (!user || !valid || user.disabledAt) {
    return fail("E-Mail-Adresse oder Passwort ist nicht korrekt.");
  }
  await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));
  await createSession(user.id, await userAgent());
  return ok({ userId: user.id, role: user.role });
}

export async function logout() {
  await destroySession();
}

/** Antwortet immer gleich, damit nicht erkennbar ist, ob ein Konto existiert. */
export async function requestPasswordReset(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const limit = await rateLimit(`reset:${await clientKey()}`, 5, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));

  const [user] = await db
    .select({ id: users.id, email: users.email, disabledAt: users.disabledAt })
    .from(users)
    .where(eq(users.email, parsed.data.email))
    .limit(1);
  if (user && !user.disabledAt) {
    const token = await issueToken(user.id, "reset_password", 60);
    await sendEmail(user.email, passwordResetTemplate(siteUrl(), `${siteUrl()}/passwort-zuruecksetzen?token=${token}`));
  }
  return ok(undefined, "Wenn ein Konto mit dieser E-Mail-Adresse existiert, haben wir Ihnen einen Link gesendet.");
}

export async function resetPassword(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const limit = await rateLimit(`reset-confirm:${await clientKey()}`, 10, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  const userId = await consumeToken(parsed.data.token, "reset_password");
  if (!userId) return fail("Dieser Link ist abgelaufen oder wurde bereits verwendet. Bitte fordern Sie einen neuen an.");
  await db
    .update(users)
    .set({ passwordHash: await hashPassword(parsed.data.password), emailVerifiedAt: new Date() })
    .where(eq(users.id, userId));
  await destroyAllSessions(userId);
  await createSession(userId, await userAgent());
  return ok(undefined, "Ihr Passwort wurde geändert.");
}

export async function verifyEmail(token: string): Promise<boolean> {
  if (!token || token.length > 200) return false;
  const userId = await consumeToken(token, "verify_email");
  if (!userId) return false;
  await db.update(users).set({ emailVerifiedAt: new Date() }).where(eq(users.id, userId));
  return true;
}

export async function resendVerification(): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melden Sie sich an.");
  if (user.emailVerified) return ok(undefined, "Ihre E-Mail-Adresse ist bereits bestätigt.");
  const limit = await rateLimit(`verify-resend:${user.id}`, 3, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  await sendVerificationEmail(user.id, user.email, user.firstName);
  return ok(undefined, "Wir haben Ihnen einen neuen Bestätigungslink gesendet.");
}

export async function changePassword(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melden Sie sich an.");
  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const limit = await rateLimit(`change-password:${user.id}`, 5, 900);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  const [row] = await db.select({ passwordHash: users.passwordHash }).from(users).where(eq(users.id, user.id));
  if (!row || !(await verifyPassword(row.passwordHash, parsed.data.currentPassword))) {
    return fail("Bitte prüfen Sie Ihre Angaben.", { currentPassword: "Das aktuelle Passwort ist nicht korrekt." });
  }
  await db.update(users).set({ passwordHash: await hashPassword(parsed.data.password) }).where(eq(users.id, user.id));
  await destroyAllSessions(user.id);
  await createSession(user.id, await userAgent());
  return ok(undefined, "Ihr Passwort wurde geändert.");
}

export async function updateProfile(input: unknown): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melden Sie sich an.");
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  await db.update(users).set(parsed.data).where(eq(users.id, user.id));
  return ok(undefined, "Ihre Angaben wurden gespeichert.");
}
