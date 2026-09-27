import type { ProductCardDTO, VariantDTO } from "@/types/catalog";

let n = 0;
export function variant(over: Partial<VariantDTO> = {}): VariantDTO {
  n += 1;
  return { id: `v${n}`, sizeMl: 50, displaySize: null, sku: `SKU-${n}`, ean: null, priceCents: 9000, compareAtPriceCents: null, lowestPrice30dCents: null, stock: 5, ...over };
}

export function product(over: Partial<ProductCardDTO> = {}): ProductCardDTO {
  n += 1;
  const variants = over.variants ?? [variant()];
  const prices = variants.map((v) => v.priceCents);
  return {
    id: `p${n}`, slug: `produkt-${n}`, name: `Duft ${n}`, brand: { id: "b1", name: "Marke", slug: "marke" }, brandNiche: false,
    concentration: "edp", gender: "unisex", families: ["woody"], notes: ["Zeder"], character: [], seasons: [], occasions: [],
    intensity: 3, niche: false, isNew: false, bestseller: false, exclusive: false, featured: false, liquidColor: null, images: [],
    variants, minPriceCents: Math.min(...prices), maxPriceCents: Math.max(...prices), onSale: variants.some((v) => v.compareAtPriceCents != null),
    inStock: variants.some((v) => v.stock > 0), popularity: 0, ratingAvg: null, ratingCount: 0, createdAt: "2026-01-01T00:00:00.000Z", categoryIds: [],
    ...over,
  };
}
