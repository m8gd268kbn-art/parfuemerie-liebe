import type { SortKey } from "@/config/catalog";
import type { CategoryDTO, ProductCardDTO } from "@/types/catalog";
import { normalizeText } from "@/lib/utils";

/**
 * URL-basierte Filter. Alle Werte sind teil- und neu ladbar:
 * ?brand=dior,chanel&family=woody&size=100&price=50-150&sale=1&sort=price-asc
 */
export type CatalogFilters = {
  brands: string[];
  genders: string[];
  families: string[];
  concentrations: string[];
  sizes: number[];
  priceMin: number | null; // Euro
  priceMax: number | null; // Euro
  isNew: boolean;
  bestseller: boolean;
  sale: boolean;
  available: boolean;
  niche: boolean;
  note: string | null;
  q: string | null;
  sort: SortKey;
  page: number;
};

export const PAGE_SIZE = 24;

type Params = Record<string, string | string[] | undefined>;

const SORT_KEYS: SortKey[] = ["popular", "new", "price-asc", "price-desc", "name", "bestseller", "rating"];

function list(value: string | string[] | undefined): string[] {
  const raw = Array.isArray(value) ? value.join(",") : (value ?? "");
  return raw
    .split(",")
    .map((v) => v.trim().toLowerCase())
    .filter(Boolean)
    .slice(0, 30);
}

function flag(value: string | string[] | undefined) {
  const v = Array.isArray(value) ? value[0] : value;
  return v === "1" || v === "true";
}

function single(value: string | string[] | undefined): string | null {
  const v = Array.isArray(value) ? value[0] : value;
  return v?.trim() ? v.trim().slice(0, 80) : null;
}

export function parseFilters(params: Params): CatalogFilters {
  const [minRaw, maxRaw] = (single(params.price) ?? "").split("-");
  const min = Number.parseInt(minRaw ?? "", 10);
  const max = Number.parseInt(maxRaw ?? "", 10);
  const sortRaw = single(params.sort) as SortKey | null;
  const page = Number.parseInt(single(params.page) ?? "1", 10);
  return {
    brands: list(params.brand),
    genders: list(params.gender).filter((g) => ["women", "men", "unisex"].includes(g)),
    families: list(params.family),
    concentrations: list(params.conc),
    sizes: list(params.size)
      .map((s) => Number.parseInt(s, 10))
      .filter((n) => Number.isFinite(n) && n > 0),
    priceMin: Number.isFinite(min) && min >= 0 ? min : null,
    priceMax: Number.isFinite(max) && max > 0 ? max : null,
    isNew: flag(params.new),
    bestseller: flag(params.bestseller),
    sale: flag(params.sale),
    available: flag(params.available),
    niche: flag(params.niche),
    note: single(params.note),
    q: single(params.q),
    sort: sortRaw && SORT_KEYS.includes(sortRaw) ? sortRaw : "popular",
    page: Number.isFinite(page) && page > 0 ? Math.min(page, 500) : 1,
  };
}

/** Serialisiert Filter zurück in eine stabile Query (für Links, Canonicals und Chips). */
export function filtersToQuery(filters: Partial<CatalogFilters>): string {
  const p = new URLSearchParams();
  if (filters.q) p.set("q", filters.q);
  if (filters.brands?.length) p.set("brand", [...filters.brands].sort().join(","));
  if (filters.genders?.length) p.set("gender", [...filters.genders].sort().join(","));
  if (filters.families?.length) p.set("family", [...filters.families].sort().join(","));
  if (filters.concentrations?.length) p.set("conc", [...filters.concentrations].sort().join(","));
  if (filters.sizes?.length) p.set("size", [...filters.sizes].sort((a, b) => a - b).join(","));
  if (filters.priceMin != null || filters.priceMax != null) {
    p.set("price", `${filters.priceMin ?? 0}-${filters.priceMax ?? ""}`);
  }
  if (filters.note) p.set("note", filters.note);
  if (filters.isNew) p.set("new", "1");
  if (filters.bestseller) p.set("bestseller", "1");
  if (filters.sale) p.set("sale", "1");
  if (filters.available) p.set("available", "1");
  if (filters.niche) p.set("niche", "1");
  if (filters.sort && filters.sort !== "popular") p.set("sort", filters.sort);
  if (filters.page && filters.page > 1) p.set("page", String(filters.page));
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function activeFilterCount(f: CatalogFilters): number {
  return (
    f.brands.length +
    f.genders.length +
    f.families.length +
    f.concentrations.length +
    f.sizes.length +
    (f.priceMin != null || f.priceMax != null ? 1 : 0) +
    (f.note ? 1 : 0) +
    [f.isNew, f.bestseller, f.sale, f.available, f.niche].filter(Boolean).length
  );
}

/* ------------------------------------------------------------------ */
/* Matching                                                            */
/* ------------------------------------------------------------------ */

export function matchesCategory(product: ProductCardDTO, category: CategoryDTO | null): boolean {
  if (!category) return true;
  const r = category.rule;
  if (r.manual) return product.categoryIds.includes(category.id);
  if (r.gender?.length && !r.gender.includes(product.gender)) return false;
  if (r.niche && !product.niche) return false;
  if (r.isNew && !product.isNew) return false;
  if (r.bestseller && !product.bestseller) return false;
  if (r.onSale && !product.onSale) return false;
  return true;
}

type Group = "brand" | "gender" | "family" | "conc" | "size" | "price" | "flags" | "note";

function variantInPrice(priceCents: number, f: CatalogFilters) {
  if (f.priceMin != null && priceCents < f.priceMin * 100) return false;
  if (f.priceMax != null && priceCents > f.priceMax * 100) return false;
  return true;
}

function matches(p: ProductCardDTO, f: CatalogFilters, skip?: Group): boolean {
  if (skip !== "brand" && f.brands.length && !f.brands.includes(p.brand.slug)) return false;
  if (skip !== "gender" && f.genders.length && !f.genders.includes(p.gender)) return false;
  if (skip !== "family" && f.families.length && !p.families.some((fam) => f.families.includes(fam))) return false;
  if (skip !== "conc" && f.concentrations.length && !f.concentrations.includes(p.concentration)) return false;
  if (skip !== "size" && f.sizes.length && !p.variants.some((v) => f.sizes.includes(v.sizeMl))) return false;
  if (skip !== "price" && (f.priceMin != null || f.priceMax != null)) {
    const candidates = f.sizes.length ? p.variants.filter((v) => f.sizes.includes(v.sizeMl)) : p.variants;
    if (!candidates.some((v) => variantInPrice(v.priceCents, f))) return false;
  }
  if (skip !== "note" && f.note) {
    const n = normalizeText(f.note);
    if (!p.notes.some((note) => normalizeText(note) === n)) return false;
  }
  if (skip !== "flags") {
    if (f.isNew && !p.isNew) return false;
    if (f.bestseller && !p.bestseller) return false;
    if (f.sale && !p.onSale) return false;
    if (f.available && !p.inStock) return false;
    if (f.niche && !p.niche) return false;
  }
  return true;
}

export function applyFilters(products: ProductCardDTO[], f: CatalogFilters): ProductCardDTO[] {
  return products.filter((p) => matches(p, f));
}

/* ------------------------------------------------------------------ */
/* Sortierung                                                          */
/* ------------------------------------------------------------------ */

const collator = new Intl.Collator("de", { sensitivity: "base" });

export function sortProducts(products: ProductCardDTO[], sort: SortKey): ProductCardDTO[] {
  const list = [...products];
  const byName = (a: ProductCardDTO, b: ProductCardDTO) =>
    collator.compare(a.name, b.name) || collator.compare(a.brand.name, b.brand.name);
  const availability = (a: ProductCardDTO, b: ProductCardDTO) => Number(b.inStock) - Number(a.inStock);
  switch (sort) {
    case "new":
      return list.sort(
        (a, b) => Number(b.isNew) - Number(a.isNew) || b.createdAt.localeCompare(a.createdAt) || byName(a, b),
      );
    case "price-asc":
      return list.sort((a, b) => a.minPriceCents - b.minPriceCents || byName(a, b));
    case "price-desc":
      return list.sort((a, b) => b.minPriceCents - a.minPriceCents || byName(a, b));
    case "name":
      return list.sort(byName);
    case "bestseller":
      return list.sort(
        (a, b) => Number(b.bestseller) - Number(a.bestseller) || b.popularity - a.popularity || byName(a, b),
      );
    case "rating":
      return list.sort(
        (a, b) =>
          (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0) || b.ratingCount - a.ratingCount || availability(a, b) || byName(a, b),
      );
    case "popular":
    default:
      return list.sort(
        (a, b) =>
          availability(a, b) ||
          b.popularity - a.popularity ||
          Number(b.featured) - Number(a.featured) ||
          Number(b.bestseller) - Number(a.bestseller) ||
          byName(a, b),
      );
  }
}

/* ------------------------------------------------------------------ */
/* Facetten                                                            */
/* ------------------------------------------------------------------ */

export type FacetOption = { value: string; label: string; count: number };

export type Facets = {
  brands: FacetOption[];
  genders: FacetOption[];
  families: FacetOption[];
  concentrations: FacetOption[];
  sizes: FacetOption[];
  price: { min: number; max: number };
  flags: { isNew: number; bestseller: number; sale: number; available: number; niche: number };
};

/** Zählt pro Filterwert, wie viele Produkte bei allen *anderen* aktiven Filtern übrig blieben. */
export function computeFacets(
  products: ProductCardDTO[],
  f: CatalogFilters,
  labels: {
    gender: (k: string) => string;
    family: (k: string) => string;
    concentration: (k: string) => string;
  },
): Facets {
  const count = (group: Group, key: (p: ProductCardDTO) => string[]) => {
    const map = new Map<string, { label: string; count: number }>();
    for (const p of products) {
      if (!matches(p, f, group)) continue;
      for (const k of new Set(key(p))) {
        const entry = map.get(k) ?? { label: k, count: 0 };
        entry.count += 1;
        map.set(k, entry);
      }
    }
    return map;
  };

  const brandMap = new Map<string, { label: string; count: number }>();
  for (const p of products) {
    if (!matches(p, f, "brand")) continue;
    const e = brandMap.get(p.brand.slug) ?? { label: p.brand.name, count: 0 };
    e.count += 1;
    brandMap.set(p.brand.slug, e);
  }

  const toOptions = (map: Map<string, { label: string; count: number }>, label?: (k: string) => string) =>
    [...map.entries()].map(([value, e]) => ({ value, label: label ? label(value) : e.label, count: e.count }));

  const sizeOptions = toOptions(count("size", (p) => p.variants.map((v) => String(v.sizeMl)))).sort(
    (a, b) => Number(a.value) - Number(b.value),
  );

  const priceBase = products.filter((p) => matches(p, f, "price"));
  const prices = priceBase.flatMap((p) => p.variants.map((v) => v.priceCents));

  const flagBase = products.filter((p) => matches(p, f, "flags"));

  return {
    brands: toOptions(brandMap).sort((a, b) => collator.compare(a.label, b.label)),
    genders: toOptions(count("gender", (p) => [p.gender]), labels.gender),
    families: toOptions(
      count("family", (p) => p.families),
      labels.family,
    ).sort((a, b) => b.count - a.count),
    concentrations: toOptions(count("conc", (p) => [p.concentration]), labels.concentration),
    sizes: sizeOptions.map((o) => ({ ...o, label: `${o.value} ml` })),
    price: {
      min: prices.length ? Math.floor(Math.min(...prices) / 100) : 0,
      max: prices.length ? Math.ceil(Math.max(...prices) / 100) : 0,
    },
    flags: {
      isNew: flagBase.filter((p) => p.isNew).length,
      bestseller: flagBase.filter((p) => p.bestseller).length,
      sale: flagBase.filter((p) => p.onSale).length,
      available: flagBase.filter((p) => p.inStock).length,
      niche: flagBase.filter((p) => p.niche).length,
    },
  };
}

export function paginate<T>(items: T[], page: number, size = PAGE_SIZE) {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const current = Math.min(page, pageCount);
  return { items: items.slice((current - 1) * size, current * size), page: current, pageCount, total: items.length };
}
