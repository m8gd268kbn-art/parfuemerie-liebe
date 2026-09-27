import "server-only";
import { db } from "@/services/db";
import { paymentEvents } from "@/services/db/schema";
import { applyRefundUpdate, markPaid, markPaymentFailed } from "@/services/orders";
import type { PaymentProvider } from "./types";
import { WebhookSignatureError } from "./types";

/**
 * Gemeinsame Webhook-Verarbeitung: Signatur prüfen → Idempotenz sichern → Ereignis anwenden.
 * Eine Bestellung wird ausschließlich hier als bezahlt markiert.
 */
export async function handlePaymentWebhook(provider: PaymentProvider, request: Request): Promise<Response> {
  const rawBody = await request.text();
  let event;
  try {
    event = await provider.parseWebhook(rawBody, request.headers);
  } catch (error) {
    if (error instanceof WebhookSignatureError) return new Response("Ungültige Signatur", { status: 400 });
    console.error("[webhook] Parsing fehlgeschlagen", error);
    return new Response("Ungültige Anfrage", { status: 400 });
  }

  // Jedes Ereignis genau einmal verarbeiten (Provider stellen Webhooks ggf. mehrfach zu).
  const inserted = await db
    .insert(paymentEvents)
    .values({ id: `${provider.id}:${event.id}`, provider: provider.id, type: event.kind })
    .onConflictDoNothing()
    .returning({ id: paymentEvents.id });
  if (!inserted.length) return Response.json({ received: true, duplicate: true });

  try {
    switch (event.kind) {
      case "payment.succeeded":
        await markPaid(event);
        break;
      case "payment.failed":
        await markPaymentFailed(event, "failed");
        break;
      case "payment.expired":
        await markPaymentFailed(event, "expired");
        break;
      case "refund.updated":
        await applyRefundUpdate(event);
        break;
      default:
        break;
    }
  } catch (error) {
    // Idempotenz-Eintrag entfernen, damit der Provider erneut zustellen kann.
    const { eq } = await import("drizzle-orm");
    await db.delete(paymentEvents).where(eq(paymentEvents.id, `${provider.id}:${event.id}`));
    console.error("[webhook] Verarbeitung fehlgeschlagen", error);
    return new Response("Verarbeitung fehlgeschlagen", { status: 500 });
  }
  return Response.json({ received: true });
}
