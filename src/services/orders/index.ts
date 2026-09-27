import "server-only";
import { and, asc, eq, isNull, lt, or, sql } from "drizzle-orm";
import { concentrationLabel } from "@/config/catalog";
import { fail, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { computeTotals, evaluateCoupon } from "@/lib/commerce/pricing";
import { methodsForCountry } from "@/lib/commerce/shipping";
import { checkoutSchema, type AddressInput } from "@/lib/validation/checkout";
import { getCurrentUser } from "@/services/auth/session";
import { invalidate, TAGS } from "@/services/cache";
import { clearCart, loadLines, pricingLines, resolveCartId } from "@/services/cart";
import { findCoupon, priorRedemptions } from "@/services/cart/coupons";
import { db } from "@/services/db";
import {
  cartSamples,
  carts,
  couponRedemptions,
  coupons,
  orderEvents,
  orderItems,
  orders,
  orderSamples,
  payments,
  productImages,
  products,
  productVariants,
  samples,
  type OrderAddress,
} from "@/services/db/schema";
import { siteUrl } from "@/services/email";
import { subscribeNewsletter } from "@/services/newsletter";
import { availablePaymentMethods, getPaymentProvider } from "@/services/payments";
import { randomToken } from "@/services/security/crypto";
import { rateLimit, rateLimitMessage } from "@/services/security/rate-limit";
import { clientKey } from "@/services/security/request";
import { getSettingsFresh } from "@/services/settings";
import { sendOrderConfirmation } from "./notifications";

const RESERVATION_MINUTES = 35;

class CheckoutError extends Error {}

function toOrderAddress(a: AddressInput): OrderAddress {
  return {
    firstName: a.firstName,
    lastName: a.lastName,
    company: a.company,
    street: a.street,
    houseNumber: a.houseNumber,
    addressLine2: a.addressLine2,
    postalCode: a.postalCode,
    city: a.city,
    country: a.country,
    phone: a.phone,
  };
}

async function addEvent(
  tx: Pick<typeof db, "insert">,
  orderId: string,
  type: string,
  opts: { from?: string | null; to?: string | null; message?: string | null; actorUserId?: string | null } = {},
) {
  await tx.insert(orderEvents).values({
    orderId,
    type,
    fromStatus: (opts.from as never) ?? null,
    toStatus: (opts.to as never) ?? null,
    message: opts.message ?? null,
    actorUserId: opts.actorUserId ?? null,
  });
}

/* ------------------------------------------------------------------ */
/* Bestellung anlegen                                                  */
/* ------------------------------------------------------------------ */

export type PlaceOrderResult = { redirectUrl: string; publicToken: string; orderNumber: string };

/**
 * Legt aus dem aktuellen Warenkorb eine Bestellung an. Preise, Rabatte, Versand und Bestand
 * werden ausschließlich serverseitig ermittelt; Bestand wird atomar reserviert.
 */
export async function placeOrder(input: unknown): Promise<ActionResult<PlaceOrderResult>> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const data = parsed.data;

  const limit = await rateLimit(`checkout:${await clientKey()}`, 10, 600);
  if (!limit.ok) return fail(rateLimitMessage(limit));

  const settings = await getSettingsFresh();
  const user = await getCurrentUser();
  const cartId = await resolveCartId();
  if (!cartId) return fail("Ihr Warenkorb ist leer.");

  // Zahlungsart muss aktiviert sein.
  if (!availablePaymentMethods(settings).some((m) => m.id === data.paymentMethod)) {
    return fail("Diese Zahlungsart ist nicht verfügbar.", { paymentMethod: "Bitte wählen Sie eine verfügbare Zahlungsart." });
  }

  // Versand / Abholung prüfen.
  let shipping: { zoneId: string; methodId: string; name: string; deliveryTime: string; priceCents: number; freeFromCents: number | null } | null = null;
  if (data.fulfillment === "pickup") {
    if (!settings.pickup.enabled) return fail("Abholung ist derzeit nicht möglich.");
  } else {
    const address = data.shippingAddress!;
    const zone = settings.shipping.zones.find((z) => z.active && z.countries.includes(address.country));
    const method = methodsForCountry(settings, address.country).find((m) => m.id === data.shippingMethodId);
    if (!zone || !method) {
      return fail("In dieses Land liefern wir derzeit nicht.", { "shippingAddress.country": "In dieses Land liefern wir derzeit nicht." });
    }
    shipping = {
      zoneId: zone.id,
      methodId: method.id,
      name: method.carrier ? `${method.name} (${method.carrier})` : method.name,
      deliveryTime: method.deliveryTime,
      priceCents: method.priceCents,
      freeFromCents: method.freeFromCents,
    };
  }

  const lines = await loadLines(cartId);
  if (!lines.length) return fail("Ihr Warenkorb ist leer.");
  if (lines.some((l) => l.notice)) {
    return fail("Einige Artikel in Ihrem Warenkorb haben sich geändert. Bitte prüfen Sie Ihren Warenkorb.");
  }

  await releaseExpiredReservations();

  const billing = data.fulfillment === "shipping" && data.billingSameAsShipping ? data.shippingAddress! : data.billingAddress!;
  const [cart] = await db.select().from(carts).where(eq(carts.id, cartId));
  const selectedSamples = settings.samples.enabled
    ? await db.select({ sampleId: cartSamples.sampleId }).from(cartSamples).where(eq(cartSamples.cartId, cartId))
    : [];

  const publicToken = randomToken(24);
  let order: { id: string; number: string; totalCents: number; discountCents: number; shippingCents: number };
  let checkoutItems: { name: string; quantity: number; unitPriceCents: number }[] = [];

  try {
    order = await db.transaction(async (tx) => {
      // 1. Bestand atomar reservieren; der Preis kommt aus der Datenbank.
      const reserved: { variantId: string; priceCents: number; line: (typeof lines)[number] }[] = [];
      for (const line of lines) {
        const [row] = await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} - ${line.quantity}` })
          .where(
            and(
              eq(productVariants.id, line.variantId),
              eq(productVariants.active, true),
              sql`${productVariants.stock} >= ${line.quantity}`,
            ),
          )
          .returning({ priceCents: productVariants.priceCents });
        if (!row) {
          throw new CheckoutError(
            `${line.brandName} ${line.productName} (${line.displaySize}) ist nicht mehr in der gewünschten Menge verfügbar.`,
          );
        }
        reserved.push({ variantId: line.variantId, priceCents: row.priceCents, line });
      }

      const pLines = reserved.map((r) => ({
        variantId: r.variantId,
        productId: r.line.productId,
        brandId: r.line.brandId,
        unitPriceCents: r.priceCents,
        quantity: r.line.quantity,
      }));

      // 2. Gutschein erneut prüfen und Kontingent atomar belegen.
      let couponId: string | null = null;
      let discountCents = 0;
      if (cart?.couponCode) {
        const rule = await findCoupon(cart.couponCode);
        const prior = rule?.oncePerCustomer ? await priorRedemptions(rule.id, { email: data.email, userId: user?.id }) : 0;
        const check = evaluateCoupon(rule, pLines, { priorCustomerUses: prior });
        if (!check.ok || !rule) throw new CheckoutError(`Gutschein ${cart.couponCode}: ${check.ok ? "ungültig" : check.reason}`);
        const [used] = await tx
          .update(coupons)
          .set({ usageCount: sql`${coupons.usageCount} + 1` })
          .where(and(eq(coupons.id, rule.id), or(isNull(coupons.usageLimit), sql`${coupons.usageCount} < ${coupons.usageLimit}`)))
          .returning({ id: coupons.id });
        if (!used) throw new CheckoutError("Dieser Gutschein wurde bereits vollständig eingelöst.");
        couponId = rule.id;
        discountCents = check.discountCents;
      }

      // 3. Summen.
      const totals = computeTotals({
        lines: pLines,
        discountCents,
        shipping: shipping ? { priceCents: shipping.priceCents, freeFromCents: shipping.freeFromCents } : null,
        taxRatePercent: settings.shipping.taxRatePercent,
      });

      // 4. Bestellung.
      const [{ seq }] = await tx.execute<{ seq: string }>(sql`SELECT nextval('order_number_seq')::text AS seq`);
      const number = `PL-${seq}`;
      const [created] = await tx
        .insert(orders)
        .values({
          number,
          publicToken,
          userId: user?.id ?? null,
          cartId,
          email: data.email,
          phone: data.phone ?? billing.phone ?? null,
          status: "pending_payment",
          fulfillmentType: data.fulfillment,
          shippingAddress: data.fulfillment === "shipping" ? toOrderAddress(data.shippingAddress!) : null,
          billingAddress: toOrderAddress(billing),
          shippingMethod: shipping
            ? { zoneId: shipping.zoneId, methodId: shipping.methodId, name: shipping.name, deliveryTime: shipping.deliveryTime, priceCents: totals.shippingCents }
            : null,
          subtotalCents: totals.subtotalCents,
          discountCents: totals.discountCents,
          shippingCents: totals.shippingCents,
          taxCents: totals.taxCents,
          totalCents: totals.totalCents,
          couponId,
          couponCode: couponId ? cart!.couponCode : null,
          paymentMethod: data.paymentMethod,
          paymentProvider: getPaymentProvider().id,
          customerNote: data.customerNote,
          termsAcceptedAt: new Date(),
          reservationExpiresAt: new Date(Date.now() + RESERVATION_MINUTES * 60_000),
        })
        .returning({ id: orders.id, number: orders.number });

      await tx.insert(orderItems).values(
        reserved.map((r) => ({
          orderId: created.id,
          productId: r.line.productId,
          variantId: r.variantId,
          brandName: r.line.brandName,
          productName: r.line.productName,
          productSlug: r.line.slug,
          concentration: concentrationLabel(r.line.concentration),
          displaySize: r.line.displaySize,
          sku: "",
          imageUrl: r.line.imageUrl,
          unitPriceCents: r.priceCents,
          quantity: r.line.quantity,
          lineTotalCents: r.priceCents * r.line.quantity,
          taxRate: settings.shipping.taxRatePercent,
        })),
      );
      // SKU-Schnappschuss nachtragen.
      await tx.execute(sql`
        UPDATE order_items oi SET sku = v.sku FROM product_variants v
        WHERE oi.variant_id = v.id AND oi.order_id = ${created.id}
      `);

      if (couponId) {
        await tx.insert(couponRedemptions).values({ couponId, orderId: created.id, email: data.email, userId: user?.id ?? null });
      }

      // 5. Duftproben (nur wenn berechtigt, Bestand vorhanden; sonst still überspringen).
      const goods = totals.subtotalCents - totals.discountCents;
      if (settings.samples.enabled && goods >= settings.samples.minSubtotalCents && selectedSamples.length) {
        const ids = selectedSamples.map((s) => s.sampleId).slice(0, settings.samples.maxCount);
        for (const id of ids) {
          const [s] = await tx
            .update(samples)
            .set({ stock: sql`${samples.stock} - 1` })
            .where(and(eq(samples.id, id), eq(samples.active, true), sql`${samples.stock} > 0`))
            .returning({ brandName: samples.brandName, name: samples.name, sizeLabel: samples.sizeLabel });
          if (s) await tx.insert(orderSamples).values({ orderId: created.id, sampleId: id, label: `${s.brandName} ${s.name} (${s.sizeLabel})` });
        }
      }

      await tx.insert(payments).values({
        orderId: created.id,
        provider: getPaymentProvider().id,
        method: data.paymentMethod,
        status: "pending",
        amountCents: totals.totalCents,
      });
      await addEvent(tx, created.id, "created", { to: "pending_payment", message: "Bestellung angelegt, Zahlung ausstehend." });

      checkoutItems = reserved.map((r) => ({
        name: `${r.line.brandName} ${r.line.productName}, ${concentrationLabel(r.line.concentration)}, ${r.line.displaySize}`,
        quantity: r.line.quantity,
        unitPriceCents: r.priceCents,
      }));
      return { id: created.id, number, totalCents: totals.totalCents, discountCents: totals.discountCents, shippingCents: totals.shippingCents };
    });
  } catch (error) {
    if (error instanceof CheckoutError) return fail(error.message);
    console.error("[checkout] Bestellung fehlgeschlagen", error);
    return fail("Ihre Bestellung konnte nicht angelegt werden. Bitte versuchen Sie es erneut.");
  }

  invalidate(TAGS.catalog, TAGS.samples);

  if (data.newsletterOptIn) {
    await subscribeNewsletter(data.email, "checkout").catch(() => undefined);
  }

  // 6. Zahlungssitzung beim Provider eröffnen.
  try {
    const provider = getPaymentProvider();
    const session = await provider.createCheckout({
      orderId: order.id,
      orderNumber: order.number,
      publicToken,
      email: data.email,
      paymentMethod: data.paymentMethod,
      currency: "eur",
      totalCents: order.totalCents,
      discountCents: order.discountCents,
      shippingCents: order.shippingCents,
      shippingLabel: shipping?.name ?? "Versand",
      items: checkoutItems,
      successUrl: `${siteUrl()}/kasse/bestaetigung/${publicToken}`,
      cancelUrl: `${siteUrl()}/kasse/abgebrochen/${publicToken}`,
      expiresAt: new Date(Date.now() + 30 * 60_000 + 30_000),
    });
    await db.update(payments).set({ providerRef: session.providerRef }).where(eq(payments.orderId, order.id));
    return ok({ redirectUrl: session.redirectUrl, publicToken, orderNumber: order.number });
  } catch (error) {
    console.error("[checkout] Zahlungsstart fehlgeschlagen", error);
    await releaseReservation(order.id, "Zahlung konnte nicht gestartet werden.");
    return fail("Die Zahlung konnte nicht gestartet werden. Bitte versuchen Sie es erneut oder wählen Sie eine andere Zahlungsart.");
  }
}

/* ------------------------------------------------------------------ */
/* Reservierung freigeben                                              */
/* ------------------------------------------------------------------ */

/** Gibt Bestand, Proben und Gutschein-Kontingent einer unbezahlten Bestellung frei und storniert sie. */
export async function releaseReservation(orderId: string, reason: string, paymentStatus: "cancelled" | "expired" | "failed" = "cancelled") {
  const released = await db.transaction(async (tx) => {
    const [order] = await tx
      .update(orders)
      .set({ status: "cancelled", cancelledAt: new Date(), stockReleasedAt: new Date() })
      .where(and(eq(orders.id, orderId), eq(orders.status, "pending_payment"), isNull(orders.stockReleasedAt)))
      .returning({ id: orders.id, couponId: orders.couponId });
    if (!order) return false;

    const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, orderId));
    for (const item of items) {
      if (item.variantId) {
        await tx
          .update(productVariants)
          .set({ stock: sql`${productVariants.stock} + ${item.quantity}` })
          .where(eq(productVariants.id, item.variantId));
      }
    }
    const usedSamples = await tx.select().from(orderSamples).where(eq(orderSamples.orderId, orderId));
    for (const s of usedSamples) {
      if (s.sampleId) await tx.update(samples).set({ stock: sql`${samples.stock} + 1` }).where(eq(samples.id, s.sampleId));
    }
    if (order.couponId) {
      await tx.update(coupons).set({ usageCount: sql`greatest(${coupons.usageCount} - 1, 0)` }).where(eq(coupons.id, order.couponId));
      await tx.delete(couponRedemptions).where(eq(couponRedemptions.orderId, orderId));
    }
    await tx.update(payments).set({ status: paymentStatus }).where(and(eq(payments.orderId, orderId), eq(payments.status, "pending")));
    await addEvent(tx, orderId, "cancelled", { from: "pending_payment", to: "cancelled", message: reason });
    return true;
  });
  if (released) invalidate(TAGS.catalog, TAGS.samples);
  return released;
}

/** Abgelaufene Reservierungen freigeben (lazy beim Checkout und per Wartungs-Endpunkt). */
export async function releaseExpiredReservations() {
  const expired = await db
    .select({ id: orders.id })
    .from(orders)
    .where(and(eq(orders.status, "pending_payment"), lt(orders.reservationExpiresAt, new Date())))
    .limit(50);
  for (const o of expired) await releaseReservation(o.id, "Zahlung nicht innerhalb der Reservierungszeit abgeschlossen.", "expired");
  return expired.length;
}

/* ------------------------------------------------------------------ */
/* Zahlungsereignisse (nur aus verifizierten Webhooks)                 */
/* ------------------------------------------------------------------ */

async function paymentByRef(ref: { providerRef?: string | null; orderId?: string | null; providerPaymentId?: string | null }) {
  const conditions = [];
  if (ref.providerRef) conditions.push(eq(payments.providerRef, ref.providerRef));
  if (ref.orderId && /^[0-9a-f-]{36}$/i.test(ref.orderId)) conditions.push(eq(payments.orderId, ref.orderId));
  if (ref.providerPaymentId) conditions.push(eq(payments.providerPaymentId, ref.providerPaymentId));
  if (!conditions.length) return null;
  const [row] = await db.select().from(payments).where(or(...conditions)).limit(1);
  return row ?? null;
}

export async function markPaid(event: {
  providerRef: string | null;
  orderId: string | null;
  providerPaymentId: string | null;
  amountCents: number;
  currency: string;
  method: string | null;
}) {
  const payment = await paymentByRef(event);
  if (!payment) {
    console.error("[payment] Zahlung zu unbekannter Referenz", event.providerRef);
    return { handled: false };
  }
  if (event.amountCents !== payment.amountCents || event.currency.toLowerCase() !== "eur") {
    console.error("[payment] Betrag/Währung weicht ab", { expected: payment.amountCents, got: event.amountCents });
    await addEvent(db, payment.orderId, "payment_mismatch", {
      message: `Zahlung mit abweichendem Betrag gemeldet (${event.amountCents} statt ${payment.amountCents} Cent). Bitte manuell prüfen.`,
    });
    return { handled: false };
  }

  const result = await db.transaction(async (tx) => {
    const [order] = await tx.select().from(orders).where(eq(orders.id, payment.orderId)).for("update");
    if (!order) return null;
    if (order.status !== "pending_payment" && order.status !== "cancelled") return { order, changed: false };

    const late = order.status === "cancelled";
    if (late && order.stockReleasedAt) {
      // Zahlung kam nach Ablauf der Reservierung: Bestand erneut abbuchen und zur Prüfung markieren.
      const items = await tx.select().from(orderItems).where(eq(orderItems.orderId, order.id));
      for (const item of items) {
        if (item.variantId) {
          await tx.update(productVariants).set({ stock: sql`${productVariants.stock} - ${item.quantity}` }).where(eq(productVariants.id, item.variantId));
        }
      }
    }
    await tx
      .update(orders)
      .set({ status: "paid", paidAt: new Date(), cancelledAt: null, stockReleasedAt: null })
      .where(eq(orders.id, order.id));
    await tx
      .update(payments)
      .set({ status: "succeeded", providerPaymentId: event.providerPaymentId ?? payment.providerPaymentId, method: event.method ?? payment.method })
      .where(eq(payments.id, payment.id));
    await addEvent(tx, order.id, "paid", {
      from: order.status,
      to: "paid",
      message: late
        ? "Zahlung nach Ablauf der Reservierung eingegangen. Bestand bitte prüfen."
        : "Zahlung durch den Zahlungsanbieter bestätigt.",
    });
    // Beliebtheit aus echten Verkäufen.
    const items = await tx.select({ productId: orderItems.productId, quantity: orderItems.quantity }).from(orderItems).where(eq(orderItems.orderId, order.id));
    for (const item of items) {
      if (item.productId) await tx.update(products).set({ popularity: sql`${products.popularity} + ${item.quantity}` }).where(eq(products.id, item.productId));
    }
    return { order, changed: true };
  });

  if (!result?.changed) return { handled: true };
  if (result.order.cartId) await clearCart(result.order.cartId).catch(() => undefined);
  invalidate(TAGS.catalog);
  await sendOrderConfirmation(result.order.id).catch((e) => console.error("[email] Bestellbestätigung", e));
  return { handled: true };
}

export async function markPaymentFailed(event: { providerRef: string | null; orderId: string | null }, kind: "failed" | "expired") {
  const payment = await paymentByRef(event);
  if (!payment) return { handled: false };
  await releaseReservation(
    payment.orderId,
    kind === "expired" ? "Zahlungssitzung abgelaufen." : "Zahlung fehlgeschlagen.",
    kind === "expired" ? "expired" : "failed",
  );
  return { handled: true };
}

export async function applyRefundUpdate(event: { providerRef: string | null; providerPaymentId: string | null; refundedTotalCents: number }) {
  const payment = await paymentByRef(event);
  if (!payment) return { handled: false };
  const refunded = Math.min(event.refundedTotalCents, payment.amountCents);
  if (refunded <= payment.refundedCents) return { handled: true };
  const full = refunded >= payment.amountCents;
  const delta = refunded - payment.refundedCents;
  const [order] = await db.select().from(orders).where(eq(orders.id, payment.orderId));
  await db.transaction(async (tx) => {
    await tx
      .update(payments)
      .set({ refundedCents: refunded, status: full ? "refunded" : "partially_refunded" })
      .where(eq(payments.id, payment.id));
    const next = full ? "refunded" : ["returned", "partially_returned"].includes(order.status) ? order.status : "partially_refunded";
    await tx.update(orders).set({ status: next as never }).where(eq(orders.id, order.id));
    await addEvent(tx, order.id, "refund", {
      from: order.status,
      to: next,
      message: `Erstattung bestätigt: ${(delta / 100).toFixed(2).replace(".", ",")} € (gesamt ${(refunded / 100).toFixed(2).replace(".", ",")} €).`,
    });
  });
  const { sendRefundNotice } = await import("./notifications");
  await sendRefundNotice(order.id, delta, !full).catch(() => undefined);
  return { handled: true };
}

/* ------------------------------------------------------------------ */
/* Lesen                                                               */
/* ------------------------------------------------------------------ */

export async function getOrderView(where: { publicToken?: string; id?: string; number?: string }) {
  const condition = where.publicToken
    ? eq(orders.publicToken, where.publicToken)
    : where.id
      ? eq(orders.id, where.id)
      : eq(orders.number, where.number ?? "");
  const [order] = await db.select().from(orders).where(condition).limit(1);
  if (!order) return null;
  const [items, sampleRows, events, paymentRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, order.id)),
    db.select().from(orderSamples).where(eq(orderSamples.orderId, order.id)),
    db.select().from(orderEvents).where(eq(orderEvents.orderId, order.id)).orderBy(asc(orderEvents.createdAt)),
    db.select().from(payments).where(eq(payments.orderId, order.id)),
  ]);
  return { order, items, samples: sampleRows, events, payment: paymentRows[0] ?? null };
}

export type OrderView = NonNullable<Awaited<ReturnType<typeof getOrderView>>>;

/** Öffentliche Sendungsabfrage mit Bestellnummer + E-Mail (rate-limitiert). */
export async function lookupOrder(number: string, email: string): Promise<ActionResult<{ publicToken: string }>> {
  const limit = await rateLimit(`order-lookup:${await clientKey()}`, 10, 900);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  const [row] = await db
    .select({ publicToken: orders.publicToken })
    .from(orders)
    .where(and(eq(orders.number, number.trim().toUpperCase()), eq(orders.email, email.trim().toLowerCase())))
    .limit(1);
  if (!row) return fail("Wir konnten keine Bestellung mit diesen Angaben finden. Bitte prüfen Sie Bestellnummer und E-Mail-Adresse.");
  return ok({ publicToken: row.publicToken });
}

export async function productImageFor(productId: string) {
  const [img] = await db
    .select({ url: productImages.url })
    .from(productImages)
    .where(eq(productImages.productId, productId))
    .orderBy(asc(productImages.sortOrder))
    .limit(1);
  return img?.url ?? null;
}

