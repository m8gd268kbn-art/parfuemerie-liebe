export type CheckoutRequest = {
  orderId: string;
  orderNumber: string;
  publicToken: string;
  email: string;
  paymentMethod: string;
  currency: "eur";
  totalCents: number;
  discountCents: number;
  shippingCents: number;
  shippingLabel: string;
  items: { name: string; quantity: number; unitPriceCents: number }[];
  successUrl: string;
  cancelUrl: string;
  expiresAt: Date;
};

export type CheckoutSession = { providerRef: string; redirectUrl: string };

/** Vereinheitlichte Webhook-Ereignisse aller Zahlungsanbieter. */
export type PaymentEvent =
  | {
      id: string;
      kind: "payment.succeeded";
      providerRef: string | null;
      orderId: string | null;
      providerPaymentId: string | null;
      amountCents: number;
      currency: string;
      method: string | null;
    }
  | { id: string; kind: "payment.failed" | "payment.expired"; providerRef: string | null; orderId: string | null }
  | { id: string; kind: "refund.updated"; providerPaymentId: string | null; providerRef: string | null; refundedTotalCents: number }
  | { id: string; kind: "ignored"; type: string };

export interface PaymentProvider {
  readonly id: "stripe" | "test";
  createCheckout(request: CheckoutRequest): Promise<CheckoutSession>;
  /** Prüft die Signatur und liefert das Ereignis. Wirft bei ungültiger Signatur. */
  parseWebhook(rawBody: string, headers: Headers): Promise<PaymentEvent>;
  /** Erstattung ausschließlich über die Provider-API. */
  refund(input: {
    providerPaymentId: string | null;
    providerRef: string | null;
    amountCents: number;
    orderId: string;
    idempotencyKey: string;
  }): Promise<{ refundId: string }>;
}

export class WebhookSignatureError extends Error {
  constructor(message = "Ungültige Webhook-Signatur") {
    super(message);
    this.name = "WebhookSignatureError";
  }
}
