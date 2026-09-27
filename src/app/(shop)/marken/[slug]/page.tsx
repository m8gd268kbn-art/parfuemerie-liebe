import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductListing } from "@/features/catalog/product-listing";
import { parseFilters } from "@/lib/catalog/filters";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { getBrand, getCatalog } from "@/services/catalog";

type Props = { params: Promise<{ slug: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const brand = await getBrand((await params).slug);
  if (!brand) return {};
  return {
    title: brand.seoTitle ?? `${brand.name} Parfum`,
    description: brand.seoDescription ?? `${brand.name}: alle Düfte bei der Parfümerie Liebe in Hannover online entdecken.`,
    alternates: { canonical: `/marken/${brand.slug}` },
  };
}

export default async function BrandPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const brand = await getBrand(slug);
  if (!brand) notFound();
  const filters = parseFilters(await searchParams);
  const products = (await getCatalog()).filter((p) => p.brand.slug === slug);
  const crumbs = [{ label: "Startseite", href: "/" }, { label: "Marken", href: "/marken" }, { label: brand.name, href: `/marken/${brand.slug}` }];
  return (
    <div className="container-page pt-8 pb-24">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-8 mb-14 grid grid-cols-1 gap-6 border-b border-line pb-12 md:grid-cols-12">
        <div className="md:col-span-7">
          <h1 className="font-display text-[clamp(2.75rem,1.6rem+4vw,5rem)] leading-[1.02] tracking-[-0.02em]">{brand.name}</h1>
          <p className="mt-3 text-small text-ink-soft">
            {[brand.country, brand.niche ? "Nischenmarke" : null, `${products.length} ${products.length === 1 ? "Duft" : "Düfte"}`].filter(Boolean).join(" · ")}
          </p>
        </div>
        {(brand.description || brand.story) && (
          <div className="flex flex-col gap-3 text-body text-ink-soft md:col-span-5">
            {brand.description && <p>{brand.description}</p>}
            {brand.story && <p>{brand.story}</p>}
          </div>
        )}
      </header>
      <ProductListing products={products} filters={filters} basePath={`/marken/${brand.slug}`} hidden={["brand"]} />
    </div>
  );
}
