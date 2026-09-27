import "server-only";
import { testPaymentSecret } from "@/config/env";
import { hmacSha256, randomToken, safeEqual } from "@/services/security/crypto";
import { siteUrl } from "@/services/email";
import type { CheckoutRequest, CheckoutSession, PaymentEvent, PaymentProvider } from "./types";
import { WebhookSignatureError } from "./types";

/**
 * Test-Zahlungsanbieter für Entwicklung und End-to-End-Tests.
 * Bildet den Stripe-Ablauf nach: Weiterleitung auf eine Zahlungsseite, Bestätigung
 * ausschließlich über einen HMAC-signierten Webhook. In Produktion gesperrt (siehe config/env).
 */

export const TEST_SIGNATURE_HEADER = "x-liebe-test-signature";
const TOLERANCE_SECONDS = 300;

export type TestWebhookPayload =
  | { id: string; type: "payment.succeeded"; providerRef: string; amountCents: number; method: string }
  | { id: string; type: "payment.failed" | "payment.expired"; providerRef: string }
  | { id: string; type: "refund.updated"; providerRef: string; refundedTotalCents: number };

export function signTestPayload(body: string, timestamp = Math.floor(Date.now() / 1000)) {
  return `t=${timestamp},v1=${hmacSha256(testPaymentSecret(), `${timestamp}.${body}`)}`;
}

/** Sendet ein signiertes Ereignis an den eigenen Webhook-Endpunkt (wie Stripe es tun würde). */
export async function deliverTestWebhook(payload: TestWebhookPayload) {
  const body = JSON.stringify(payload);
  const res = await fetch(`${siteUrl()}/api/webhooks/test-payment`, {
    method: "POST",
    headers: { "Content-Type": "application/json", [TEST_SIGNATURE_HEADER]: signTestPayload(body) },
    body,
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Test-Webhook fehlgeschlagen (${res.status})`);
}

export const testProvider: PaymentProvider = {
  id: "test",

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const providerRef = `test_cs_${randomToken(12)}`;
    return { providerRef, redirectUrl: `${siteUrl()}/kasse/testzahlung/${providerRef}` };
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent> {
    const header = headers.get(TEST_SIGNATURE_HEADER) ?? "";
    const parts = Object.fromEntries(header.split(",").map((kv) => kv.split("=") as [string, string]));
    const timestamp = Number(parts.t);
    if (!parts.v1 || !Number.isFinite(timestamp)) throw new WebhookSignatureError("Signatur fehlt");
    if (Math.abs(Date.now() / 1000 - timestamp) > TOLERANCE_SECONDS) throw new WebhookSignatureError("Signatur abgelaufen");
    const expected = hmacSha256(testPaymentSecret(), `${timestamp}.${rawBody}`);
    if (!safeEqual(expected, parts.v1)) throw new WebhookSignatureError();

    const payload = JSON.parse(rawBody) as TestWebhookPayload;
    switch (payload.type) {
      case "payment.succeeded":
        return {
          id: payload.id,
          kind: "payment.succeeded",
          providerRef: payload.providerRef,
          orderId: null,
          providerPaymentId: `test_pi_${payload.providerRef.slice(-12)}`,
          amountCents: payload.amountCents,
          currency: "eur",
          method: payload.method,
        };
      case "payment.failed":
      case "payment.expired":
        return { id: payload.id, kind: payload.type, providerRef: payload.providerRef, orderId: null };
      case "refund.updated":
        return {
          id: payload.id,
          kind: "refund.updated",
          providerRef: payload.providerRef,
          providerPaymentId: null,
          refundedTotalCents: payload.refundedTotalCents,
        };
      default:
        return { id: (payload as { id: string }).id, kind: "ignored", type: "unknown" };
    }
  },

  async refund({ providerRef }) {
    if (!providerRef) throw new Error("Keine Zahlungsreferenz für die Erstattung vorhanden.");
    // Der tatsächliche Erstattungsstand wird wie bei Stripe per Webhook gemeldet (siehe orders.refundOrder).
    return { refundId: `test_re_${randomToken(10)}` };
  },
};
