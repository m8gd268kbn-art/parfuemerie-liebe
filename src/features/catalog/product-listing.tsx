import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { CONCENTRATIONS, FAMILIES, GENDERS } from "@/config/catalog";
import { applyFilters, computeFacets, filtersToQuery, paginate, sortProducts, type CatalogFilters } from "@/lib/catalog/filters";
import type { ProductCardDTO } from "@/types/catalog";
import { ProductCard } from "./product-card";
import { ActiveFilters, FilterPanel, FilterProvider, MobileFilters, ResultsArea, SortSelect } from "./filter-panel";

const labels = {
  gender: (k: string) => GENDERS.find((g) => g.key === k)?.label ?? k,
  family: (k: string) => FAMILIES.find((f) => f.key === k)?.label ?? k,
  concentration: (k: string) => CONCENTRATIONS.find((c) => c.key === k)?.label ?? k,
};

type Props = {
  products: ProductCardDTO[];
  filters: CatalogFilters;
  basePath: string;
  hidden?: ("brand" | "gender" | "niche" | "isNew" | "bestseller" | "sale")[];
  /** Bei der Suche wird die Relevanz-Reihenfolge beibehalten, solange nicht umsortiert wird. */
  keepOrder?: boolean;
  emptyTitle?: string;
};

/** Produktübersicht: Filter (Desktop-Sidebar, Mobile-Drawer), Sortierung, Chips, Raster, Paginierung. */
export function ProductListing({ products, filters, basePath, hidden = [], keepOrder, emptyTitle }: Props) {
  const facets = computeFacets(products, filters, labels);
  const filtered = applyFilters(products, filters);
  const sorted = keepOrder && filters.sort === "popular" ? filtered : sortProducts(filtered, filters.sort);
  const page = paginate(sorted, filters.page);

  const brandLabels = Object.fromEntries(products.map((p) => [p.brand.slug, p.brand.name]));
  const familyLabels = Object.fromEntries(FAMILIES.map((f) => [f.key, f.label]));
  const concLabels = Object.fromEntries(CONCENTRATIONS.map((c) => [c.key, c.label]));
  const genderLabels = Object.fromEntries(GENDERS.map((g) => [g.key, g.label]));

  return (
    <FilterProvider filters={filters} facets={facets} hidden={hidden}>
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[15.5rem_1fr] lg:gap-12">
        <aside aria-label="Filter" className="hidden lg:block">
          <div className="sticky top-[calc(var(--header-height)+1.5rem)] max-h-[calc(100dvh-var(--header-height)-3rem)] overflow-y-auto pr-2 pb-8">
            <FilterPanel />
          </div>
        </aside>

        <div className="min-w-0">
          <div className="mb-6 flex flex-col gap-4 border-b border-line pb-5">
            <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
              <p className="numeric order-last w-full text-small text-ink-soft sm:order-none sm:w-auto" aria-live="polite">
                {filtered.length} {filtered.length === 1 ? "Duft" : "Düfte"}
              </p>
              <MobileFilters total={filtered.length} />
              <SortSelect />
            </div>
            <ActiveFilters labels={{ brand: brandLabels, family: familyLabels, conc: concLabels, gender: genderLabels }} />
          </div>

          <ResultsArea>
            {page.items.length === 0 ? (
              <div className="flex flex-col items-start gap-5 py-16">
                <p className="font-display text-h2">{emptyTitle ?? "Keine Düfte mit dieser Auswahl."}</p>
                <p className="max-w-md text-body text-ink-soft">
                  Entfernen Sie einzelne Filter oder setzen Sie die Auswahl zurück. Gerne beraten wir Sie auch persönlich.
                </p>
                <div className="flex flex-wrap gap-3">
                  <ButtonLink href={`${basePath}${filtersToQuery({ q: filters.q })}`} variant="secondary">
                    Filter zurücksetzen
                  </ButtonLink>
                  <ButtonLink href="/duftfinder" variant="ghost">
                    Zum Duftfinder
                  </ButtonLink>
                </div>
              </div>
            ) : (
              <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6">
                {page.items.map((p, i) => (
                  <li key={p.id}>
                    <ProductCard product={p} priority={i < 3} headingLevel="h2" />
                  </li>
                ))}
              </ul>
            )}
          </ResultsArea>

          {page.pageCount > 1 && (
            <nav aria-label="Seiten" className="mt-16 flex items-center justify-center gap-2">
              {page.page > 1 && (
                <Link
                  href={`${basePath}${filtersToQuery({ ...filters, page: page.page - 1 })}`}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line hover:border-ink"
                  aria-label="Vorherige Seite"
                >
                  <Icon icon={CaretLeft} size={16} />
                </Link>
              )}
              {Array.from({ length: page.pageCount }, (_, i) => i + 1).map((n) => (
                <Link
                  key={n}
                  href={`${basePath}${filtersToQuery({ ...filters, page: n })}`}
                  aria-current={n === page.page ? "page" : undefined}
                  className="numeric inline-flex size-11 items-center justify-center rounded-full text-small aria-[current=page]:bg-ink aria-[current=page]:text-paper hover:bg-porcelain"
                >
                  {n}
                </Link>
              ))}
              {page.page < page.pageCount && (
                <Link
                  href={`${basePath}${filtersToQuery({ ...filters, page: page.page + 1 })}`}
                  className="inline-flex size-11 items-center justify-center rounded-full border border-line hover:border-ink"
                  aria-label="Nächste Seite"
                >
                  <Icon icon={CaretRight} size={16} />
                </Link>
              )}
            </nav>
          )}
        </div>
      </div>
    </FilterProvider>
  );
}
