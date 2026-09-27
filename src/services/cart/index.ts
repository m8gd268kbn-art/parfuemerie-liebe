import "server-only";
import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import { cookies } from "next/headers";
import { concentrationLabel } from "@/config/catalog";
import { fail, ok, type ActionResult } from "@/lib/action-result";
import { clampQuantity, computeTotals, evaluateCoupon, MAX_QUANTITY_PER_LINE, type PricingLine, type Totals } from "@/lib/commerce/pricing";
import { defaultMethod } from "@/lib/commerce/shipping";
import { formatPrice, formatSize } from "@/lib/format";
import type { ShopSettings } from "@/lib/settings-schema";
import { getCurrentUser } from "@/services/auth/session";
import { getSamples } from "@/services/catalog";
import { db } from "@/services/db";
import { brands, cartItems, carts, cartSamples, productImages, products, productVariants, samples } from "@/services/db/schema";
import { rateLimit, rateLimitMessage } from "@/services/security/rate-limit";
import { clientKey } from "@/services/security/request";
import { getSettingsFresh } from "@/services/settings";
import type { SampleDTO } from "@/types/catalog";
import { findCoupon, normalizeCode, priorRedemptions } from "./coupons";

export const CART_COOKIE = "pl_cart";
const CART_DAYS = 60;

export type CartLine = {
  variantId: string;
  productId: string;
  brandId: string;
  slug: string;
  brandName: string;
  productName: string;
  concentration: string;
  concentrationLabel: string;
  sizeMl: number;
  displaySize: string;
  imageUrl: string | null;
  imageAlt: string;
  unitPriceCents: number;
  compareAtPriceCents: number | null;
  quantity: number;
  lineTotalCents: number;
  stock: number;
  maxQuantity: number;
  available: boolean;
  notice: string | null;
};

export type CartView = {
  id: string | null;
  lines: CartLine[];
  itemCount: number;
  totals: Totals;
  coupon: { code: string; applied: boolean; message: string | null } | null;
  shipping: { name: string; deliveryTime: string; priceCents: number; freeFromCents: number | null } | null;
  samples: {
    enabled: boolean;
    max: number;
    minSubtotalCents: number;
    eligible: boolean;
    selectedIds: string[];
    options: SampleDTO[];
  };
  hasIssues: boolean;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/* ------------------------------------------------------------------ */
/* Warenkorb finden / anlegen                                          */
/* ------------------------------------------------------------------ */

async function cookieCartId(): Promise<string | null> {
  const id = (await cookies()).get(CART_COOKIE)?.value;
  return id && UUID.test(id) ? id : null;
}

async function setCartCookie(id: string) {
  (await cookies()).set(CART_COOKIE, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: CART_DAYS * 86_400,
  });
}

/** Warenkorb der aktuellen Person (Konto oder Gast-Cookie). */
export async function resolveCartId(): Promise<string | null> {
  const user = await getCurrentUser();
  if (user) {
    const [row] = await db
      .select({ id: carts.id })
      .from(carts)
      .where(eq(carts.userId, user.id))
      .orderBy(desc(carts.updatedAt))
      .limit(1);
    if (row) return row.id;
  }
  const id = await cookieCartId();
  if (!id) return null;
  const [row] = await db.select({ id: carts.id, userId: carts.userId }).from(carts).where(eq(carts.id, id)).limit(1);
  if (!row) return null;
  // Ein Gast-Cookie darf nie auf den Warenkorb eines anderen Kontos zeigen.
  if (row.userId && row.userId !== user?.id) return null;
  return row.id;
}

async function ensureCart(): Promise<string> {
  const existing = await resolveCartId();
  if (existing) return existing;
  const user = await getCurrentUser();
  const [row] = await db.insert(carts).values({ userId: user?.id ?? null }).returning({ id: carts.id });
  await setCartCookie(row.id);
  return row.id;
}

async function touch(cartId: string) {
  await db.update(carts).set({ updatedAt: new Date() }).where(eq(carts.id, cartId));
}

/* ------------------------------------------------------------------ */
/* Lesen                                                               */
/* ------------------------------------------------------------------ */

export async function loadLines(cartId: string): Promise<CartLine[]> {
  const rows = await db
    .select({
      quantity: cartItems.quantity,
      variant: productVariants,
      product: {
        id: products.id,
        slug: products.slug,
        name: products.name,
        concentration: products.concentration,
        active: products.active,
      },
      brand: { id: brands.id, name: brands.name, active: brands.active },
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.variantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(eq(cartItems.cartId, cartId))
    .orderBy(asc(cartItems.createdAt));
  if (!rows.length) return [];

  const productIds = [...new Set(rows.map((r) => r.product.id))];
  const images = await db
    .select({ productId: productImages.productId, url: productImages.url, alt: productImages.alt, kind: productImages.kind })
    .from(productImages)
    .where(inArray(productImages.productId, productIds))
    .orderBy(asc(productImages.sortOrder));
  const imageByProduct = new Map<string, { url: string; alt: string }>();
  for (const img of images) if (!imageByProduct.has(img.productId)) imageByProduct.set(img.productId, img);

  return rows.map(({ quantity, variant, product, brand }) => {
    const sellable = variant.active && product.active && brand.active;
    const stock = Math.max(0, variant.stock);
    const available = sellable && stock > 0;
    const effectiveQty = available ? Math.min(quantity, stock, MAX_QUANTITY_PER_LINE) : quantity;
    let notice: string | null = null;
    if (!sellable) notice = "Dieser Artikel ist nicht mehr erhältlich.";
    else if (stock === 0) notice = "Diese Größe ist derzeit ausverkauft.";
    else if (quantity > stock) notice = `Nur noch ${stock} Stück verfügbar. Die Menge wurde angepasst.`;
    const image = imageByProduct.get(product.id);
    return {
      variantId: variant.id,
      productId: product.id,
      brandId: brand.id,
      slug: product.slug,
      brandName: brand.name,
      productName: product.name,
      concentration: product.concentration,
      concentrationLabel: concentrationLabel(product.concentration),
      sizeMl: variant.sizeMl,
      displaySize: formatSize(variant.sizeMl, variant.displaySize),
      imageUrl: image?.url ?? null,
      imageAlt: image?.alt || `${brand.name} ${product.name}`,
      unitPriceCents: variant.priceCents,
      compareAtPriceCents:
        variant.compareAtPriceCents && variant.compareAtPriceCents > variant.priceCents ? variant.compareAtPriceCents : null,
      quantity: effectiveQty,
      lineTotalCents: variant.priceCents * effectiveQty,
      stock,
      maxQuantity: Math.min(stock, MAX_QUANTITY_PER_LINE),
      available,
      notice,
    };
  });
}

export function pricingLines(lines: CartLine[]): PricingLine[] {
  return lines
    .filter((l) => l.available)
    .map((l) => ({
      variantId: l.variantId,
      productId: l.productId,
      brandId: l.brandId,
      unitPriceCents: l.unitPriceCents,
      quantity: l.quantity,
    }));
}

export async function buildCartView(cartId: string | null, settings?: ShopSettings): Promise<CartView> {
  const s = settings ?? (await getSettingsFresh());
  const method = defaultMethod(s);
  const shipping = method
    ? { name: method.name, deliveryTime: method.deliveryTime, priceCents: method.priceCents, freeFromCents: method.freeFromCents }
    : null;
  const sampleOptions = s.samples.enabled ? await getSamples() : [];

  if (!cartId) {
    return {
      id: null,
      lines: [],
      itemCount: 0,
      totals: computeTotals({ lines: [], shipping: null, taxRatePercent: s.shipping.taxRatePercent }),
      coupon: null,
      shipping,
      samples: { enabled: s.samples.enabled, max: s.samples.maxCount, minSubtotalCents: s.samples.minSubtotalCents, eligible: false, selectedIds: [], options: sampleOptions },
      hasIssues: false,
    };
  }

  const [cart] = await db.select().from(carts).where(eq(carts.id, cartId)).limit(1);
  const lines = await loadLines(cartId);
  const pLines = pricingLines(lines);

  let coupon: CartView["coupon"] = null;
  let discountCents = 0;
  if (cart?.couponCode) {
    const rule = await findCoupon(cart.couponCode);
    const user = await getCurrentUser();
    const prior = rule?.oncePerCustomer && user ? await priorRedemptions(rule.id, { userId: user.id, email: user.email }) : 0;
    const check = evaluateCoupon(rule, pLines, { priorCustomerUses: prior });
    coupon = { code: cart.couponCode, applied: check.ok, message: check.ok ? null : check.reason };
    if (check.ok) discountCents = check.discountCents;
  }

  const totals = computeTotals({
    lines: pLines,
    discountCents,
    shipping: method ? { priceCents: method.priceCents, freeFromCents: method.freeFromCents } : null,
    taxRatePercent: s.shipping.taxRatePercent,
  });

  const selected = await db.select({ sampleId: cartSamples.sampleId }).from(cartSamples).where(eq(cartSamples.cartId, cartId));
  const eligible =
    s.samples.enabled && pLines.length > 0 && totals.subtotalCents - totals.discountCents >= s.samples.minSubtotalCents;

  return {
    id: cartId,
    lines,
    itemCount: lines.reduce((n, l) => n + (l.available ? l.quantity : 0), 0),
    totals,
    coupon,
    shipping,
    samples: {
      enabled: s.samples.enabled,
      max: s.samples.maxCount,
      minSubtotalCents: s.samples.minSubtotalCents,
      eligible,
      selectedIds: selected.map((x) => x.sampleId).filter((id) => sampleOptions.some((o) => o.id === id && o.available)),
      options: sampleOptions,
    },
    hasIssues: lines.some((l) => l.notice !== null),
  };
}

export async function getCartView(): Promise<CartView> {
  return buildCartView(await resolveCartId());
}

/* ------------------------------------------------------------------ */
/* Schreiben                                                           */
/* ------------------------------------------------------------------ */

async function sellableVariant(variantId: string) {
  if (!UUID.test(variantId)) return null;
  const [row] = await db
    .select({
      id: productVariants.id,
      stock: productVariants.stock,
      active: productVariants.active,
      productActive: products.active,
      brandActive: brands.active,
      name: products.name,
      sizeMl: productVariants.sizeMl,
      displaySize: productVariants.displaySize,
    })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(eq(productVariants.id, variantId))
    .limit(1);
  if (!row || !row.active || !row.productActive || !row.brandActive) return null;
  return row;
}

export async function addItem(variantId: string, quantity = 1): Promise<ActionResult<CartView>> {
  const variant = await sellableVariant(variantId);
  if (!variant) return fail("Dieser Artikel ist nicht mehr erhältlich.");
  if (variant.stock <= 0) return fail("Diese Größe ist derzeit ausverkauft.");

  const cartId = await ensureCart();
  const [existing] = await db
    .select({ quantity: cartItems.quantity })
    .from(cartItems)
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
  const wanted = (existing?.quantity ?? 0) + Math.max(1, Math.floor(quantity));
  const next = clampQuantity(wanted, variant.stock);
  const capped = next < wanted;

  await db
    .insert(cartItems)
    .values({ cartId, variantId, quantity: next })
    .onConflictDoUpdate({ target: [cartItems.cartId, cartItems.variantId], set: { quantity: next } });
  await touch(cartId);

  const view = await buildCartView(cartId);
  const size = formatSize(variant.sizeMl, variant.displaySize);
  return ok(
    view,
    capped
      ? `Maximal ${next} Stück von ${variant.name} ${size} möglich.`
      : `${variant.name}, ${size}, liegt im Warenkorb.`,
  );
}

export async function setQuantity(variantId: string, quantity: number): Promise<ActionResult<CartView>> {
  const cartId = await resolveCartId();
  if (!cartId) return fail("Ihr Warenkorb ist leer.");
  if (quantity <= 0) return removeItem(variantId);
  const variant = await sellableVariant(variantId);
  if (!variant) return fail("Dieser Artikel ist nicht mehr erhältlich.");
  const next = clampQuantity(quantity, variant.stock);
  if (next === 0) return fail("Diese Größe ist derzeit ausverkauft.");
  await db
    .update(cartItems)
    .set({ quantity: next })
    .where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
  await touch(cartId);
  return ok(await buildCartView(cartId), next < quantity ? `Nur noch ${next} Stück verfügbar.` : undefined);
}

export async function removeItem(variantId: string): Promise<ActionResult<CartView>> {
  const cartId = await resolveCartId();
  if (!cartId) return fail("Ihr Warenkorb ist leer.");
  await db.delete(cartItems).where(and(eq(cartItems.cartId, cartId), eq(cartItems.variantId, variantId)));
  await touch(cartId);
  return ok(await buildCartView(cartId), "Artikel entfernt.");
}

export async function applyCoupon(code: string): Promise<ActionResult<CartView>> {
  const limit = await rateLimit(`coupon:${await clientKey()}`, 12, 600);
  if (!limit.ok) return fail(rateLimitMessage(limit));
  const cartId = await resolveCartId();
  if (!cartId) return fail("Ihr Warenkorb ist leer.");
  const normalized = normalizeCode(code);
  if (!normalized) return fail("Bitte geben Sie einen Gutscheincode ein.");

  const rule = await findCoupon(normalized);
  const lines = pricingLines(await loadLines(cartId));
  const user = await getCurrentUser();
  const prior = rule?.oncePerCustomer && user ? await priorRedemptions(rule.id, { userId: user.id, email: user.email }) : 0;
  const check = evaluateCoupon(rule, lines, { priorCustomerUses: prior });
  if (!check.ok) return fail(check.reason);

  await db.update(carts).set({ couponCode: normalized, updatedAt: new Date() }).where(eq(carts.id, cartId));
  return ok(await buildCartView(cartId), `Gutschein ${normalized} angewendet: -${formatPrice(check.discountCents)}.`);
}

export async function removeCoupon(): Promise<ActionResult<CartView>> {
  const cartId = await resolveCartId();
  if (!cartId) return fail("Ihr Warenkorb ist leer.");
  await db.update(carts).set({ couponCode: null, updatedAt: new Date() }).where(eq(carts.id, cartId));
  return ok(await buildCartView(cartId), "Gutschein entfernt.");
}

export async function toggleSample(sampleId: string): Promise<ActionResult<CartView>> {
  const cartId = await resolveCartId();
  if (!cartId || !UUID.test(sampleId)) return fail("Ihr Warenkorb ist leer.");
  const settings = await getSettingsFresh();
  const view = await buildCartView(cartId, settings);
  if (!view.samples.enabled) return fail("Duftproben sind derzeit nicht verfügbar.");

  const isSelected = view.samples.selectedIds.includes(sampleId);
  if (isSelected) {
    await db.delete(cartSamples).where(and(eq(cartSamples.cartId, cartId), eq(cartSamples.sampleId, sampleId)));
    return ok(await buildCartView(cartId, settings));
  }
  if (!view.samples.eligible) {
    return fail(`Duftproben gibt es ab einem Warenwert von ${formatPrice(view.samples.minSubtotalCents)}.`);
  }
  if (view.samples.selectedIds.length >= view.samples.max) {
    return fail(`Sie können bis zu ${view.samples.max} Duftproben wählen.`);
  }
  const [sample] = await db.select({ stock: samples.stock, active: samples.active }).from(samples).where(eq(samples.id, sampleId));
  if (!sample || !sample.active || sample.stock <= 0) return fail("Diese Duftprobe ist derzeit vergriffen.");
  await db.insert(cartSamples).values({ cartId, sampleId }).onConflictDoNothing();
  return ok(await buildCartView(cartId, settings));
}

/** Nach dem Login: Gast-Warenkorb in den Konto-Warenkorb übernehmen. */
export async function mergeGuestCart(userId: string) {
  const guestId = await cookieCartId();
  const [userCart] = await db
    .select({ id: carts.id })
    .from(carts)
    .where(eq(carts.userId, userId))
    .orderBy(desc(carts.updatedAt))
    .limit(1);

  if (!guestId) return;
  const [guest] = await db.select().from(carts).where(eq(carts.id, guestId)).limit(1);
  if (!guest || (guest.userId && guest.userId !== userId)) return;

  if (!userCart) {
    await db.update(carts).set({ userId }).where(eq(carts.id, guestId));
    return;
  }
  if (userCart.id === guestId) return;

  const guestItems = await db.select().from(cartItems).where(eq(cartItems.cartId, guestId));
  for (const item of guestItems) {
    await db
      .insert(cartItems)
      .values({ cartId: userCart.id, variantId: item.variantId, quantity: item.quantity })
      .onConflictDoUpdate({
        target: [cartItems.cartId, cartItems.variantId],
        set: { quantity: sql`least(${cartItems.quantity} + ${item.quantity}, ${MAX_QUANTITY_PER_LINE})` },
      });
  }
  if (guest.couponCode) await db.update(carts).set({ couponCode: guest.couponCode }).where(eq(carts.id, userCart.id));
  await db.delete(carts).where(eq(carts.id, guestId));
  await setCartCookie(userCart.id);
}

export async function clearCart(cartId: string) {
  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  await db.delete(cartSamples).where(eq(cartSamples.cartId, cartId));
  await db.update(carts).set({ couponCode: null, updatedAt: new Date() }).where(eq(carts.id, cartId));
}

export { concentrationLabel };
