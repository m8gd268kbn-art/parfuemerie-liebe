"use server";

import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { fail, ok, zodFieldErrors } from "@/lib/action-result";
import { getCurrentUser } from "@/services/auth/session";
import { db } from "@/services/db";
import { orderItems, orders, reviews } from "@/services/db/schema";
import { rateLimit, rateLimitMessage } from "@/services/security/rate-limit";

const score = z.number().int().min(1).max(5).nullable();
const schema = z.object({
  productId: z.string().uuid(),
  rating: z.number().int().min(1, "Bitte vergeben Sie 1 bis 5 Sterne.").max(5),
  longevity: score,
  sillage: score,
  value: score,
  title: z.string().trim().max(120).optional(),
  body: z.string().trim().min(20, "Bitte schreiben Sie mindestens 20 Zeichen.").max(2000),
});

/** Bewertung einreichen: nur angemeldet, eine pro Produkt, Moderation vor Veröffentlichung. */
export async function submitReviewAction(input: unknown) {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melden Sie sich an.");
  const parsed = schema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie Ihre Angaben.", zodFieldErrors(parsed.error.issues));
  const limit = await rateLimit(`review:${user.id}`, 5, 3600);
  if (!limit.ok) return fail(rateLimitMessage(limit));

  const d = parsed.data;
  const [existing] = await db
    .select({ id: reviews.id })
    .from(reviews)
    .where(and(eq(reviews.productId, d.productId), eq(reviews.userId, user.id)))
    .limit(1);
  if (existing) return fail("Sie haben diesen Duft bereits bewertet.");

  // „Verifizierter Kauf“ nur bei bezahlter Bestellung dieses Produkts.
  const [purchase] = await db
    .select({ id: orders.id })
    .from(orders)
    .innerJoin(orderItems, eq(orderItems.orderId, orders.id))
    .where(and(eq(orders.userId, user.id), eq(orderItems.productId, d.productId), sql`${orders.status} not in ('pending_payment','cancelled')`))
    .limit(1);

  await db.insert(reviews).values({
    productId: d.productId,
    userId: user.id,
    authorName: `${user.firstName} ${user.lastName.slice(0, 1)}.`.trim(),
    rating: d.rating,
    title: d.title || null,
    body: d.body,
    longevity: d.longevity,
    sillage: d.sillage,
    value: d.value,
    verifiedPurchase: Boolean(purchase),
    status: "pending",
  });
  return ok(undefined, "Danke! Ihre Bewertung wird geprüft und anschließend veröffentlicht.");
}
