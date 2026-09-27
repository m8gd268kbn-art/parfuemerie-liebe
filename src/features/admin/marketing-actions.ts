"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { fromBerlinInput } from "@/lib/berlin-time";
import { requireAdmin } from "@/services/auth/session";
import { invalidate, TAGS } from "@/services/cache";
import { normalizeCode } from "@/services/cart/coupons";
import { db } from "@/services/db";
import { coupons, newsletterSubscribers, reviews, sessions, users } from "@/services/db/schema";
import { bool, centsField, euro, int, list, opt, str } from "./form-data";

type S = ActionResult<unknown> | null;

/* ------------------------------------------------------------------ */
/* Gutscheine                                                          */
/* ------------------------------------------------------------------ */

const dateField = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?$/, "Bitte ein gültiges Datum wählen.")
  .transform(fromBerlinInput)
  .nullable();

const couponSchema = z
  .object({
    code: z.string().min(3, "Mindestens 3 Zeichen.").max(40).regex(/^[A-Z0-9_-]+$/, "Nur Buchstaben, Ziffern, Binde- und Unterstrich."),
    description: z.string().max(200).nullable(),
    type: z.enum(["percent", "fixed"]),
    value: z.number({ error: "Bitte einen Wert angeben." }).int().min(1, "Der Wert muss größer als 0 sein."),
    minSubtotalCents: centsField("Mindestbestellwert").nullable(),
    startsAt: dateField,
    expiresAt: dateField,
    usageLimit: z.number().int().min(1).max(1_000_000).nullable(),
    oncePerCustomer: z.boolean(),
    productIds: z.array(z.uuid()),
    brandIds: z.array(z.uuid()),
    active: z.boolean(),
  })
  .refine((c) => c.type !== "percent" || c.value <= 100, { path: ["value"], message: "Höchstens 100 Prozent." })
  .refine((c) => !c.startsAt || !c.expiresAt || c.expiresAt > c.startsAt, { path: ["expiresAt"], message: "Das Ende muss nach dem Beginn liegen." });

export async function saveCouponAction(couponId: string | null, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const type = str(fd, "type");
  const rawValue = type === "fixed" ? euro(fd, "value") : int(fd, "value");
  const min = euro(fd, "minSubtotal");
  const parsed = couponSchema.safeParse({
    code: normalizeCode(str(fd, "code")),
    description: opt(fd, "description"),
    type,
    value: rawValue ?? undefined,
    minSubtotalCents: min === undefined ? null : min,
    startsAt: opt(fd, "startsAt"),
    expiresAt: opt(fd, "expiresAt"),
    usageLimit: int(fd, "usageLimit"),
    oncePerCustomer: bool(fd, "oncePerCustomer"),
    productIds: list(fd, "productIds"),
    brandIds: list(fd, "brandIds"),
    active: bool(fd, "active"),
  });
  if (!parsed.success) {
    const e = zodFieldErrors(parsed.error.issues);
    if (e.minSubtotalCents) e.minSubtotal = e.minSubtotalCents;
    return fail("Bitte prüfen Sie die markierten Felder.", e);
  }
  const data = parsed.data;
  const [taken] = await db
    .select({ id: coupons.id })
    .from(coupons)
    .where(couponId ? and(eq(coupons.code, data.code), ne(coupons.id, couponId)) : eq(coupons.code, data.code))
    .limit(1);
  if (taken) return fail("Dieser Code existiert bereits.", { code: "Dieser Code existiert bereits." });
  let id = couponId;
  if (id) await db.update(coupons).set(data).where(eq(coupons.id, id));
  else id = (await db.insert(coupons).values(data).returning({ id: coupons.id }))[0].id;
  revalidatePath("/admin/gutscheine");
  if (!couponId) redirect(`/admin/gutscheine/${id}`);
  return ok(undefined, "Gutschein gespeichert.");
}

export async function deleteCouponAction(couponId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  const [row] = await db.select({ usageCount: coupons.usageCount }).from(coupons).where(eq(coupons.id, couponId)).limit(1);
  if (!row) return fail("Gutschein nicht gefunden.");
  if (row.usageCount > 0) return fail("Der Gutschein wurde bereits eingelöst. Bitte deaktivieren Sie ihn stattdessen.");
  await db.delete(coupons).where(eq(coupons.id, couponId));
  redirect("/admin/gutscheine");
}

/* ------------------------------------------------------------------ */
/* Bewertungen                                                         */
/* ------------------------------------------------------------------ */

export async function moderateReviewAction(reviewId: string, status: "approved" | "rejected"): Promise<ActionResult<unknown>> {
  await requireAdmin();
  if (status !== "approved" && status !== "rejected") return fail("Unbekannter Status.");
  await db.update(reviews).set({ status, moderatedAt: new Date() }).where(eq(reviews.id, reviewId));
  // Sternebewertung fließt in Karten und Sortierung ein.
  invalidate(TAGS.reviews, TAGS.catalog);
  revalidatePath("/admin/bewertungen");
  return ok(undefined, status === "approved" ? "Bewertung veröffentlicht." : "Bewertung abgelehnt.");
}

export async function deleteReviewAction(reviewId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  await db.delete(reviews).where(eq(reviews.id, reviewId));
  invalidate(TAGS.reviews, TAGS.catalog);
  revalidatePath("/admin/bewertungen");
  return ok(undefined, "Bewertung gelöscht.");
}

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export async function unsubscribeSubscriberAction(id: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  await db.update(newsletterSubscribers).set({ status: "unsubscribed", unsubscribedAt: new Date(), tokenHash: null }).where(eq(newsletterSubscribers.id, id));
  revalidatePath("/admin/newsletter");
  return ok(undefined, "Abgemeldet.");
}

/** Löschen auf Wunsch der betroffenen Person (Art. 17 DSGVO). */
export async function deleteSubscriberAction(id: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  await db.delete(newsletterSubscribers).where(eq(newsletterSubscribers.id, id));
  revalidatePath("/admin/newsletter");
  return ok(undefined, "Eintrag gelöscht.");
}

/* ------------------------------------------------------------------ */
/* Kunden                                                              */
/* ------------------------------------------------------------------ */

export async function setCustomerDisabledAction(userId: string, disabled: boolean): Promise<ActionResult<unknown>> {
  const admin = await requireAdmin();
  if (userId === admin.id) return fail("Sie können Ihr eigenes Konto nicht sperren.");
  await db.update(users).set({ disabledAt: disabled ? new Date() : null }).where(eq(users.id, userId));
  // Gesperrte Konten verlieren sofort alle Sitzungen.
  if (disabled) await db.delete(sessions).where(eq(sessions.userId, userId));
  revalidatePath(`/admin/kunden/${userId}`);
  return ok(undefined, disabled ? "Konto gesperrt." : "Konto entsperrt.");
}
