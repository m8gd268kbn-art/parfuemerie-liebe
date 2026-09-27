"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CONCENTRATIONS, FAMILIES, IMAGE_KINDS } from "@/config/catalog";
import { fail, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { buildSearchText } from "@/lib/catalog/search-text";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/services/auth/session";
import { invalidate, TAGS } from "@/services/cache";
import { db } from "@/services/db";
import { brands, categories, orderItems, productCategories, productImages, products, productVariants, variantPriceHistory } from "@/services/db/schema";
import { storeImage } from "@/services/storage";
import { bool, centsField, csv, euro, int, list, opt, slugField, str } from "./form-data";

type S = ActionResult<unknown> | null;

const productSchema = z.object({
  name: z.string().min(1, "Bitte einen Namen angeben.").max(160),
  slug: slugField.optional(),
  brandId: z.uuid("Bitte eine Marke wählen."),
  gender: z.enum(["women", "men", "unisex"]),
  concentration: z.enum(CONCENTRATIONS.map((c) => c.key) as [string, ...string[]]),
  families: z.array(z.enum(FAMILIES.map((f) => f.key) as [string, ...string[]])).min(1, "Bitte mindestens eine Duftfamilie wählen."),
  topNotes: z.array(z.string().max(60)),
  heartNotes: z.array(z.string().max(60)),
  baseNotes: z.array(z.string().max(60)),
  character: z.array(z.string().max(40)),
  seasons: z.array(z.string().max(20)),
  occasions: z.array(z.string().max(20)),
  intensity: z.number().int().min(1).max(5).nullable(),
  description: z.string().max(6000).nullable(),
  ingredients: z.string().max(6000).nullable(),
  usage: z.string().max(2000).nullable(),
  manufacturerInfo: z.string().max(2000).nullable(),
  liquidColor: z.string().regex(/^#[0-9a-fA-F]{6}$/, "Farbe als Hex-Wert, z. B. #c78a41.").nullable(),
  seoTitle: z.string().max(70, "Höchstens 70 Zeichen.").nullable(),
  seoDescription: z.string().max(170, "Höchstens 170 Zeichen.").nullable(),
  featured: z.boolean(),
  bestseller: z.boolean(),
  isNew: z.boolean(),
  niche: z.boolean(),
  exclusive: z.boolean(),
  active: z.boolean(),
  isDemo: z.boolean(),
});

/** Legt ein Produkt an oder speichert es. Suchtext, manuelle Kategorien und Caches werden mitgeführt. */
export async function saveProductAction(productId: string | null, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const primary = str(fd, "primaryFamily");
  const families = [primary, ...list(fd, "families").filter((f) => f !== primary)].filter(Boolean);
  const name = str(fd, "name");
  const parsed = productSchema.safeParse({
    name,
    slug: str(fd, "slug") || undefined,
    brandId: str(fd, "brandId"),
    gender: str(fd, "gender"),
    concentration: str(fd, "concentration"),
    families,
    topNotes: csv(fd, "topNotes"),
    heartNotes: csv(fd, "heartNotes"),
    baseNotes: csv(fd, "baseNotes"),
    character: list(fd, "character"),
    seasons: list(fd, "seasons"),
    occasions: list(fd, "occasions"),
    intensity: int(fd, "intensity"),
    description: opt(fd, "description"),
    ingredients: opt(fd, "ingredients"),
    usage: opt(fd, "usage"),
    manufacturerInfo: opt(fd, "manufacturerInfo"),
    liquidColor: opt(fd, "liquidColor"),
    seoTitle: opt(fd, "seoTitle"),
    seoDescription: opt(fd, "seoDescription"),
    featured: bool(fd, "featured"),
    bestseller: bool(fd, "bestseller"),
    isNew: bool(fd, "isNew"),
    niche: bool(fd, "niche"),
    exclusive: bool(fd, "exclusive"),
    active: bool(fd, "active"),
    isDemo: bool(fd, "isDemo"),
  });
  if (!parsed.success) {
    const errors = zodFieldErrors(parsed.error.issues);
    if (errors.families) errors.primaryFamily = errors.families;
    return fail("Bitte prüfen Sie die markierten Felder.", errors);
  }
  const [brand] = await db.select({ name: brands.name }).from(brands).where(eq(brands.id, parsed.data.brandId)).limit(1);
  if (!brand) return fail("Die gewählte Marke existiert nicht.", { brandId: "Bitte eine Marke wählen." });
  const data = { ...parsed.data, slug: parsed.data.slug ?? slugify(`${brand.name} ${parsed.data.name}`) };
  const [taken] = await db
    .select({ id: products.id })
    .from(products)
    .where(productId ? and(eq(products.slug, data.slug), ne(products.id, productId)) : eq(products.slug, data.slug))
    .limit(1);
  if (taken) return fail("Die URL ist bereits vergeben.", { slug: "Diese URL wird schon von einem anderen Produkt genutzt." });

  const values = {
    ...data,
    gender: data.gender as "women" | "men" | "unisex",
    concentration: data.concentration as (typeof CONCENTRATIONS)[number]["key"],
    searchText: buildSearchText({
      brandName: brand.name,
      name: data.name,
      concentration: data.concentration,
      gender: data.gender,
      families: data.families,
      notes: [...data.topNotes, ...data.heartNotes, ...data.baseNotes],
      character: data.character,
    }),
  };

  const manual = await db.select({ id: categories.id, rule: categories.rule }).from(categories);
  const manualIds = new Set(manual.filter((c) => c.rule.manual).map((c) => c.id));
  const chosen = list(fd, "categoryIds").filter((id) => manualIds.has(id));

  let id = productId;
  let oldSlug: string | null = null;
  await db.transaction(async (tx) => {
    if (id) {
      const [old] = await tx.select({ slug: products.slug }).from(products).where(eq(products.id, id)).limit(1);
      oldSlug = old?.slug ?? null;
      await tx.update(products).set(values).where(eq(products.id, id));
    } else {
      const [row] = await tx.insert(products).values(values).returning({ id: products.id });
      id = row.id;
    }
    if (manualIds.size) {
      await tx.delete(productCategories).where(and(eq(productCategories.productId, id!), inArray(productCategories.categoryId, [...manualIds])));
    }
    if (chosen.length) await tx.insert(productCategories).values(chosen.map((categoryId) => ({ productId: id!, categoryId })));
  });

  invalidate(TAGS.catalog, TAGS.product(data.slug), ...(oldSlug && oldSlug !== data.slug ? [TAGS.product(oldSlug)] : []));
  revalidatePath("/admin/produkte");
  if (!productId) redirect(`/admin/produkte/${id}?neu=1`);
  revalidatePath(`/admin/produkte/${id}`);
  return ok(undefined, "Produkt gespeichert.");
}

/** Löschen nur ohne Bestellbezug; sonst deaktivieren (Bestellhistorie bleibt nachvollziehbar). */
export async function deleteProductAction(productId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  const used = await db.$count(orderItems, eq(orderItems.productId, productId));
  if (used > 0) return fail("Das Produkt ist Teil von Bestellungen. Bitte deaktivieren Sie es stattdessen.");
  const [row] = await db.delete(products).where(eq(products.id, productId)).returning({ slug: products.slug });
  if (!row) return fail("Produkt nicht gefunden.");
  invalidate(TAGS.catalog, TAGS.product(row.slug));
  redirect("/admin/produkte?geloescht=1");
}

/* ------------------------------------------------------------------ */
/* Varianten                                                           */
/* ------------------------------------------------------------------ */

const variantSchema = z
  .object({
    sizeMl: z.number({ error: "Bitte die Größe in ml angeben." }).int().min(1).max(5000),
    displaySize: z.string().max(40).nullable(),
    sku: z.string().min(1, "Bitte eine Artikelnummer angeben.").max(60).regex(/^[A-Za-z0-9._-]+$/, "Nur Buchstaben, Ziffern, Punkt, Binde- und Unterstrich."),
    ean: z.string().regex(/^\d{8}(\d{4,5})?$/, "EAN mit 8, 12 oder 13 Ziffern.").nullable(),
    priceCents: centsField("Preis").min(1, "Der Preis muss größer als 0 sein."),
    compareAtPriceCents: centsField("Vergleichspreis").nullable(),
    stock: z.number({ error: "Bitte den Bestand angeben." }).int().min(0).max(100_000),
    weightGrams: z.number().int().min(0).max(50_000).nullable(),
    sortOrder: z.number().int().min(0).max(999),
    active: z.boolean(),
  })
  .refine((v) => v.compareAtPriceCents == null || v.compareAtPriceCents > v.priceCents, {
    path: ["compareAtPriceCents"],
    message: "Der Vergleichspreis muss über dem Preis liegen.",
  });

export async function saveVariantAction(productId: string, variantId: string | null, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const compare = euro(fd, "compareAtPrice");
  const parsed = variantSchema.safeParse({
    sizeMl: int(fd, "sizeMl"),
    displaySize: opt(fd, "displaySize"),
    sku: str(fd, "sku"),
    ean: opt(fd, "ean"),
    priceCents: euro(fd, "price"),
    compareAtPriceCents: compare === undefined ? null : compare,
    stock: int(fd, "stock") ?? 0,
    weightGrams: int(fd, "weightGrams"),
    sortOrder: int(fd, "sortOrder") ?? 0,
    active: bool(fd, "active"),
  });
  if (!parsed.success) {
    const e = zodFieldErrors(parsed.error.issues);
    if (e.priceCents) e.price = e.priceCents;
    if (e.compareAtPriceCents) e.compareAtPrice = e.compareAtPriceCents;
    return fail("Bitte prüfen Sie die Variante.", e);
  }
  const v = parsed.data;
  const [dup] = await db
    .select({ id: productVariants.id })
    .from(productVariants)
    .where(variantId ? and(eq(productVariants.sku, v.sku), ne(productVariants.id, variantId)) : eq(productVariants.sku, v.sku))
    .limit(1);
  if (dup) return fail("Artikelnummer bereits vergeben.", { sku: "Diese Artikelnummer existiert schon." });

  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  if (!product) return fail("Produkt nicht gefunden.");

  await db.transaction(async (tx) => {
    if (variantId) {
      const [old] = await tx
        .select({ priceCents: productVariants.priceCents })
        .from(productVariants)
        .where(and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)))
        .limit(1);
      if (!old) throw new Error("Variante nicht gefunden");
      await tx.update(productVariants).set(v).where(eq(productVariants.id, variantId));
      // Preisverlauf für die Angabe „niedrigster Preis der letzten 30 Tage“ (§ 11 PAngV).
      if (old.priceCents !== v.priceCents) await tx.insert(variantPriceHistory).values({ variantId, priceCents: v.priceCents });
    } else {
      const [row] = await tx.insert(productVariants).values({ ...v, productId }).returning({ id: productVariants.id });
      await tx.insert(variantPriceHistory).values({ variantId: row.id, priceCents: v.priceCents });
    }
  });
  invalidate(TAGS.catalog, TAGS.product(product.slug));
  revalidatePath(`/admin/produkte/${productId}`);
  return ok(undefined, variantId ? "Variante gespeichert." : "Variante angelegt.");
}

export async function deleteVariantAction(productId: string, variantId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  const used = await db.$count(orderItems, eq(orderItems.variantId, variantId));
  if (used > 0) return fail("Diese Größe wurde bereits bestellt. Bitte deaktivieren Sie sie stattdessen.");
  const [row] = await db
    .delete(productVariants)
    .where(and(eq(productVariants.id, variantId), eq(productVariants.productId, productId)))
    .returning({ id: productVariants.id });
  if (!row) return fail("Variante nicht gefunden.");
  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  invalidate(TAGS.catalog, ...(product ? [TAGS.product(product.slug)] : []));
  revalidatePath(`/admin/produkte/${productId}`);
  return ok(undefined, "Variante gelöscht.");
}

/* ------------------------------------------------------------------ */
/* Bilder                                                              */
/* ------------------------------------------------------------------ */

const imageMetaSchema = z.object({
  alt: z.string().min(3, "Bitte einen Alternativtext angeben (Barrierefreiheit).").max(200),
  kind: z.enum(IMAGE_KINDS.map((k) => k.key) as [(typeof IMAGE_KINDS)[number]["key"], ...(typeof IMAGE_KINDS)[number]["key"][]]),
  sortOrder: z.number().int().min(0).max(99),
});

async function touchProduct(productId: string) {
  const [product] = await db.select({ slug: products.slug }).from(products).where(eq(products.id, productId)).limit(1);
  invalidate(TAGS.catalog, ...(product ? [TAGS.product(product.slug)] : []));
  revalidatePath(`/admin/produkte/${productId}`);
}

export async function uploadImageAction(productId: string, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const file = fd.get("file");
  if (!(file instanceof File) || file.size === 0) return fail("Bitte eine Bilddatei auswählen.", { file: "Bitte eine Bilddatei auswählen." });
  const meta = imageMetaSchema.safeParse({ alt: str(fd, "alt"), kind: str(fd, "kind") || "front", sortOrder: int(fd, "sortOrder") ?? 0 });
  if (!meta.success) return fail("Bitte prüfen Sie die Angaben zum Bild.", zodFieldErrors(meta.error.issues));
  let url: string;
  try {
    url = (await storeImage(file, "products")).url;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload fehlgeschlagen.", { file: e instanceof Error ? e.message : "Upload fehlgeschlagen." });
  }
  const variantId = opt(fd, "variantId");
  await db.insert(productImages).values({ productId, url, ...meta.data, variantId });
  await touchProduct(productId);
  return ok(undefined, "Bild hochgeladen.");
}

export async function updateImageAction(productId: string, imageId: string, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const meta = imageMetaSchema.safeParse({ alt: str(fd, "alt"), kind: str(fd, "kind"), sortOrder: int(fd, "sortOrder") ?? 0 });
  if (!meta.success) return fail("Bitte prüfen Sie die Angaben zum Bild.", zodFieldErrors(meta.error.issues));
  await db
    .update(productImages)
    .set({ ...meta.data, variantId: opt(fd, "variantId") })
    .where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
  await touchProduct(productId);
  return ok(undefined, "Bild gespeichert.");
}

export async function deleteImageAction(productId: string, imageId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  await db.delete(productImages).where(and(eq(productImages.id, imageId), eq(productImages.productId, productId)));
  await touchProduct(productId);
  return ok(undefined, "Bild entfernt.");
}
