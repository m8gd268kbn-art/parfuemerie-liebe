import "server-only";
import { eq } from "drizzle-orm";
import { db } from "@/services/db";
import { orderItems, orders, orderSamples, type OrderAddress } from "@/services/db/schema";
import { sendEmail, siteUrl } from "@/services/email";
import {
  orderCancelledTemplate,
  orderConfirmationTemplate,
  refundTemplate,
  shippingConfirmationTemplate,
} from "@/services/email/templates";
import { paymentMethodLabel } from "@/services/payments";
import { COUNTRY_NAMES } from "@/lib/commerce/shipping";

export function addressLines(a: OrderAddress | null | undefined): string[] {
  if (!a) return [];
  return [
    `${a.firstName} ${a.lastName}`,
    a.company ?? "",
    `${a.street} ${a.houseNumber}`,
    a.addressLine2 ?? "",
    `${a.postalCode} ${a.city}`,
    COUNTRY_NAMES[a.country] ?? a.country,
  ].filter(Boolean);
}

export function statusUrl(publicToken: string) {
  return `${siteUrl()}/bestellung/${publicToken}`;
}

/** Tracking-Link je Versanddienstleister (sofern bekannt). */
export function trackingUrl(carrier: string | null, trackingNumber: string | null) {
  if (!trackingNumber) return null;
  const n = encodeURIComponent(trackingNumber);
  switch ((carrier ?? "").toLowerCase()) {
    case "dhl":
      return `https://www.dhl.de/de/privatkunden/pakete-empfangen/verfolgen.html?piececode=${n}`;
    case "dpd":
      return `https://tracking.dpd.de/status/de_DE/parcel/${n}`;
    case "hermes":
      return `https://www.myhermes.de/empfangen/sendungsverfolgung/sendungsinformation#${n}`;
    case "gls":
      return `https://gls-group.com/DE/de/paketverfolgung?match=${n}`;
    case "ups":
      return `https://www.ups.com/track?loc=de_DE&tracknum=${n}`;
    default:
      return null;
  }
}

export async function sendOrderConfirmation(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return;
  const [items, sampleRows] = await Promise.all([
    db.select().from(orderItems).where(eq(orderItems.orderId, orderId)),
    db.select().from(orderSamples).where(eq(orderSamples.orderId, orderId)),
  ]);
  const pickup = order.fulfillmentType === "pickup";
  await sendEmail(
    order.email,
    orderConfirmationTemplate(siteUrl(), {
      number: order.number,
      email: order.email,
      firstName: order.billingAddress.firstName,
      createdAt: order.createdAt,
      items: items.map((i) => ({
        brandName: i.brandName,
        productName: `${i.productName}, ${i.concentration}`,
        displaySize: i.displaySize,
        quantity: i.quantity,
        lineTotalCents: i.lineTotalCents,
      })),
      samples: sampleRows.map((s) => s.label),
      subtotalCents: order.subtotalCents,
      discountCents: order.discountCents,
      shippingCents: order.shippingCents,
      totalCents: order.totalCents,
      taxCents: order.taxCents,
      paymentMethodLabel: paymentMethodLabel(order.paymentMethod),
      addressLines: pickup ? ["Abholung in der Parfümerie Liebe, Hannover"] : addressLines(order.shippingAddress),
      fulfillmentLabel: pickup ? "Abholung" : "Lieferadresse",
      statusUrl: statusUrl(order.publicToken),
    }),
  );
}

export async function sendShippingNotice(orderId: string) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return;
  await sendEmail(
    order.email,
    shippingConfirmationTemplate(siteUrl(), {
      number: order.number,
      firstName: order.billingAddress.firstName,
      carrier: order.carrier,
      trackingNumber: order.trackingNumber,
      trackingUrl: trackingUrl(order.carrier, order.trackingNumber),
      statusUrl: statusUrl(order.publicToken),
    }),
  );
}

export async function sendCancellationNotice(orderId: string, paid: boolean) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return;
  await sendEmail(order.email, orderCancelledTemplate(siteUrl(), { number: order.number, firstName: order.billingAddress.firstName, paid }));
}

export async function sendRefundNotice(orderId: string, amountCents: number, partial: boolean) {
  const [order] = await db.select().from(orders).where(eq(orders.id, orderId));
  if (!order) return;
  await sendEmail(order.email, refundTemplate(siteUrl(), { number: order.number, firstName: order.billingAddress.firstName, amountCents, partial }));
}
