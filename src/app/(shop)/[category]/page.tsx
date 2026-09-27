import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductListing } from "@/features/catalog/product-listing";
import { activeFilterCount, matchesCategory, parseFilters } from "@/lib/catalog/filters";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";
import { getCatalog, getCategory } from "@/services/catalog";

type Props = { params: Promise<{ category: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ params, searchParams }: Props): Promise<Metadata> {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) return {};
  const filters = parseFilters(await searchParams);
  const filtered = activeFilterCount(filters) > 0 || filters.page > 1 || filters.sort !== "popular";
  return {
    title: category.seoTitle ?? category.name,
    description: category.seoDescription ?? category.description ?? `${category.name} bei der Parfümerie Liebe in Hannover online entdecken.`,
    alternates: { canonical: `/${category.slug}` },
    // Gefilterte Varianten nicht indexieren, aber Links folgen (Duplicate Content vermeiden).
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { category: slug } = await params;
  const category = await getCategory(slug);
  if (!category) notFound();
  const filters = parseFilters(await searchParams);
  const products = (await getCatalog()).filter((p) => matchesCategory(p, category));

  const crumbs = [{ label: "Startseite", href: "/" }, ...(slug !== "parfum" ? [{ label: "Parfum", href: "/parfum" }] : []), { label: category.name, href: `/${category.slug}` }];
  const hidden: ("gender" | "niche" | "isNew" | "bestseller" | "sale")[] = [];
  if (category.rule.gender?.length === 1) hidden.push("gender");
  if (category.rule.niche) hidden.push("niche");
  if (category.rule.isNew) hidden.push("isNew");
  if (category.rule.bestseller) hidden.push("bestseller");
  if (category.rule.onSale) hidden.push("sale");

  return (
    <div className="container-page pt-8 pb-24">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <header className="mt-8 mb-10 max-w-3xl md:mt-10 md:mb-14">
        <h1 className="font-display text-h1">{category.name}</h1>
        {category.description && <p className="mt-4 text-body-lg text-ink-soft">{category.description}</p>}
      </header>
      <ProductListing products={products} filters={filters} basePath={`/${category.slug}`} hidden={hidden} />
    </div>
  );
}
