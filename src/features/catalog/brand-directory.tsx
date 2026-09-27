"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import type { BrandDTO } from "@/types/catalog";

const LETTERS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

function letterOf(name: string) {
  const c = name.normalize("NFKD").replace(/[̀-ͯ]/g, "").charAt(0).toUpperCase();
  return /[A-Z]/.test(c) ? c : "#";
}

/** Marken A-Z mit Buchstaben-Navigation und Filterfeld. */
export function BrandDirectory({ brands }: { brands: BrandDTO[] }) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => brands.filter((b) => b.name.toLowerCase().includes(q.trim().toLowerCase())), [brands, q]);
  const groups = useMemo(() => Map.groupBy(filtered, (b) => letterOf(b.name)), [filtered]);
  return (
    <div>
      <div className="sticky top-[var(--header-height)] z-20 -mx-[var(--gutter)] border-b border-line bg-paper px-[var(--gutter)] py-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <label className="relative block md:w-72">
            <span className="sr-only">Marke suchen</span>
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Marke suchen" className="h-11 w-full rounded-sm border border-line-strong bg-white px-4 text-small placeholder:text-muted focus:border-ink focus:outline-none" />
          </label>
          <nav aria-label="Marken nach Anfangsbuchstabe" className="no-scrollbar overflow-x-auto">
            <ul className="flex gap-1">
              {LETTERS.map((l) => {
                const has = groups.has(l);
                return (
                  <li key={l}>
                    {has ? (
                      <a href={`#marken-${l}`} className="inline-flex size-8 items-center justify-center rounded-full text-small hover:bg-porcelain">{l}</a>
                    ) : (
                      <span className="inline-flex size-8 items-center justify-center text-small text-line-strong" aria-hidden="true">{l}</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>
      </div>
      {filtered.length === 0 ? (
        <p className="py-16 text-body text-ink-soft">Keine Marke gefunden. Vielleicht führen wir sie in der Parfümerie, fragen Sie uns gern.</p>
      ) : (
        <div className="divide-y divide-line">
          {LETTERS.filter((l) => groups.has(l)).map((l) => (
            <section key={l} id={`marken-${l}`} aria-labelledby={`h-${l}`} className="grid grid-cols-1 scroll-mt-40 gap-4 py-8 md:grid-cols-[6rem_1fr]">
              <h2 id={`h-${l}`} className="font-display text-h2 text-muted">{l}</h2>
              <ul className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
                {groups.get(l)!.map((b) => (
                  <li key={b.id}>
                    <Link href={`/marken/${b.slug}`} className="group flex items-baseline gap-3 py-1">
                      <span className="font-display text-[1.375rem] transition-colors group-hover:text-accent">{b.name}</span>
                      <span className="numeric text-caption text-muted">{b.productCount}</span>
                      {b.niche && <span className="text-caption text-muted">Nische</span>}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
