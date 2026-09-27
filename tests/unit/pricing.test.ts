import { describe, expect, it } from "vitest";
import { clampQuantity, computeTotals, evaluateCoupon, includedTax, type CouponRule, type PricingLine } from "@/lib/commerce/pricing";

const line = (over: Partial<PricingLine> = {}): PricingLine => ({ variantId: "v1", productId: "p1", brandId: "b1", unitPriceCents: 10000, quantity: 1, ...over });
const coupon = (over: Partial<CouponRule> = {}): CouponRule => ({
  id: "c1", code: "TEST", type: "percent", value: 10, minSubtotalCents: null, startsAt: null, expiresAt: null,
  usageLimit: null, usageCount: 0, oncePerCustomer: false, productIds: [], brandIds: [], active: true, ...over,
});

describe("computeTotals", () => {
  const shipping = { priceCents: 495, freeFromCents: 4900 };

  it("berechnet Versand unterhalb der Freigrenze und die enthaltene MwSt.", () => {
    const t = computeTotals({ lines: [line({ unitPriceCents: 3000 })], shipping, taxRatePercent: 19 });
    expect(t).toMatchObject({ subtotalCents: 3000, shippingCents: 495, totalCents: 3495, freeShippingRemainingCents: 1900 });
    expect(t.taxCents).toBe(includedTax(3495, 19));
    expect(t.taxCents).toBe(558);
  });

  it("versendet ab der Freigrenze kostenlos (nach Rabatt gerechnet)", () => {
    expect(computeTotals({ lines: [line({ unitPriceCents: 4900 })], shipping, taxRatePercent: 19 }).shippingCents).toBe(0);
    const discounted = computeTotals({ lines: [line({ unitPriceCents: 5000 })], discountCents: 500, shipping, taxRatePercent: 19 });
    expect(discounted.shippingCents).toBe(495);
    expect(discounted.totalCents).toBe(4995);
  });

  it("begrenzt den Rabatt auf den Warenwert und berechnet keinen Versand für leere Warenkörbe", () => {
    expect(computeTotals({ lines: [line({ unitPriceCents: 1000 })], discountCents: 5000, shipping: null, taxRatePercent: 19 }).totalCents).toBe(0);
    expect(computeTotals({ lines: [], shipping, taxRatePercent: 19 }).shippingCents).toBe(0);
  });
});

describe("evaluateCoupon", () => {
  const now = new Date("2026-09-27T12:00:00Z");

  it("rabattiert prozentual und fest, nie über den Warenwert hinaus", () => {
    expect(evaluateCoupon(coupon(), [line()], { now })).toEqual({ ok: true, discountCents: 1000, eligibleSubtotalCents: 10000 });
    expect(evaluateCoupon(coupon({ type: "fixed", value: 25000 }), [line()], { now })).toMatchObject({ ok: true, discountCents: 10000 });
  });

  it("prüft Aktivierung, Laufzeit, Kontingent und Mehrfachnutzung", () => {
    expect(evaluateCoupon(null, [line()], { now }).ok).toBe(false);
    expect(evaluateCoupon(coupon({ active: false }), [line()], { now }).ok).toBe(false);
    expect(evaluateCoupon(coupon({ startsAt: new Date("2026-10-01") }), [line()], { now }).ok).toBe(false);
    expect(evaluateCoupon(coupon({ expiresAt: new Date("2026-09-01") }), [line()], { now }).ok).toBe(false);
    expect(evaluateCoupon(coupon({ usageLimit: 5, usageCount: 5 }), [line()], { now }).ok).toBe(false);
    expect(evaluateCoupon(coupon({ oncePerCustomer: true }), [line()], { now, priorCustomerUses: 1 }).ok).toBe(false);
    expect(evaluateCoupon(coupon({ oncePerCustomer: true }), [line()], { now, priorCustomerUses: 0 }).ok).toBe(true);
  });

  it("nennt den fehlenden Betrag bis zum Mindestbestellwert", () => {
    const r = evaluateCoupon(coupon({ minSubtotalCents: 15000 }), [line()], { now });
    expect(r).toEqual({ ok: false, reason: expect.stringContaining("Es fehlen noch 50,00 €") });
  });

  it("rabattiert bei Marken- oder Produktbeschränkung nur passende Artikel", () => {
    const lines = [line({ brandId: "b1", unitPriceCents: 10000 }), line({ variantId: "v2", productId: "p2", brandId: "b2", unitPriceCents: 20000 })];
    expect(evaluateCoupon(coupon({ brandIds: ["b2"] }), lines, { now })).toMatchObject({ ok: true, discountCents: 2000, eligibleSubtotalCents: 20000 });
    expect(evaluateCoupon(coupon({ productIds: ["p9"] }), lines, { now }).ok).toBe(false);
  });
});

describe("clampQuantity", () => {
  it("begrenzt auf Bestand und Maximum pro Position", () => {
    expect(clampQuantity(3, 5)).toBe(3);
    expect(clampQuantity(8, 5)).toBe(5);
    expect(clampQuantity(50, 100)).toBe(10);
    expect(clampQuantity(2, 0)).toBe(0);
    expect(clampQuantity(0, 5)).toBe(1);
  });
});
