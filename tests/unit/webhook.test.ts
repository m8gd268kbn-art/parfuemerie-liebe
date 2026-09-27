import Stripe from "stripe";
import { describe, expect, it } from "vitest";
import { stripeProvider } from "@/services/payments/stripe";
import { signTestPayload, TEST_SIGNATURE_HEADER, testProvider } from "@/services/payments/test-provider";
import { WebhookSignatureError } from "@/services/payments/types";

describe("Webhook-Signaturprüfung: Test-Zahlungsanbieter", () => {
  const body = JSON.stringify({ id: "evt_1", type: "payment.succeeded", providerRef: "test_cs_abc", amountCents: 12900, method: "card" });

  it("akzeptiert eine gültige HMAC-Signatur", async () => {
    const event = await testProvider.parseWebhook(body, new Headers({ [TEST_SIGNATURE_HEADER]: signTestPayload(body) }));
    expect(event).toMatchObject({ kind: "payment.succeeded", providerRef: "test_cs_abc", amountCents: 12900 });
  });

  it("lehnt manipulierte Inhalte, fehlende und abgelaufene Signaturen ab", async () => {
    const tampered = body.replace("12900", "100");
    await expect(testProvider.parseWebhook(tampered, new Headers({ [TEST_SIGNATURE_HEADER]: signTestPayload(body) }))).rejects.toBeInstanceOf(WebhookSignatureError);
    await expect(testProvider.parseWebhook(body, new Headers())).rejects.toBeInstanceOf(WebhookSignatureError);
    const old = signTestPayload(body, Math.floor(Date.now() / 1000) - 3600);
    await expect(testProvider.parseWebhook(body, new Headers({ [TEST_SIGNATURE_HEADER]: old }))).rejects.toBeInstanceOf(WebhookSignatureError);
  });
});

describe("Webhook-Signaturprüfung: Stripe", () => {
  const secret = process.env.STRIPE_WEBHOOK_SECRET!;
  const payload = JSON.stringify({
    id: "evt_stripe_1",
    object: "event",
    type: "checkout.session.completed",
    data: { object: { id: "cs_test_1", object: "checkout.session", payment_status: "paid", amount_total: 12900, currency: "eur", metadata: { orderId: "order-1" }, payment_intent: "pi_1" } },
  });

  it("verarbeitet nur korrekt signierte Ereignisse", async () => {
    const header = Stripe.webhooks.generateTestHeaderString({ payload, secret });
    const event = await stripeProvider.parseWebhook(payload, new Headers({ "stripe-signature": header }));
    expect(event).toMatchObject({ kind: "payment.succeeded", providerRef: "cs_test_1", orderId: "order-1", amountCents: 12900 });
    const forged = Stripe.webhooks.generateTestHeaderString({ payload, secret: "whsec_falsch" });
    await expect(stripeProvider.parseWebhook(payload, new Headers({ "stripe-signature": forged }))).rejects.toBeInstanceOf(WebhookSignatureError);
    await expect(stripeProvider.parseWebhook(payload, new Headers())).rejects.toBeInstanceOf(WebhookSignatureError);
  });
});
