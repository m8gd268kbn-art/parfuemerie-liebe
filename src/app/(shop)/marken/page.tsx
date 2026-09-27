import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { BrandDirectory } from "@/features/catalog/brand-directory";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { getBrands } from "@/services/catalog";

export const revalidate = 3600;
export const metadata: Metadata = {
  title: "Marken von A bis Z",
  description: "Alle Marken der Parfümerie Liebe: große Parfumhäuser und Nischenmarken von A bis Z.",
  alternates: { canonical: "/marken" },
};

export default async function BrandsPage() {
  const brands = (await getBrands()).filter((b) => b.productCount > 0);
  const featured = brands.filter((b) => b.featured);
  const niche = brands.filter((b) => b.niche);
  const crumbs = [{ label: "Startseite", href: "/" }, { label: "Marken", href: "/marken" }];
  return (
    <div className="container-page pt-8 pb-24">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-8 mb-12 max-w-3xl">
        <h1 className="font-display text-h1">Marken</h1>
        <p className="mt-4 text-body-lg text-ink-soft">{brands.length} Marken, von großen Parfumhäusern bis zu unabhängigen Manufakturen.</p>
      </header>
      <div className="mb-16 grid gap-10 md:grid-cols-2">
        {[{ title: "Im Fokus", list: featured }, { title: "Nischenmarken", list: niche }].map((g) => (
          <section key={g.title} aria-label={g.title}>
            <h2 className="mb-4 text-small font-semibold">{g.title}</h2>
            <ul className="flex flex-wrap gap-2">
              {g.list.map((b) => (
                <li key={b.id}>
                  <Link href={`/marken/${b.slug}`} className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-small transition-colors hover:border-ink press">{b.name}</Link>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
      <BrandDirectory brands={brands} />
    </div>
  );
}
