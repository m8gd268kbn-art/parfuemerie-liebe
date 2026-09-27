import Image from "next/image";
import Link from "next/link";
import { FAMILIES } from "@/config/catalog";
import { ProductCard } from "@/features/catalog/product-card";
import { ProductRail } from "@/features/catalog/product-rail";
import type { BrandDTO, ProductCardDTO } from "@/types/catalog";
import { SectionHeader } from "./section-header";

/* ---------------------------------------------------------------- Produktreihen */

export function ProductRow({ id, title, href, linkLabel, products }: { id: string; title: string; href: string; linkLabel: string; products: ProductCardDTO[] }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby={id} className="container-page section-space">
      <SectionHeader id={id} title={title} href={href} linkLabel={linkLabel} />
      <ProductRail label={title}>
        {products.map((p) => (
          <li key={p.id} className="snap-start">
            <ProductCard product={p} />
          </li>
        ))}
      </ProductRail>
    </section>
  );
}

export function ProductGridSection({ id, title, href, linkLabel, products }: { id: string; title: string; href: string; linkLabel: string; products: ProductCardDTO[] }) {
  if (!products.length) return null;
  return (
    <section aria-labelledby={id} className="container-page section-space">
      <SectionHeader id={id} title={title} href={href} linkLabel={linkLabel} />
      <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {products.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} />
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- Duftwelten */

const WORLD_ORDER = ["fresh", "woody", "amber", "floral", "gourmand", "citrus", "aromatic", "musk"];

export function ScentWorlds({ counts }: { counts: Record<string, number> }) {
  const worlds = WORLD_ORDER.map((k) => FAMILIES.find((f) => f.key === k)!).filter((f) => (counts[f.key] ?? 0) > 0);
  if (!worlds.length) return null;
  return (
    <section aria-labelledby="worlds-title" className="bg-porcelain">
      <div className="container-page section-space">
        <SectionHeader id="worlds-title" title="Duftwelten">
          Die Farbe im Glas verrät die Familie. Wählen Sie eine Richtung, wir zeigen die passenden Düfte.
        </SectionHeader>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-10 md:grid-cols-4 md:gap-x-6">
          {worlds.map((f) => (
            <li key={f.key}>
              <Link href={`/parfum?family=${f.key}`} className="group flex flex-col gap-3">
                <span className="relative block aspect-[4/5] overflow-hidden bg-mist">
                  <Image
                    src={`/media/worlds/${f.key}.webp`}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 24vw, 48vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                </span>
                <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:justify-between sm:gap-3">
                  <span className="font-display text-h3">{f.world}</span>
                  <span className="numeric text-caption whitespace-nowrap text-muted">{counts[f.key]} Düfte</span>
                </span>
                <span className="-mt-2 text-small text-ink-soft">{f.description}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Marken */

export function BrandIndex({ brands }: { brands: BrandDTO[] }) {
  const list = brands.filter((b) => b.productCount > 0);
  if (!list.length) return null;
  return (
    <section aria-labelledby="brands-title" className="container-page section-space">
      <SectionHeader id="brands-title" title="Marken entdecken" href="/marken" linkLabel="Alle Marken von A bis Z" />
      <ul className="columns-2 gap-6 md:columns-3 xl:columns-4">
        {list.map((b) => (
          <li key={b.id} className="break-inside-avoid">
            <Link href={`/marken/${b.slug}`} className="group flex items-baseline gap-3 py-2.5">
              <span className="font-display text-[1.375rem] leading-tight transition-colors duration-150 group-hover:text-accent md:text-[1.625rem]">
                {b.name}
              </span>
              <span className="numeric text-caption text-muted">{b.productCount}</span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
