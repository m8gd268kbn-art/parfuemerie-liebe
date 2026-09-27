import "server-only";
import { and, eq } from "drizzle-orm";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { emailSchema } from "@/lib/validation/auth";
import { db } from "@/services/db";
import { newsletterSubscribers } from "@/services/db/schema";
import { sendEmail, siteUrl } from "@/services/email";
import { newsletterConfirmTemplate } from "@/services/email/templates";
import { randomToken, sha256 } from "@/services/security/crypto";

/**
 * Newsletter mit Double-Opt-In: Anmeldung → Bestätigungsmail → erst nach Klick „confirmed“.
 * Die Antwort ist immer gleich, damit keine Rückschlüsse auf bestehende Adressen möglich sind.
 */
export async function subscribeNewsletter(rawEmail: string, source: string): Promise<ActionResult> {
  const parsed = emailSchema.safeParse(rawEmail);
  if (!parsed.success) return fail("Bitte geben Sie eine gültige E-Mail-Adresse ein.", { email: parsed.error.issues[0].message });
  const email = parsed.data;
  const [existing] = await db.select().from(newsletterSubscribers).where(eq(newsletterSubscribers.email, email)).limit(1);
  const message = "Fast geschafft: Bitte bestätigen Sie Ihre Anmeldung über den Link in der E-Mail, die wir Ihnen gesendet haben.";
  if (existing?.status === "confirmed") return ok(undefined, message);

  const token = randomToken(24);
  if (existing) {
    await db
      .update(newsletterSubscribers)
      .set({ status: "pending", tokenHash: sha256(token), source, signupAt: new Date(), unsubscribedAt: null })
      .where(eq(newsletterSubscribers.id, existing.id));
  } else {
    await db.insert(newsletterSubscribers).values({ email, status: "pending", tokenHash: sha256(token), source });
  }
  await sendEmail(email, newsletterConfirmTemplate(siteUrl(), `${siteUrl()}/newsletter/bestaetigen?token=${token}`));
  return ok(undefined, message);
}

export async function confirmNewsletter(token: string): Promise<boolean> {
  if (!token || token.length > 200) return false;
  const [row] = await db
    .update(newsletterSubscribers)
    .set({ status: "confirmed", confirmedAt: new Date() })
    .where(and(eq(newsletterSubscribers.tokenHash, sha256(token)), eq(newsletterSubscribers.status, "pending")))
    .returning({ id: newsletterSubscribers.id });
  return Boolean(row);
}

/** Abmeldung über den (dauerhaft gültigen) Token aus dem Newsletter-Link. */
export async function unsubscribeNewsletter(token: string): Promise<boolean> {
  if (!token || token.length > 200) return false;
  const [row] = await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.tokenHash, sha256(token)))
    .returning({ id: newsletterSubscribers.id });
  return Boolean(row);
}

export async function newsletterStatusFor(email: string) {
  const [row] = await db
    .select({ status: newsletterSubscribers.status })
    .from(newsletterSubscribers)
    .where(eq(newsletterSubscribers.email, email.toLowerCase()))
    .limit(1);
  return row?.status ?? null;
}

export async function unsubscribeByEmail(email: string) {
  await db
    .update(newsletterSubscribers)
    .set({ status: "unsubscribed", unsubscribedAt: new Date() })
    .where(eq(newsletterSubscribers.email, email.toLowerCase()));
}
