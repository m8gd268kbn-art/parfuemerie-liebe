import "server-only";
import { sql } from "drizzle-orm";
import { FAMILIES } from "@/config/catalog";
import { normalizeText } from "@/lib/utils";
import { db } from "@/services/db";
import type { ProductCardDTO } from "@/types/catalog";
import { getBrands, getCatalog } from "./index";

/**
 * Produktsuche über Name, Marke, Kategorie, Duftfamilie, Duftnoten und Konzentration.
 * Tippfehlertolerant über pg_trgm (word_similarity) auf einem normalisierten Suchtext.
 */

async function searchIds(query: string, limit: number): Promise<string[]> {
  const terms = normalizeText(query).split(" ").filter((t) => t.length > 0).slice(0, 6);
  if (!terms.length) return [];
  // Jeder Suchbegriff muss als Teilstring oder mit hoher Wortähnlichkeit vorkommen.
  const conditions = terms.map(
    (t) =>
      sql`(${sql.raw("search_text")} ILIKE ${"%" + t + "%"} OR word_similarity(${t}, ${sql.raw("search_text")}) > ${
        t.length <= 3 ? 0.99 : 0.45
      })`,
  );
  const whole = terms.join(" ");
  const rows = await db.execute<{ id: string }>(sql`
    SELECT id FROM products
    WHERE active AND ${sql.join(conditions, sql` AND `)}
    ORDER BY
      (lower(name) = ${whole})::int DESC,
      word_similarity(${whole}, search_text) DESC,
      popularity DESC
    LIMIT ${limit}
  `);
  return rows.map((r) => r.id);
}

export async function searchProducts(query: string, limit = 60): Promise<ProductCardDTO[]> {
  const q = query.trim().slice(0, 80);
  if (q.length < 2) return [];
  const [ids, catalog] = await Promise.all([searchIds(q, limit), getCatalog()]);
  const byId = new Map(catalog.map((p) => [p.id, p]));
  return ids.map((id) => byId.get(id)).filter((p): p is ProductCardDTO => Boolean(p));
}

export type SearchSuggestions = {
  products: Pick<ProductCardDTO, "id" | "slug" | "name" | "brand" | "concentration" | "minPriceCents" | "maxPriceCents" | "images" | "liquidColor" | "inStock">[];
  brands: { name: string; slug: string }[];
  families: { key: string; label: string }[];
  notes: string[];
  total: number;
};

/** Instant-Suche für das Such-Overlay. */
export async function getSuggestions(query: string): Promise<SearchSuggestions> {
  const q = normalizeText(query);
  if (q.length < 2) return { products: [], brands: [], families: [], notes: [], total: 0 };
  const [results, brands, catalog] = await Promise.all([searchProducts(query, 40), getBrands(), getCatalog()]);

  const brandMatches = brands
    .filter((b) => b.productCount > 0 && normalizeText(b.name).includes(q))
    .slice(0, 4)
    .map((b) => ({ name: b.name, slug: b.slug }));
  const familyMatches = FAMILIES.filter(
    (f) => normalizeText(f.label).includes(q) || normalizeText(f.world).includes(q),
  )
    .slice(0, 3)
    .map((f) => ({ key: f.key, label: f.label }));
  const allNotes = [...new Set(catalog.flatMap((p) => p.notes))];
  const noteMatches = allNotes.filter((n) => normalizeText(n).includes(q)).slice(0, 5);

  return {
    products: results.slice(0, 6).map((p) => ({
      id: p.id,
      slug: p.slug,
      name: p.name,
      brand: p.brand,
      concentration: p.concentration,
      minPriceCents: p.minPriceCents,
      maxPriceCents: p.maxPriceCents,
      images: p.images.slice(0, 1),
      liquidColor: p.liquidColor,
      inStock: p.inStock,
    })),
    brands: brandMatches,
    families: familyMatches,
    notes: noteMatches,
    total: results.length,
  };
}
