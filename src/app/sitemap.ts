import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/seo";
import { getBrands, getCatalog, getCategories } from "@/services/catalog";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [catalog, brands, categories] = await Promise.all([getCatalog(), getBrands(), getCategories()]);
  const statics = ["", "/marken", "/parfuemerie", "/duftfinder", "/kontakt", "/faq", "/versand", "/rueckgabe", "/zahlungsarten", "/impressum", "/datenschutz", "/agb", "/widerruf"];
  return [
    ...statics.map((p) => ({ url: `${SITE_URL}${p}`, changeFrequency: "weekly" as const, priority: p === "" ? 1 : 0.5 })),
    ...categories.map((c) => ({ url: `${SITE_URL}/${c.slug}`, changeFrequency: "daily" as const, priority: 0.8 })),
    ...brands.filter((b) => b.productCount > 0).map((b) => ({ url: `${SITE_URL}/marken/${b.slug}`, changeFrequency: "weekly" as const, priority: 0.6 })),
    ...catalog.map((p) => ({
      url: `${SITE_URL}/produkt/${p.slug}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
      images: p.images.slice(0, 1).map((i) => `${SITE_URL}${i.url}`),
    })),
  ];
}
