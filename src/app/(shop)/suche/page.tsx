import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ProductListing } from "@/features/catalog/product-listing";
import { parseFilters } from "@/lib/catalog/filters";
import { searchProducts } from "@/services/catalog/search";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const q = parseFilters(await searchParams).q;
  return { title: q ? `Suche: ${q}` : "Suche", robots: { index: false, follow: true } };
}

export default async function SearchPage({ searchParams }: Props) {
  const filters = parseFilters(await searchParams);
  const q = filters.q ?? "";
  const products = q ? await searchProducts(q, 200) : [];
  return (
    <div className="container-page pt-8 pb-24">
      <Breadcrumbs items={[{ label: "Startseite", href: "/" }, { label: "Suche" }]} />
      <header className="mt-8 mb-10 md:mt-10 md:mb-14">
        <h1 className="font-display text-h1">{q ? <>Ergebnisse für „{q}“</> : "Suche"}</h1>
        {!q && <p className="mt-4 text-body-lg text-ink-soft">Suchen Sie nach Duft, Marke, Duftfamilie oder Duftnote.</p>}
      </header>
      {q && (
        <ProductListing
          products={products}
          filters={filters}
          basePath="/suche"
          keepOrder
          emptyTitle={`Keine Treffer für „${q}“.`}
        />
      )}
    </div>
  );
}
