"use server";

import { getCurrentUser } from "@/services/auth/session";
import { getCatalog } from "@/services/catalog";
import { addToWishlist, mergeWishlist, removeFromWishlist, wishlistProductIds } from "@/services/wishlist";

export async function toggleWishlistAction(productId: string, add: boolean): Promise<string[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  if (add) await addToWishlist(user.id, String(productId));
  else await removeFromWishlist(user.id, String(productId));
  return wishlistProductIds(user.id);
}

export async function mergeWishlistAction(localIds: string[]): Promise<string[] | null> {
  const user = await getCurrentUser();
  if (!user) return null;
  return mergeWishlist(user.id, Array.isArray(localIds) ? localIds.map(String) : []);
}

/** Produktdaten für die Wunschliste (auch für Gäste mit lokaler Liste). */
export async function wishlistProductsAction(ids: string[]) {
  const wanted = new Set((Array.isArray(ids) ? ids : []).map(String).slice(0, 200));
  const catalog = await getCatalog();
  const byId = new Map(catalog.filter((p) => wanted.has(p.id)).map((p) => [p.id, p]));
  return [...wanted].map((id) => byId.get(id)).filter(Boolean);
}
