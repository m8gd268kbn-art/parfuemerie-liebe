"use client";

import Image from "next/image";
import Link from "next/link";
import { useRecentlyViewed } from "@/features/search/recently-viewed";

export function RecentlyViewedRow({ excludeId }: { excludeId?: string }) {
  const items = useRecentlyViewed(excludeId);
  if (items.length === 0) return null;
  return (
    <section aria-labelledby="recent-title" className="container-page pb-[var(--section-space)]">
      <h2 id="recent-title" className="mb-6 font-display text-h3">
        Zuletzt angesehen
      </h2>
      <ul className="no-scrollbar -mx-[var(--gutter)] flex gap-4 overflow-x-auto px-[var(--gutter)]">
        {items.slice(0, 8).map((r) => (
          <li key={r.id} className="w-32 shrink-0 md:w-40">
            <Link href={`/produkt/${r.slug}`} className="group flex flex-col gap-2">
              <span className="relative block aspect-[4/5] overflow-hidden bg-porcelain">
                {r.image && <Image src={r.image} alt="" fill sizes="160px" className="object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]" />}
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
  );
}
