import "server-only";
import { and, asc, eq, gte, inArray, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import type { Concentration, Gender } from "@/config/catalog";
import { db } from "@/services/db";
import {
  brands,
  categories,
  productCategories,
  productImages,
  products,
  productVariants,
  reviews,
  samples,
  variantPriceHistory,
} from "@/services/db/schema";
import { TAGS } from "@/services/cache";
import { lowestPriceBeforeReduction } from "@/lib/commerce/price-history";
import type {
  BrandDTO,
  CategoryDTO,
  ImageDTO,
  ProductCardDTO,
  ProductDetailDTO,
  ReviewDTO,
  SampleDTO,
  VariantDTO,
} from "@/types/catalog";

/* ------------------------------------------------------------------ */
/* Hilfsfunktionen                                                     */
/* ------------------------------------------------------------------ */

// Reine Logik (§ 11 PAngV) liegt in src/lib/commerce/price-history.ts und ist unit-getestet.
export { lowestPriceBeforeReduction } from "@/lib/commerce/price-history";

function toImage(row: typeof productImages.$inferSelect): ImageDTO {
  return {
    id: row.id,
    url: row.url,
    alt: row.alt,
    kind: row.kind,
    width: row.width,
    height: row.height,
    variantId: row.variantId,
  };
}

function uniqueNotes(p: { topNotes: string[]; heartNotes: string[]; baseNotes: string[] }) {
  return [...new Set([...p.topNotes, ...p.heartNotes, ...p.baseNotes])];
}

/* ------------------------------------------------------------------ */
/* Katalog                                                             */
/* ------------------------------------------------------------------ */

async function loadCatalogRows(where?: ReturnType<typeof eq>) {
  const productRows = await db
    .select({ product: products, brand: brands })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(eq(products.active, true), eq(brands.active, true), where));
  if (!productRows.length) return [];
  const ids = productRows.map((r) => r.product.id);

  const [variantRows, imageRows, ratingRows, categoryRows] = await Promise.all([
    db
      .select()
      .from(productVariants)
      .where(and(inArray(productVariants.productId, ids), eq(productVariants.active, true)))
      .orderBy(asc(productVariants.sizeMl), asc(productVariants.sortOrder)),
    db.select().from(productImages).where(inArray(productImages.productId, ids)).orderBy(asc(productImages.sortOrder)),
    db
      .select({
        productId: reviews.productId,
        avg: sql<string>`avg(${reviews.rating})`,
        count: sql<number>`count(*)::int`,
      })
      .from(reviews)
      .where(and(inArray(reviews.productId, ids), eq(reviews.status, "approved")))
      .groupBy(reviews.productId),
    db.select().from(productCategories).where(inArray(productCategories.productId, ids)),
  ]);

  const variantIds = variantRows.map((v) => v.id);
  const historyRows = variantIds.length
    ? await db
        .select({
          variantId: variantPriceHistory.variantId,
          priceCents: variantPriceHistory.priceCents,
          changedAt: variantPriceHistory.changedAt,
        })
        .from(variantPriceHistory)
        .where(
          and(
            inArray(variantPriceHistory.variantId, variantIds),
            gte(variantPriceHistory.changedAt, sql`now() - interval '400 days'`),
          ),
        )
    : [];

  const historyByVariant = Map.groupBy(historyRows, (h) => h.variantId);
  const variantsByProduct = Map.groupBy(variantRows, (v) => v.productId);
  const imagesByProduct = Map.groupBy(imageRows, (i) => i.productId);
  const ratingByProduct = new Map(ratingRows.map((r) => [r.productId, r]));
  const categoriesByProduct = Map.groupBy(categoryRows, (c) => c.productId);

  return productRows.map(({ product, brand }) => {
    const variants: VariantDTO[] = (variantsByProduct.get(product.id) ?? []).map((v) => {
      const onSale = v.compareAtPriceCents != null && v.compareAtPriceCents > v.priceCents;
      return {
        id: v.id,
        sizeMl: v.sizeMl,
        displaySize: v.displaySize,
        sku: v.sku,
        ean: v.ean,
        priceCents: v.priceCents,
        compareAtPriceCents: onSale ? v.compareAtPriceCents : null,
        lowestPrice30dCents: onSale ? lowestPriceBeforeReduction(historyByVariant.get(v.id) ?? [], v.priceCents) : null,
        stock: Math.max(0, v.stock),
      };
    });
    const prices = variants.map((v) => v.priceCents);
    const rating = ratingByProduct.get(product.id);
    const card: ProductCardDTO = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      brand: { id: brand.id, name: brand.name, slug: brand.slug },
      brandNiche: brand.niche,
      concentration: product.concentration as Concentration,
      gender: product.gender as Gender,
      families: product.families,
      notes: uniqueNotes(product),
      character: product.character,
      seasons: product.seasons,
      occasions: product.occasions,
      intensity: product.intensity,
      niche: product.niche,
      isNew: product.isNew,
      bestseller: product.bestseller,
      exclusive: product.exclusive,
      featured: product.featured,
      liquidColor: product.liquidColor,
      images: (imagesByProduct.get(product.id) ?? []).map(toImage),
      variants,
      minPriceCents: prices.length ? Math.min(...prices) : 0,
      maxPriceCents: prices.length ? Math.max(...prices) : 0,
      onSale: variants.some((v) => v.compareAtPriceCents != null),
      inStock: variants.some((v) => v.stock > 0),
      popularity: product.popularity,
      ratingAvg: rating ? Math.round(Number(rating.avg) * 10) / 10 : null,
      ratingCount: rating?.count ?? 0,
      createdAt: product.createdAt.toISOString(),
      categoryIds: (categoriesByProduct.get(product.id) ?? []).map((c) => c.categoryId),
    };
    return { card, product };
  });
}

/** Alle aktiven Produkte mit mindestens einer aktiven Variante (gecacht). */
export const getCatalog = unstable_cache(
  async (): Promise<ProductCardDTO[]> => {
    const rows = await loadCatalogRows();
    return rows.map((r) => r.card).filter((p) => p.variants.length > 0);
  },
  ["catalog-v1"],
  { tags: [TAGS.catalog], revalidate: 3600 },
);

export const getProductDetail = unstable_cache(
  async (slug: string): Promise<ProductDetailDTO | null> => {
    const rows = await loadCatalogRows(eq(products.slug, slug));
    const row = rows[0];
    if (!row || row.card.variants.length === 0) return null;
    const p = row.product;
    return {
      ...row.card,
      description: p.description,
      topNotes: p.topNotes,
      heartNotes: p.heartNotes,
      baseNotes: p.baseNotes,
      ingredients: p.ingredients,
      usage: p.usage,
      manufacturerInfo: p.manufacturerInfo,
      seoTitle: p.seoTitle,
      seoDescription: p.seoDescription,
      updatedAt: p.updatedAt.toISOString(),
      isDemo: p.isDemo,
    };
  },
  ["product-detail-v1"],
  { tags: [TAGS.catalog], revalidate: 3600 },
);

/* ------------------------------------------------------------------ */
/* Marken, Kategorien, Proben, Bewertungen                             */
/* ------------------------------------------------------------------ */

export const getBrands = unstable_cache(
  async (): Promise<BrandDTO[]> => {
    const rows = await db
      .select({
        brand: brands,
        // Äußere Spalte explizit qualifizieren: Drizzle rendert ${brands.id} in Abfragen ohne Join
        // als unqualifiziertes "id", das in der Unterabfrage p.id meinen würde.
        productCount: sql<number>`(select count(*)::int from ${products} p where p.brand_id = ${sql.identifier("brands")}.${sql.identifier("id")} and p.active)`,
      })
      .from(brands)
      .where(eq(brands.active, true))
      .orderBy(asc(brands.name));
    return rows.map(({ brand, productCount }) => ({
      id: brand.id,
      name: brand.name,
      slug: brand.slug,
      description: brand.description,
      story: brand.story,
      logoUrl: brand.logoUrl,
      heroImageUrl: brand.heroImageUrl,
      country: brand.country,
      featured: brand.featured,
      niche: brand.niche,
      productCount,
      seoTitle: brand.seoTitle,
      seoDescription: brand.seoDescription,
    }));
  },
  ["brands-v1"],
  { tags: [TAGS.catalog], revalidate: 3600 },
);

export async function getBrand(slug: string) {
  return (await getBrands()).find((b) => b.slug === slug) ?? null;
}

export const getCategories = unstable_cache(
  async (): Promise<CategoryDTO[]> => {
    const rows = await db.select().from(categories).where(eq(categories.active, true)).orderBy(asc(categories.sortOrder));
    return rows.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      description: c.description,
      heroImageUrl: c.heroImageUrl,
      rule: c.rule,
      showInNav: c.showInNav,
      sortOrder: c.sortOrder,
      seoTitle: c.seoTitle,
      seoDescription: c.seoDescription,
    }));
  },
  ["categories-v1"],
  { tags: [TAGS.categories], revalidate: 3600 },
);

export async function getCategory(slug: string) {
  return (await getCategories()).find((c) => c.slug === slug) ?? null;
}

export const getSamples = unstable_cache(
  async (): Promise<SampleDTO[]> => {
    const rows = await db
      .select({ sample: samples, productSlug: products.slug })
      .from(samples)
      .leftJoin(products, eq(products.id, samples.productId))
      .where(eq(samples.active, true))
      .orderBy(asc(samples.sortOrder), asc(samples.brandName));
    return rows.map(({ sample, productSlug }) => ({
      id: sample.id,
      brandName: sample.brandName,
      name: sample.name,
      imageUrl: sample.imageUrl,
      sizeLabel: sample.sizeLabel,
      available: sample.stock > 0,
      productSlug,
    }));
  },
  ["samples-v1"],
  { tags: [TAGS.samples], revalidate: 3600 },
);

export const getApprovedReviews = unstable_cache(
  async (productId: string): Promise<ReviewDTO[]> => {
    const rows = await db
      .select()
      .from(reviews)
      .where(and(eq(reviews.productId, productId), eq(reviews.status, "approved")))
      .orderBy(sql`${reviews.createdAt} desc`)
      .limit(50);
    return rows.map((r) => ({
      id: r.id,
      authorName: r.authorName,
      rating: r.rating,
      title: r.title,
      body: r.body,
      longevity: r.longevity,
      sillage: r.sillage,
      value: r.value,
      verifiedPurchase: r.verifiedPurchase,
      createdAt: r.createdAt.toISOString(),
    }));
  },
  ["reviews-v1"],
  { tags: [TAGS.reviews], revalidate: 3600 },
);

/* ------------------------------------------------------------------ */
/* Empfehlungen (datengetrieben)                                       */
/* ------------------------------------------------------------------ */

function similarity(a: ProductCardDTO, b: ProductCardDTO) {
  const sharedFamilies = a.families.filter((f) => b.families.includes(f)).length;
  const primary = a.families[0] && a.families[0] === b.families[0] ? 2 : 0;
  const sharedNotes = a.notes.filter((n) => b.notes.includes(n)).length;
  const gender = a.gender === b.gender || b.gender === "unisex" ? 1 : -1;
  const priceDistance = Math.abs(a.minPriceCents - b.minPriceCents) / Math.max(a.minPriceCents, 1);
  return primary + sharedFamilies * 2 + sharedNotes * 1.5 + gender - priceDistance;
}

export async function getRecommendations(product: ProductCardDTO) {
  const catalog = (await getCatalog()).filter((p) => p.id !== product.id && p.inStock);
  const similar = [...catalog]
    .map((p) => ({ p, score: similarity(product, p) }))
    .filter((x) => x.score > 1)
    .sort((a, b) => b.score - a.score)
    .map((x) => x.p);
  const sameBrand = catalog.filter((p) => p.brand.id === product.brand.id).slice(0, 8);
  const similarIds = new Set(similar.slice(0, 8).map((p) => p.id));
  const alsoLike = catalog
    .filter((p) => !similarIds.has(p.id) && p.brand.id !== product.brand.id)
    .filter((p) => p.gender === product.gender || p.gender === "unisex")
    .sort((a, b) => b.popularity - a.popularity || Number(b.bestseller) - Number(a.bestseller))
    .slice(0, 8);
  return { alsoLike, similar: similar.slice(0, 8), sameBrand };
}
