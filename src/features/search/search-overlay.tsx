"use client";

import * as RD from "@radix-ui/react-dialog";
import { ArrowRight, MagnifyingGlass, X } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { concentrationLabel } from "@/config/catalog";
import { track } from "@/features/consent/analytics";
import { useShop } from "@/features/shop/shop-provider";
import { formatPrice } from "@/lib/format";
import type { SearchSuggestions } from "@/services/catalog/search";
import { useRecentlyViewed } from "./recently-viewed";

export type SearchDefaults = {
  notes: string[];
  brands: { name: string; slug: string }[];
  categories: { name: string; slug: string }[];
};

/**
 * Such-Overlay mit Instant-Suche (Produkte mit Bild, Marke, Name, Preis) plus Marken,
 * Duftfamilien und Duftnoten. Tippfehlertolerant über pg_trgm auf dem Server.
 */
export function SearchOverlay({ defaults }: { defaults: SearchDefaults }) {
  const { searchOpen, setSearchOpen } = useShop();
  const router = useRouter();
  const pathname = usePathname();
  const [q, setQ] = useState("");
  const [data, setData] = useState<SearchSuggestions | null>(null);
  const [loading, setLoading] = useState(false);
  const recent = useRecentlyViewed();
  const abort = useRef<AbortController | null>(null);

  useEffect(() => setSearchOpen(false), [pathname, setSearchOpen]);

  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(async () => {
      abort.current?.abort();
      const ctrl = new AbortController();
      abort.current = ctrl;
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal });
        if (res.ok) setData(await res.json());
      } catch {
        // abgebrochen
      } finally {
        if (!ctrl.signal.aborted) setLoading(false);
      }
    }, 160);
    return () => clearTimeout(t);
  }, [q]);

  const submit = () => {
    const query = q.trim();
    if (!query) return;
    track("search", { query });
    setSearchOpen(false);
    router.push(`/suche?q=${encodeURIComponent(query)}`);
  };

  const close = () => setSearchOpen(false);
  const showResults = q.trim().length >= 2;

  return (
    <RD.Root open={searchOpen} onOpenChange={setSearchOpen}>
      <RD.Portal>
        <RD.Overlay className="overlay fixed inset-0 z-[60] bg-ink/25" />
        <RD.Content
          className="sheet-top fixed inset-x-0 top-0 z-[60] max-h-[100dvh] overflow-y-auto bg-paper shadow-overlay outline-none"
          onOpenAutoFocus={(e) => {
            e.preventDefault();
            (document.getElementById("site-search") as HTMLInputElement | null)?.focus();
          }}
        >
          <RD.Title className="sr-only">Suche</RD.Title>
          <RD.Description className="sr-only">Suchen Sie nach Duft, Marke, Duftfamilie oder Duftnote.</RD.Description>
          <div className="container-page">
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                submit();
              }}
              className="flex h-20 items-center gap-3 border-b border-line md:h-24"
            >
              <Icon icon={MagnifyingGlass} size={24} className="shrink-0 text-ink-soft" />
              <label htmlFor="site-search" className="sr-only">
                Suchbegriff
              </label>
              <input
                id="site-search"
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                autoComplete="off"
                enterKeyHint="search"
                placeholder="Duft, Marke oder Duftnote"
                className="h-full min-w-0 flex-1 bg-transparent font-display text-[1.5rem] text-ink placeholder:text-muted focus:outline-none md:text-[2rem] [&::-webkit-search-cancel-button]:hidden"
              />
              {q && (
                <button type="button" onClick={() => setQ("")} className="text-small text-ink-soft link-underline">
                  Leeren
                </button>
              )}
              <RD.Close asChild>
                <IconButton label="Suche schließen" className="-mr-3">
                  <Icon icon={X} size={22} />
                </IconButton>
              </RD.Close>
            </form>

            <div className="py-8 md:py-10" aria-live="polite" aria-busy={loading}>
              {!showResults ? (
                <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr]">
                  {recent.length > 0 ? (
                    <section>
                      <h2 className="label mb-4 text-muted">Kürzlich angesehen</h2>
                      <ul className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                        {recent.slice(0, 4).map((r) => (
                          <li key={r.id}>
                            <Link href={`/produkt/${r.slug}`} onClick={close} className="group flex flex-col gap-2">
                              <span className="relative block aspect-[4/5] overflow-hidden bg-white">
                                {r.image && <Image src={r.image} alt="" fill sizes="120px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />}
                              </span>
                              <span className="text-caption leading-snug">
                                <span className="block text-muted">{r.brand}</span>
                                {r.name}
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </section>
                  ) : (
                    <section>
                      <h2 className="label mb-4 text-muted">Vorschläge</h2>
                      <ul className="flex flex-wrap gap-2">
                        {defaults.notes.map((n) => (
                          <li key={n}>
                            <button
                              type="button"
                              onClick={() => setQ(n)}
                              className="rounded-sm border border-line px-3 py-2 text-small text-ink-soft transition-colors hover:border-ink hover:text-ink press"
                            >
                              {n}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  )}
                  <section>
                    <h2 className="label mb-4 text-muted">Marken</h2>
                    <ul className="flex flex-col gap-2">
                      {defaults.brands.map((b) => (
                        <li key={b.slug}>
                          <Link href={`/marken/${b.slug}`} onClick={close} className="text-body text-ink-soft transition-colors hover:text-ink">
                            {b.name}
                          </Link>
                        </li>
                      ))}
                      <li>
                        <Link href="/marken" onClick={close} className="inline-flex items-center gap-1.5 text-small font-medium link-underline">
                          Alle Marken <Icon icon={ArrowRight} size={14} />
                        </Link>
                      </li>
                    </ul>
                  </section>
                  <section>
                    <h2 className="label mb-4 text-muted">Kategorien</h2>
                    <ul className="flex flex-col gap-2">
                      {defaults.categories.map((c) => (
                        <li key={c.slug}>
                          <Link href={`/${c.slug}`} onClick={close} className="text-body text-ink-soft transition-colors hover:text-ink">
                            {c.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              ) : loading && !data ? (
                <ResultsSkeleton />
              ) : data && data.products.length + data.brands.length + data.families.length + data.notes.length === 0 ? (
                <div className="max-w-lg">
                  <p className="font-display text-h3">Keine Treffer für „{q.trim()}“.</p>
                  <p className="mt-2 text-body text-ink-soft">
                    Prüfen Sie die Schreibweise oder suchen Sie nach einer Marke, einer Duftnote wie „Vanille“ oder einer Duftfamilie wie „holzig“.
                  </p>
                  <ul className="mt-5 flex flex-wrap gap-2">
                    {defaults.notes.slice(0, 5).map((n) => (
                      <li key={n}>
                        <button type="button" onClick={() => setQ(n)} className="rounded-sm border border-line px-3 py-2 text-small text-ink-soft hover:border-ink hover:text-ink">
                          {n}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : data ? (
                <div className={`grid gap-10 transition-opacity duration-150 lg:grid-cols-[1fr_16rem] ${loading ? "opacity-60" : ""}`}>
                  <section>
                    <div className="mb-4 flex items-baseline justify-between gap-4">
                      <h2 className="label text-muted">Produkte</h2>
                      {data.total > 0 && (
                        <button type="button" onClick={submit} className="inline-flex items-center gap-1.5 text-small font-medium link-underline">
                          Alle {data.total} Ergebnisse <Icon icon={ArrowRight} size={14} />
                        </button>
                      )}
                    </div>
                    <ul className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3">
                      {data.products.map((p) => (
                        <li key={p.id}>
                          <Link href={`/produkt/${p.slug}`} onClick={close} className="group grid grid-cols-[4.5rem_1fr] items-center gap-3">
                            <span className="relative block aspect-[4/5] overflow-hidden bg-white">
                              {p.images[0] && (
                                <Image src={p.images[0].url} alt="" fill sizes="72px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.04]" />
                              )}
                            </span>
                            <span className="min-w-0">
                              <span className="label block truncate text-[0.6875rem] text-muted">{p.brand.name}</span>
                              <span className="mt-1 block font-display text-[1.0625rem] leading-snug">{p.name}</span>
                              <span className="block text-caption text-ink-soft">{concentrationLabel(p.concentration)}</span>
                              <span className="numeric mt-1 block text-small font-medium">
                                {p.minPriceCents !== p.maxPriceCents && <span className="font-normal text-ink-soft">ab </span>}
                                {formatPrice(p.minPriceCents)}
                              </span>
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <aside className="flex flex-col gap-8">
                    {data.brands.length > 0 && (
                      <SuggestionList title="Marken" items={data.brands.map((b) => ({ label: b.name, href: `/marken/${b.slug}` }))} onNavigate={close} />
                    )}
                    {data.families.length > 0 && (
                      <SuggestionList title="Duftfamilien" items={data.families.map((f) => ({ label: f.label, href: `/parfum?family=${f.key}` }))} onNavigate={close} />
                    )}
                    {data.notes.length > 0 && (
                      <SuggestionList title="Duftnoten" items={data.notes.map((n) => ({ label: n, href: `/parfum?note=${encodeURIComponent(n)}` }))} onNavigate={close} />
                    )}
                  </aside>
                </div>
              ) : null}
            </div>
          </div>
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}

function SuggestionList({ title, items, onNavigate }: { title: string; items: { label: string; href: string }[]; onNavigate: () => void }) {
  return (
    <section>
      <h2 className="label mb-3 text-muted">{title}</h2>
      <ul className="flex flex-col gap-1.5">
        {items.map((i) => (
          <li key={i.href}>
            <Link href={i.href} onClick={onNavigate} className="text-body text-ink-soft transition-colors hover:text-ink">
              {i.label}
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

function ResultsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 sm:grid-cols-3" aria-label="Suche läuft">
      {Array.from({ length: 6 }, (_, i) => (
        <div key={i} className="grid grid-cols-[4.5rem_1fr] items-center gap-3">
          <Skeleton className="aspect-[4/5]" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-2.5 w-16" />
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-3 w-14" />
          </div>
        </div>
      ))}
    </div>
  );
}
