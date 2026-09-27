"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { fail, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import { buildSearchText } from "@/lib/catalog/search-text";
import { slugify } from "@/lib/utils";
import { requireAdmin } from "@/services/auth/session";
import { invalidate, TAGS } from "@/services/cache";
import { db } from "@/services/db";
import { brands, categories, products, samples, type CategoryRule } from "@/services/db/schema";
import { storeImage } from "@/services/storage";
import { bool, int, list, opt, slugField, str } from "./form-data";

type S = ActionResult<unknown> | null;

/** Top-Level-Pfade des Shops: Kategorien dürfen diese URLs nicht belegen. */
const RESERVED = new Set([
  "admin", "api", "agb", "anmelden", "bestellung", "bestellung-verfolgen", "datenschutz", "design-system", "duftfinder",
  "email-bestaetigen", "faq", "impressum", "kasse", "kontakt", "konto", "marken", "newsletter", "parfuemerie",
  "passwort-vergessen", "passwort-zuruecksetzen", "produkt", "registrieren", "rueckgabe", "suche", "uploads", "media",
  "versand", "warenkorb", "widerruf", "wunschliste", "zahlungsarten", "sitemap.xml", "robots.txt",
]);

/** Optionaler Bild-Upload aus einem Formularfeld; gibt `undefined` zurück, wenn keine Datei gewählt wurde. */
async function maybeUpload(fd: FormData, key: string, folder: string): Promise<string | undefined> {
  const file = fd.get(key);
  if (!(file instanceof File) || file.size === 0) return undefined;
  return (await storeImage(file, folder)).url;
}

/* ------------------------------------------------------------------ */
/* Marken                                                              */
/* ------------------------------------------------------------------ */

const brandSchema = z.object({
  name: z.string().min(1, "Bitte einen Namen angeben.").max(80),
  slug: slugField,
  description: z.string().max(600).nullable(),
  story: z.string().max(6000).nullable(),
  country: z.string().max(60).nullable(),
  featured: z.boolean(),
  niche: z.boolean(),
  active: z.boolean(),
  seoTitle: z.string().max(70, "Höchstens 70 Zeichen.").nullable(),
  seoDescription: z.string().max(170, "Höchstens 170 Zeichen.").nullable(),
});

export async function saveBrandAction(brandId: string | null, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const parsed = brandSchema.safeParse({
    name: str(fd, "name"),
    slug: str(fd, "slug") || slugify(str(fd, "name")),
    description: opt(fd, "description"),
    story: opt(fd, "story"),
    country: opt(fd, "country"),
    featured: bool(fd, "featured"),
    niche: bool(fd, "niche"),
    active: bool(fd, "active"),
    seoTitle: opt(fd, "seoTitle"),
    seoDescription: opt(fd, "seoDescription"),
  });
  if (!parsed.success) return fail("Bitte prüfen Sie die markierten Felder.", zodFieldErrors(parsed.error.issues));
  const data = parsed.data;
  const [taken] = await db
    .select({ id: brands.id })
    .from(brands)
    .where(brandId ? and(eq(brands.slug, data.slug), ne(brands.id, brandId)) : eq(brands.slug, data.slug))
    .limit(1);
  if (taken) return fail("Die URL ist bereits vergeben.", { slug: "Diese URL nutzt bereits eine andere Marke." });

  let logoUrl: string | undefined;
  let heroImageUrl: string | undefined;
  try {
    logoUrl = await maybeUpload(fd, "logo", "brands");
    heroImageUrl = await maybeUpload(fd, "hero", "brands");
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
  }
  const values = {
    ...data,
    ...(logoUrl ? { logoUrl } : bool(fd, "removeLogo") ? { logoUrl: null } : {}),
    ...(heroImageUrl ? { heroImageUrl } : bool(fd, "removeHero") ? { heroImageUrl: null } : {}),
  };

  let id = brandId;
  if (id) {
    const [old] = await db.select({ name: brands.name }).from(brands).where(eq(brands.id, id)).limit(1);
    if (!old) return fail("Marke nicht gefunden.");
    await db.update(brands).set(values).where(eq(brands.id, id));
    // Markenname ist Teil des Suchtexts aller Produkte dieser Marke.
    if (old.name !== data.name) {
      const rows = await db.select().from(products).where(eq(products.brandId, id));
      for (const p of rows) {
        await db
          .update(products)
          .set({
            searchText: buildSearchText({
              brandName: data.name,
              name: p.name,
              concentration: p.concentration,
              gender: p.gender,
              families: p.families,
              notes: [...p.topNotes, ...p.heartNotes, ...p.baseNotes],
              character: p.character,
            }),
          })
          .where(eq(products.id, p.id));
      }
    }
  } else {
    const [row] = await db.insert(brands).values(values).returning({ id: brands.id });
    id = row.id;
  }
  invalidate(TAGS.catalog);
  revalidatePath("/admin/marken");
  if (!brandId) redirect(`/admin/marken/${id}`);
  return ok(undefined, "Marke gespeichert.");
}

export async function deleteBrandAction(brandId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  const count = await db.$count(products, eq(products.brandId, brandId));
  if (count > 0) return fail(`Der Marke sind noch ${count} Produkte zugeordnet. Bitte zuerst umhängen oder löschen, oder die Marke deaktivieren.`);
  await db.delete(brands).where(eq(brands.id, brandId));
  invalidate(TAGS.catalog);
  redirect("/admin/marken");
}

/* ------------------------------------------------------------------ */
/* Kategorien                                                          */
/* ------------------------------------------------------------------ */

const categorySchema = z.object({
  name: z.string().min(1, "Bitte einen Namen angeben.").max(80),
  slug: slugField.refine((s) => !RESERVED.has(s), "Diese URL ist für eine Shopseite reserviert."),
  description: z.string().max(600).nullable(),
  sortOrder: z.number().int().min(0).max(999),
  showInNav: z.boolean(),
  active: z.boolean(),
  seoTitle: z.string().max(70, "Höchstens 70 Zeichen.").nullable(),
  seoDescription: z.string().max(170, "Höchstens 170 Zeichen.").nullable(),
});

export async function saveCategoryAction(categoryId: string | null, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const existing = categoryId ? (await db.select().from(categories).where(eq(categories.id, categoryId)).limit(1))[0] : null;
  if (categoryId && !existing) return fail("Kategorie nicht gefunden.");
  const parsed = categorySchema.safeParse({
    name: str(fd, "name"),
    // Systemkategorien (Damen, Herren …) behalten ihre URL, da Navigation und Links darauf zeigen.
    slug: existing?.system ? existing.slug : str(fd, "slug") || slugify(str(fd, "name")),
    description: opt(fd, "description"),
    sortOrder: int(fd, "sortOrder") ?? 0,
    showInNav: bool(fd, "showInNav"),
    active: existing?.system ? true : bool(fd, "active"),
    seoTitle: opt(fd, "seoTitle"),
    seoDescription: opt(fd, "seoDescription"),
  });
  if (!parsed.success) return fail("Bitte prüfen Sie die markierten Felder.", zodFieldErrors(parsed.error.issues));
  const data = parsed.data;
  const [taken] = await db
    .select({ id: categories.id })
    .from(categories)
    .where(categoryId ? and(eq(categories.slug, data.slug), ne(categories.id, categoryId)) : eq(categories.slug, data.slug))
    .limit(1);
  if (taken) return fail("Die URL ist bereits vergeben.", { slug: "Diese URL nutzt bereits eine andere Kategorie." });

  const mode = str(fd, "mode");
  const gender = list(fd, "gender").filter((g): g is "women" | "men" | "unisex" => ["women", "men", "unisex"].includes(g));
  const rule: CategoryRule =
    existing?.system
      ? existing.rule
      : mode === "manual"
        ? { manual: true }
        : {
            ...(gender.length ? { gender } : {}),
            ...(bool(fd, "niche") ? { niche: true } : {}),
            ...(bool(fd, "isNew") ? { isNew: true } : {}),
            ...(bool(fd, "bestseller") ? { bestseller: true } : {}),
            ...(bool(fd, "onSale") ? { onSale: true } : {}),
          };

  let heroImageUrl: string | undefined;
  try {
    heroImageUrl = await maybeUpload(fd, "hero", "categories");
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
  }
  const values = { ...data, rule, ...(heroImageUrl ? { heroImageUrl } : bool(fd, "removeHero") ? { heroImageUrl: null } : {}) };

  let id = categoryId;
  if (id) await db.update(categories).set(values).where(eq(categories.id, id));
  else id = (await db.insert(categories).values(values).returning({ id: categories.id }))[0].id;
  invalidate(TAGS.categories, TAGS.catalog);
  revalidatePath("/admin/kategorien");
  if (!categoryId) redirect(`/admin/kategorien/${id}`);
  return ok(undefined, "Kategorie gespeichert.");
}

export async function deleteCategoryAction(categoryId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  const [row] = await db.select({ system: categories.system }).from(categories).where(eq(categories.id, categoryId)).limit(1);
  if (!row) return fail("Kategorie nicht gefunden.");
  if (row.system) return fail("Systemkategorien können nicht gelöscht werden. Blenden Sie sie bei Bedarf aus der Navigation aus.");
  await db.delete(categories).where(eq(categories.id, categoryId));
  invalidate(TAGS.categories, TAGS.catalog);
  redirect("/admin/kategorien");
}

/* ------------------------------------------------------------------ */
/* Duftproben                                                          */
/* ------------------------------------------------------------------ */

const sampleSchema = z.object({
  brandName: z.string().min(1, "Bitte die Marke angeben.").max(80),
  name: z.string().min(1, "Bitte den Duft angeben.").max(120),
  productId: z.uuid().nullable(),
  sizeLabel: z.string().min(1).max(20),
  stock: z.number({ error: "Bitte den Bestand angeben." }).int().min(0).max(100_000),
  sortOrder: z.number().int().min(0).max(999),
  active: z.boolean(),
});

export async function saveSampleAction(sampleId: string | null, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const parsed = sampleSchema.safeParse({
    brandName: str(fd, "brandName"),
    name: str(fd, "name"),
    productId: opt(fd, "productId"),
    sizeLabel: str(fd, "sizeLabel") || "1,5 ml",
    stock: int(fd, "stock") ?? 0,
    sortOrder: int(fd, "sortOrder") ?? 0,
    active: bool(fd, "active"),
  });
  if (!parsed.success) return fail("Bitte prüfen Sie die markierten Felder.", zodFieldErrors(parsed.error.issues));
  let imageUrl: string | undefined;
  try {
    imageUrl = await maybeUpload(fd, "image", "samples");
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Upload fehlgeschlagen.");
  }
  const values = { ...parsed.data, ...(imageUrl ? { imageUrl } : {}) };
  if (sampleId) await db.update(samples).set(values).where(eq(samples.id, sampleId));
  else await db.insert(samples).values(values);
  invalidate(TAGS.samples);
  revalidatePath("/admin/proben");
  return ok(undefined, sampleId ? "Probe gespeichert." : "Probe angelegt.");
}

export async function deleteSampleAction(sampleId: string): Promise<ActionResult<unknown>> {
  await requireAdmin();
  await db.delete(samples).where(eq(samples.id, sampleId));
  invalidate(TAGS.samples);
  revalidatePath("/admin/proben");
  return ok(undefined, "Probe gelöscht.");
}
