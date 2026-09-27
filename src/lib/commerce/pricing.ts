/**
 * Reine Preislogik (ohne Datenbank). Wird serverseitig für Warenkorb, Checkout und Bestellung
 * verwendet. Clientseitige Preise sind nur Anzeige, nie Grundlage einer Bestellung.
 */

export type PricingLine = {
  variantId: string;
  productId: string;
  brandId: string;
  unitPriceCents: number;
  quantity: number;
};

export type CouponRule = {
  id: string;
  code: string;
  type: "percent" | "fixed";
  value: number;
  minSubtotalCents: number | null;
  startsAt: Date | null;
  expiresAt: Date | null;
  usageLimit: number | null;
  usageCount: number;
  oncePerCustomer: boolean;
  productIds: string[];
  brandIds: string[];
  active: boolean;
};

export type CouponCheck =
  | { ok: true; discountCents: number; eligibleSubtotalCents: number }
  | { ok: false; reason: string };

export function lineTotal(line: PricingLine) {
  return line.unitPriceCents * line.quantity;
}

export function subtotal(lines: PricingLine[]) {
  return lines.reduce((sum, l) => sum + lineTotal(l), 0);
}

function isEligible(line: PricingLine, coupon: CouponRule) {
  const productOk = coupon.productIds.length === 0 || coupon.productIds.includes(line.productId);
  const brandOk = coupon.brandIds.length === 0 || coupon.brandIds.includes(line.brandId);
  return productOk && brandOk;
}

/**
 * Prüft einen Gutschein gegen den Warenkorb. `priorCustomerUses` = bisherige Einlösungen
 * dieser Kundin/dieses Kunden (nur relevant bei „einmal pro Kunde“).
 */
export function evaluateCoupon(
  coupon: CouponRule | null,
  lines: PricingLine[],
  opts: { now?: Date; priorCustomerUses?: number } = {},
): CouponCheck {
  if (!coupon || !coupon.active) return { ok: false, reason: "Dieser Gutscheincode ist nicht gültig." };
  const now = opts.now ?? new Date();
  if (coupon.startsAt && coupon.startsAt > now) return { ok: false, reason: "Dieser Gutschein ist noch nicht gültig." };
  if (coupon.expiresAt && coupon.expiresAt < now) return { ok: false, reason: "Dieser Gutschein ist abgelaufen." };
  if (coupon.usageLimit != null && coupon.usageCount >= coupon.usageLimit) {
    return { ok: false, reason: "Dieser Gutschein wurde bereits vollständig eingelöst." };
  }
  if (coupon.oncePerCustomer && (opts.priorCustomerUses ?? 0) > 0) {
    return { ok: false, reason: "Sie haben diesen Gutschein bereits eingelöst." };
  }
  const total = subtotal(lines);
  if (coupon.minSubtotalCents != null && total < coupon.minSubtotalCents) {
    const missing = coupon.minSubtotalCents - total;
    return {
      ok: false,
      reason: `Dieser Gutschein gilt ab einem Warenwert von ${(coupon.minSubtotalCents / 100)
        .toFixed(2)
        .replace(".", ",")} €. Es fehlen noch ${(missing / 100).toFixed(2).replace(".", ",")} €.`,
    };
  }
  const eligible = lines.filter((l) => isEligible(l, coupon));
  const eligibleSubtotal = subtotal(eligible);
  if (eligibleSubtotal <= 0) {
    return { ok: false, reason: "Dieser Gutschein gilt nicht für die Artikel in Ihrem Warenkorb." };
  }
  const raw =
    coupon.type === "percent"
      ? Math.round((eligibleSubtotal * Math.min(100, Math.max(0, coupon.value))) / 100)
      : Math.max(0, coupon.value);
  return { ok: true, discountCents: Math.min(raw, eligibleSubtotal), eligibleSubtotalCents: eligibleSubtotal };
}

export type ShippingQuote = { priceCents: number; freeFromCents: number | null };

export type Totals = {
  subtotalCents: number;
  discountCents: number;
  shippingCents: number;
  totalCents: number;
  /** Enthaltene Umsatzsteuer. */
  taxCents: number;
  /** Fehlender Betrag bis zur Versandkostenfreiheit (null = nicht anwendbar). */
  freeShippingRemainingCents: number | null;
};

/** Enthaltene MwSt. aus einem Bruttobetrag. */
export function includedTax(grossCents: number, ratePercent: number) {
  if (ratePercent <= 0) return 0;
  return Math.round(grossCents - grossCents / (1 + ratePercent / 100));
}

export function computeTotals(input: {
  lines: PricingLine[];
  discountCents?: number;
  shipping: ShippingQuote | null;
  taxRatePercent: number;
}): Totals {
  const sub = subtotal(input.lines);
  const discount = Math.min(input.discountCents ?? 0, sub);
  const goods = sub - discount;
  let shippingCents = 0;
  let remaining: number | null = null;
  if (input.shipping && input.lines.length > 0) {
    const free = input.shipping.freeFromCents != null && goods >= input.shipping.freeFromCents;
    shippingCents = free ? 0 : input.shipping.priceCents;
    remaining = input.shipping.freeFromCents != null ? Math.max(0, input.shipping.freeFromCents - goods) : null;
  }
  const total = goods + shippingCents;
  return {
    subtotalCents: sub,
    discountCents: discount,
    shippingCents,
    totalCents: total,
    taxCents: includedTax(total, input.taxRatePercent),
    freeShippingRemainingCents: remaining,
  };
}

export const MAX_QUANTITY_PER_LINE = 10;

/** Menge auf 1…min(Bestand, Maximum) begrenzen. */
export function clampQuantity(requested: number, stock: number) {
  const max = Math.min(stock, MAX_QUANTITY_PER_LINE);
  if (max <= 0) return 0;
  return Math.max(1, Math.min(Math.floor(requested), max));
}
