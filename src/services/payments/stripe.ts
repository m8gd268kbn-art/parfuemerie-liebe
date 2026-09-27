import "server-only";
import Stripe from "stripe";
import { env } from "@/config/env";
import type { CheckoutRequest, CheckoutSession, PaymentEvent, PaymentProvider } from "./types";
import { WebhookSignatureError } from "./types";

/**
 * Stripe Checkout (gehostete Zahlungsseite). Kartendaten berühren nie unsere Server.
 * Apple Pay / Google Pay laufen über die Zahlungsart „card“, sofern im Stripe-Dashboard aktiviert.
 */
const METHOD_TYPES: Record<string, Stripe.Checkout.SessionCreateParams.PaymentMethodType[]> = {
  card: ["card"],
  apple_pay: ["card"],
  google_pay: ["card"],
  paypal: ["paypal"],
  klarna: ["klarna"],
};

let client: Stripe | null = null;
function stripe() {
  client ??= new Stripe(env().STRIPE_SECRET_KEY!, { maxNetworkRetries: 2, appInfo: { name: "Parfümerie Liebe Shop" } });
  return client;
}

export const stripeProvider: PaymentProvider = {
  id: "stripe",

  async createCheckout(req: CheckoutRequest): Promise<CheckoutSession> {
    const s = stripe();
    let discounts: Stripe.Checkout.SessionCreateParams.Discount[] | undefined;
    if (req.discountCents > 0) {
      const coupon = await s.coupons.create({
        amount_off: req.discountCents,
        currency: req.currency,
        duration: "once",
        max_redemptions: 1,
        name: `Rabatt ${req.orderNumber}`,
      });
      discounts = [{ coupon: coupon.id }];
    }
    const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = req.items.map((item) => ({
      quantity: item.quantity,
      price_data: { currency: req.currency, unit_amount: item.unitPriceCents, product_data: { name: item.name } },
    }));
    if (req.shippingCents > 0) {
      lineItems.push({
        quantity: 1,
        price_data: { currency: req.currency, unit_amount: req.shippingCents, product_data: { name: req.shippingLabel } },
      });
    }
    const session = await s.checkout.sessions.create(
      {
        mode: "payment",
        locale: "de",
        customer_email: req.email,
        client_reference_id: req.orderId,
        metadata: { orderId: req.orderId, orderNumber: req.orderNumber },
        payment_intent_data: { metadata: { orderId: req.orderId, orderNumber: req.orderNumber } },
        payment_method_types: METHOD_TYPES[req.paymentMethod] ?? ["card"],
        line_items: lineItems,
        discounts,
        success_url: req.successUrl,
        cancel_url: req.cancelUrl,
        expires_at: Math.floor(req.expiresAt.getTime() / 1000),
      },
      { idempotencyKey: `checkout-${req.orderId}` },
    );
    if (!session.url) throw new Error("Stripe hat keine Checkout-URL geliefert.");
    if (session.amount_total != null && session.amount_total !== req.totalCents) {
      await s.checkout.sessions.expire(session.id).catch(() => {});
      throw new Error(`Betragsabweichung: Stripe ${session.amount_total} ≠ Shop ${req.totalCents}`);
    }
    return { providerRef: session.id, redirectUrl: session.url };
  },

  async parseWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent> {
    const signature = headers.get("stripe-signature");
    if (!signature) throw new WebhookSignatureError("Signatur fehlt");
    let event: Stripe.Event;
    try {
      event = stripe().webhooks.constructEvent(rawBody, signature, env().STRIPE_WEBHOOK_SECRET!);
    } catch {
      throw new WebhookSignatureError();
    }
    switch (event.type) {
      case "checkout.session.completed":
      case "checkout.session.async_payment_succeeded": {
        const session = event.data.object;
        if (session.payment_status !== "paid") return { id: event.id, kind: "ignored", type: `${event.type}:${session.payment_status}` };
        return {
          id: event.id,
          kind: "payment.succeeded",
          providerRef: session.id,
          orderId: session.metadata?.orderId ?? session.client_reference_id ?? null,
          providerPaymentId: typeof session.payment_intent === "string" ? session.payment_intent : session.payment_intent?.id ?? null,
          amountCents: session.amount_total ?? 0,
          currency: session.currency ?? "eur",
          method: session.payment_method_types?.[0] ?? null,
        };
      }
      case "checkout.session.async_payment_failed":
        return { id: event.id, kind: "payment.failed", providerRef: event.data.object.id, orderId: event.data.object.metadata?.orderId ?? null };
      case "checkout.session.expired":
        return { id: event.id, kind: "payment.expired", providerRef: event.data.object.id, orderId: event.data.object.metadata?.orderId ?? null };
      case "charge.refunded": {
        const charge = event.data.object;
        return {
          id: event.id,
          kind: "refund.updated",
          providerPaymentId: typeof charge.payment_intent === "string" ? charge.payment_intent : charge.payment_intent?.id ?? null,
          providerRef: null,
          refundedTotalCents: charge.amount_refunded,
        };
      }
      default:
        return { id: event.id, kind: "ignored", type: event.type };
    }
  },

  async refund({ providerPaymentId, amountCents, orderId, idempotencyKey }) {
    if (!providerPaymentId) throw new Error("Keine Zahlungsreferenz für die Erstattung vorhanden.");
    const refund = await stripe().refunds.create(
      { payment_intent: providerPaymentId, amount: amountCents, metadata: { orderId } },
      { idempotencyKey },
    );
    return { refundId: refund.id };
  },
};
