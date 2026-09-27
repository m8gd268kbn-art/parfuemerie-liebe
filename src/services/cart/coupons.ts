import "server-only";
import { and, count, eq, or } from "drizzle-orm";
import type { CouponRule } from "@/lib/commerce/pricing";
import { db } from "@/services/db";
import { couponRedemptions, coupons } from "@/services/db/schema";

export function normalizeCode(code: string) {
  return code.trim().toUpperCase().replace(/\s+/g, "").slice(0, 40);
}

export async function findCoupon(code: string): Promise<CouponRule | null> {
  const normalized = normalizeCode(code);
  if (!normalized) return null;
  const [row] = await db.select().from(coupons).where(eq(coupons.code, normalized)).limit(1);
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    type: row.type,
    value: row.value,
    minSubtotalCents: row.minSubtotalCents,
    startsAt: row.startsAt,
    expiresAt: row.expiresAt,
    usageLimit: row.usageLimit,
    usageCount: row.usageCount,
    oncePerCustomer: row.oncePerCustomer,
    productIds: row.productIds,
    brandIds: row.brandIds,
    active: row.active,
  };
}

/** Bisherige Einlösungen einer Person (E-Mail oder Konto). */
export async function priorRedemptions(couponId: string, who: { email?: string | null; userId?: string | null }) {
  const conditions = [];
  if (who.email) conditions.push(eq(couponRedemptions.email, who.email.toLowerCase()));
  if (who.userId) conditions.push(eq(couponRedemptions.userId, who.userId));
  if (!conditions.length) return 0;
  const [row] = await db
    .select({ n: count() })
    .from(couponRedemptions)
    .where(and(eq(couponRedemptions.couponId, couponId), or(...conditions)));
  return row?.n ?? 0;
}
