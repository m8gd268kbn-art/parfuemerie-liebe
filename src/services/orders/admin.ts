import "server-only";
import { and, eq, sql } from "drizzle-orm";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { canTransition, ORDER_STATUS, type OrderStatus } from "@/lib/commerce/order-status";
import { invalidate, TAGS } from "@/services/cache";
import { db } from "@/services/db";
import { orderEvents, orderItems, orders, payments, productVariants } from "@/services/db/schema";
import { providerById } from "@/services/payments";
import { deliverTestWebhook } from "@/services/payments/test-provider";
import { releaseReservation } from "./index";
import { sendCancellationNotice, sendShippingNotice } from "./notifications";

/** Statuswechsel durch das Team. Zahlungs-/Erstattungsstatus kommen ausschließlich per Webhook. */
export async function updateOrderStatus(
  orderId: string,
  to: OrderStatus,
  actorUserId: string,
  opts: { trackingNumber?: string | null; carrier?: string | null; note?: string | null; restock?: boolean } = {},
): Promise<ActionResult> {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return fail("Bestellung nicht gefunden.");
  if (!canTransition(order.status, to)) {
    return fail(`Von „${ORDER_STATUS[order.status].label}“ nach „${ORDER_STATUS[to].label}“ ist kein Wechsel möglich.`);
  }

  if (order.status === "pending_payment" && to === "cancelled") {
    await releaseReservation(orderId, opts.note || "Vom Team storniert.");
    await sendCancellationNotice(orderId, false).catch(() => undefined);
    return ok(undefined, "Bestellung storniert, Bestand freigegeben.");
  }

  await db.transaction(async (tx) => {
    const patch: Partial<typeof orders.$inferInsert> = { status: to };
    if (to === "shipped") {
      patch.shippedAt = new Date();
      if (opts.trackingNumber !== undefined) patch.trackingNumber = opts.trackingNumber || null;
      if (opts.carrier !== undefined) patch.carrier = opts.carrier || null;
    }
    if (to === "delivered") patch.deliveredAt = new Date();
    if (to === "cancelled") patch.cancelledAt = new Date();
    await tx.update(orders).set(patch).where(eq(orders.id, orderId));

    // Storno einer bezahlten Bestellung: Ware zurück in den Bestand (Erstattung separat über den Provider).
    if (to === "cancelled" && opts.restock !== false) {
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
      for (const item of items) {
        if (item.variantId) {
          await tx.update(productVariants).set({ stock: sql`${productVariants.stock} + ${item.quantity}` }).where(eq(productVariants.id, item.variantId));
        }
      }
    }
    await tx.insert(orderEvents).values({
      orderId,
      type: "status",
      fromStatus: order.status,
      toStatus: to,
      message: opts.note || null,
      actorUserId,
    });
  });

  if (to === "cancelled") invalidate(TAGS.catalog);
  if (to === "shipped") await sendShippingNotice(orderId).catch(() => undefined);
  if (to === "cancelled") await sendCancellationNotice(orderId, true).catch(() => undefined);
  return ok(undefined, `Status auf „${ORDER_STATUS[to].label}“ gesetzt.`);
}

export async function updateTracking(orderId: string, trackingNumber: string | null, carrier: string | null, actorUserId: string): Promise<ActionResult> {
  const [row] = await db
    .update(orders)
    .set({ trackingNumber: trackingNumber || null, carrier: carrier || null })
    .where(eq(orders.id, orderId))
    .returning({ id: orders.id });
  if (!row) return fail("Bestellung nicht gefunden.");
  await db.insert(orderEvents).values({
    orderId,
    type: "tracking",
    message: trackingNumber ? `Sendungsnummer: ${carrier ? `${carrier} ` : ""}${trackingNumber}` : "Sendungsnummer entfernt.",
    actorUserId,
  });
  return ok(undefined, "Sendungsdaten gespeichert.");
}

/**
 * Erstattung ausschließlich über die API des Zahlungsanbieters. Der Bestellstatus ändert sich
 * erst, wenn der Anbieter die Erstattung per Webhook bestätigt.
 */
export async function refundOrder(orderId: string, amountCents: number, actorUserId: string): Promise<ActionResult> {
  const [payment] = await db
    .select()
    .from(payments)
    .where(and(eq(payments.orderId, orderId), sql`${payments.status} in ('succeeded', 'partially_refunded')`))
    .limit(1);
  if (!payment) return fail("Für diese Bestellung gibt es keine erstattbare Zahlung.");
  const refundable = payment.amountCents - payment.refundedCents;
  if (!Number.isInteger(amountCents) || amountCents <= 0 || amountCents > refundable) {
    return fail(`Der Betrag muss zwischen 0,01 € und ${(refundable / 100).toFixed(2).replace(".", ",")} € liegen.`);
  }
  const provider = providerById(payment.provider);
  if (!provider) return fail("Der Zahlungsanbieter dieser Bestellung ist nicht konfiguriert.");

  try {
    const { refundId } = await provider.refund({
      providerPaymentId: payment.providerPaymentId,
      providerRef: payment.providerRef,
      amountCents,
      orderId,
      idempotencyKey: `refund-${orderId}-${payment.refundedCents}-${amountCents}`,
    });
    await db.insert(orderEvents).values({
      orderId,
      type: "refund_requested",
      message: `Erstattung über ${(amountCents / 100).toFixed(2).replace(".", ",")} € beim Zahlungsanbieter angestoßen (${refundId}).`,
      actorUserId,
    });
    if (provider.id === "test" && payment.providerRef) {
      await deliverTestWebhook({
        id: `evt_${refundId}`,
        type: "refund.updated",
        providerRef: payment.providerRef,
        refundedTotalCents: payment.refundedCents + amountCents,
      });
    }
    return ok(undefined, "Erstattung angestoßen. Der Status aktualisiert sich nach Bestätigung durch den Zahlungsanbieter.");
  } catch (error) {
    console.error("[refund] fehlgeschlagen", error);
    return fail("Die Erstattung konnte nicht ausgelöst werden. Bitte im Dashboard des Zahlungsanbieters prüfen.");
  }
}
