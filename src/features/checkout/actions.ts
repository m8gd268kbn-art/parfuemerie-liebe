"use server";

import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { env } from "@/config/env";
import { fail, ok, zodFieldErrors } from "@/lib/action-result";
import { passwordSchema } from "@/lib/validation/auth";
import { hashPassword } from "@/services/auth/service";
import { createSession } from "@/services/auth/session";
import { db } from "@/services/db";
import { orders, payments, users } from "@/services/db/schema";
import { lookupOrder, placeOrder, releaseReservation } from "@/services/orders";
import { deliverTestWebhook } from "@/services/payments/test-provider";
import { randomToken } from "@/services/security/crypto";
import { rateLimit, rateLimitMessage } from "@/services/security/rate-limit";
import { clientKey, userAgent } from "@/services/security/request";
import { z } from "zod";

export async function placeOrderAction(input: unknown) {
  return placeOrder(input);
}

/** „Zurück zur Kasse“ nach Abbruch: Reservierung sofort freigeben, damit neu bestellt werden kann. */
export async function cancelPendingOrderAction(publicToken: string) {
  const [order] = await db.select({ id: orders.id, status: orders.status }).from(orders).where(eq(orders.publicToken, String(publicToken))).limit(1);
  if (order?.status === "pending_payment") {
    await releaseReservation(order.id, "Zahlung von der Kundin/dem Kunden abgebrochen.");
  }
  redirect("/kasse");
}

/** Nur Test-Zahlungsanbieter: sendet ein signiertes Webhook-Ereignis, danach Rücksprung wie bei Stripe. */
export async function simulateTestPaymentAction(providerRef: string, outcome: "succeeded" | "failed") {
  if (env().PAYMENT_PROVIDER !== "test") throw new Error("Nicht verfügbar");
  const [row] = await db
    .select({ amount: payments.amountCents, method: payments.method, token: orders.publicToken })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(eq(payments.providerRef, String(providerRef)))
    .limit(1);
  if (!row) throw new Error("Unbekannte Zahlung");
  await deliverTestWebhook(
    outcome === "succeeded"
      ? { id: `evt_${randomToken(10)}`, type: "payment.succeeded", providerRef, amountCents: row.amount, method: row.method ?? "card" }
      : { id: `evt_${randomToken(10)}`, type: "payment.failed", providerRef },
  );
  redirect(outcome === "succeeded" ? `/kasse/bestaetigung/${row.token}` : `/kasse/abgebrochen/${row.token}?fehlgeschlagen=1`);
}

/** Nach der Bestellung: Konto mit den Bestelldaten anlegen (optional, keine Pflicht). */
export async function createAccountFromOrderAction(publicToken: string, password: string) {
  const limit = await rateLimit(`order-account:${await clientKey()}`, 5, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  const pw = passwordSchema.safeParse(password);
  if (!pw.success) return fail("Bitte prüfen Sie Ihr Passwort.", zodFieldErrors(pw.error.issues.map((i) => ({ ...i, path: ["password"] }))));
  const [order] = await db.select().from(orders).where(eq(orders.publicToken, String(publicToken))).limit(1);
  if (!order || order.userId) return fail("Für diese Bestellung kann kein Konto mehr angelegt werden.");
  const [existing] = await db.select({ id: users.id }).from(users).where(eq(users.email, order.email)).limit(1);
  if (existing) return fail("Für diese E-Mail-Adresse besteht bereits ein Konto. Bitte melden Sie sich an.");
  const [user] = await db
    .insert(users)
    .values({
      email: order.email,
      passwordHash: await hashPassword(pw.data),
      firstName: order.billingAddress.firstName,
      lastName: order.billingAddress.lastName,
    })
    .returning({ id: users.id });
  // Nur diese Bestellung verknüpfen. Frühere Gastbestellungen mit derselben E-Mail werden bewusst
  // nicht übernommen: Wer das Token kennt, beweist nicht den Besitz des Postfachs.
  await db.update(orders).set({ userId: user.id }).where(eq(orders.id, order.id));
  await createSession(user.id, await userAgent());
  const { sendVerificationEmail } = await import("@/services/auth/service");
  await sendVerificationEmail(user.id, order.email, order.billingAddress.firstName);
  return ok(undefined, "Ihr Kundenkonto ist angelegt. Ihre Bestellungen finden Sie jetzt unter „Mein Konto“.");
}

export async function lookupOrderAction(input: { number: string; email: string }) {
  const parsed = z.object({ number: z.string().trim().min(3).max(30), email: z.string().trim().email() }).safeParse(input);
  if (!parsed.success) return fail("Bitte geben Sie Bestellnummer und E-Mail-Adresse an.");
  const result = await lookupOrder(parsed.data.number, parsed.data.email);
  if (!result.ok) return result;
  redirect(`/bestellung/${result.data.publicToken}`);
}
