import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/services/db";
import { products, wishlistItems } from "@/services/db/schema";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function wishlistProductIds(userId: string): Promise<string[]> {
  const rows = await db
    .select({ productId: wishlistItems.productId })
    .from(wishlistItems)
    .where(eq(wishlistItems.userId, userId))
    .orderBy(desc(wishlistItems.createdAt));
  return rows.map((r) => r.productId);
}

export async function addToWishlist(userId: string, productId: string) {
  if (!UUID.test(productId)) return;
  const [product] = await db.select({ id: products.id }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return;
  await db.insert(wishlistItems).values({ userId, productId }).onConflictDoNothing();
}

export async function removeFromWishlist(userId: string, productId: string) {
  if (!UUID.test(productId)) return;
  await db.delete(wishlistItems).where(and(eq(wishlistItems.userId, userId), eq(wishlistItems.productId, productId)));
}

/** Lokale Gast-Wunschliste nach dem Login mit der Konto-Wunschliste zusammenführen. */
export async function mergeWishlist(userId: string, localIds: string[]) {
  const ids = [...new Set(localIds.filter((id) => UUID.test(id)))].slice(0, 200);
  if (!ids.length) return wishlistProductIds(userId);
  const existing = await db.select({ id: products.id }).from(products).where(inArray(products.id, ids));
  if (existing.length) {
    await db
      .insert(wishlistItems)
      .values(existing.map((p) => ({ userId, productId: p.id })))
      .onConflictDoNothing();
  }
  return wishlistProductIds(userId);
}
