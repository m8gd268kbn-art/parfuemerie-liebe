import type { Metadata } from "next";
import { FinderTeaser } from "@/features/home/finder-teaser";
import { BrandIndex, Curated, ForYou, Hero, NicheFeature, ProductGridSection, ProductRow, ScentWorlds, StoreTeaser } from "@/features/home/sections";
import { sortProducts } from "@/lib/catalog/filters";
import { getBrands, getCatalog } from "@/services/catalog";
import { getSettings } from "@/services/settings";
import { organizationJsonLd, JsonLd } from "@/lib/seo";

export const revalidate = 3600;

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

export default async function HomePage() {
  const [settings, catalog, brands] = await Promise.all([getSettings(), getCatalog(), getBrands()]);
  const inStock = catalog.filter((p) => p.inStock);

  const newest = sortProducts(catalog.filter((p) => p.isNew), "new");
  const newArrivals = newest.length >= 4 ? newest : sortProducts(inStock, "new");
  const curated = sortProducts(inStock.filter((p) => p.featured), "popular");
  const bestsellerAll = sortProducts(inStock.filter((p) => p.bestseller), "bestseller");
  const bestsellers = bestsellerAll.slice(0, bestsellerAll.length >= 8 ? 8 : 4);
  const niche = sortProducts(inStock.filter((p) => p.niche), "popular");

  const familyCounts: Record<string, number> = {};
  for (const p of catalog) for (const f of p.families) familyCounts[f] = (familyCounts[f] ?? 0) + 1;
  const genderCounts = {
    women: catalog.filter((p) => p.gender === "women" || p.gender === "unisex").length,
    men: catalog.filter((p) => p.gender === "men" || p.gender === "unisex").length,
    unisex: catalog.filter((p) => p.gender === "unisex").length,
  };

  return (
    <>
      <JsonLd data={organizationJsonLd(settings)} />
      <Hero settings={settings} />
      <ProductRow id="new-title" title="Neu eingetroffen" href="/neuheiten" linkLabel="Alle Neuheiten" products={newArrivals.slice(0, 10)} />
      <ScentWorlds counts={familyCounts} />
      <Curated products={curated} />
      <ForYou counts={genderCounts} />
      <ProductGridSection id="bestseller-title" title="Bestseller" href="/bestseller" linkLabel="Alle Bestseller" products={bestsellers} />
      <NicheFeature products={niche} />
      <FinderTeaser />
      <BrandIndex brands={brands} />
      <StoreTeaser settings={settings} />
    </>
  );
}
