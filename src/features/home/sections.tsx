import { ArrowRight, Clock, MapPin } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder, Placeholder } from "@/components/ui/placeholder";
import { FAMILIES } from "@/config/catalog";
import { ProductCard } from "@/features/catalog/product-card";
import { ProductRail } from "@/features/catalog/product-rail";
import type { ShopSettings } from "@/lib/settings-schema";
import type { BrandDTO, ProductCardDTO } from "@/types/catalog";
import { SectionHeader } from "./section-header";

/* ---------------------------------------------------------------- Hero */

export function Hero({ settings }: { settings: ShopSettings }) {
  const h = settings.home;
  return (
    <section aria-labelledby="hero-title" className="container-page">
      <div className="grid grid-cols-1 gap-8 pt-4 pb-4 md:min-h-[calc(100dvh-var(--header-height)-var(--service-bar-height))] md:grid-cols-12 md:items-stretch md:gap-6 md:pb-10">
        <div className="hero-media relative order-1 aspect-[4/5] overflow-hidden bg-porcelain md:order-2 md:col-span-7 md:aspect-auto md:min-h-[34rem]">
          <Image
            src={h.heroImageUrl}
            alt={h.heroImageAlt}
            fill
            priority
            sizes="(min-width: 768px) 58vw, 100vw"
            className="object-cover object-[50%_60%]"
          />
        </div>
        <div className="hero-copy order-2 flex flex-col justify-end gap-6 md:order-1 md:col-span-5 md:pr-6 md:pb-6 lg:pr-12">
          <h1 id="hero-title" className="font-display text-display" style={{ ["--i" as string]: 0 }}>
            {h.heroHeadline}
          </h1>
          <p className="max-w-md text-body-lg text-ink-soft" style={{ ["--i" as string]: 1 }}>
            {h.heroSubline}
          </p>
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4 pt-2" style={{ ["--i" as string]: 2 }}>
            <ButtonLink href={h.heroPrimaryHref} size="lg">
              {h.heroPrimaryLabel}
            </ButtonLink>
            <TextLink href={h.heroSecondaryHref}>
              {h.heroSecondaryLabel}
              <Icon icon={ArrowRight} size={16} />
            </TextLink>
          </div>
        </div>
      </div>
    </section>
  );
}

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

/* ---------------------------------------------------------------- Empfehlungen (editorial) */

export function Curated({ products }: { products: ProductCardDTO[] }) {
  if (products.length < 2) return null;
  const [lead, ...rest] = products;
  const leadImage = lead.images.find((i) => i.kind === "lifestyle") ?? lead.images[0];
  return (
    <section aria-labelledby="curated-title" className="container-page section-space">
      <SectionHeader id="curated-title" title="Unsere Empfehlungen" />
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
        <Link href={`/produkt/${lead.slug}`} className="group relative block lg:col-span-6">
          <span className="relative block aspect-[4/5] overflow-hidden bg-porcelain">
            {leadImage && (
              <Image src={leadImage.url} alt={leadImage.alt} fill sizes="(min-width: 1024px) 48vw, 100vw" className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.02]" />
            )}
          </span>
          <span className="mt-5 flex flex-col gap-1">
            <span className="label text-[0.6875rem] text-muted">{lead.brand.name}</span>
            <span className="font-display text-h2">{lead.name}</span>
            <span className="max-w-md text-small text-ink-soft">
              {lead.notes.slice(0, 4).join(", ")}
            </span>
          </span>
        </Link>
        <ul className="grid grid-cols-2 gap-x-4 gap-y-12 lg:col-span-6 lg:gap-x-6 lg:pt-16">
          {rest.slice(0, 4).map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Für Sie (typografischer Index) */

export function ForYou({ counts }: { counts: { women: number; men: number; unisex: number } }) {
  const items = [
    { label: "Damen", href: "/damen", count: counts.women },
    { label: "Herren", href: "/herren", count: counts.men },
    { label: "Unisex", href: "/unisex", count: counts.unisex },
  ];
  return (
    <section aria-labelledby="foryou-title" className="container-page section-space">
      <h2 id="foryou-title" className="sr-only">
        Düfte für Damen, Herren und Unisex
      </h2>
      <ul className="border-t border-line">
        {items.map((i) => (
          <li key={i.href} className="border-b border-line">
            <Link href={i.href} className="group flex items-baseline justify-between gap-6 py-6 md:py-8">
              <span className="font-display text-[clamp(2.5rem,1.4rem+4.6vw,5.5rem)] leading-none tracking-[-0.02em] transition-transform duration-500 ease-out group-hover:translate-x-2">
                {i.label}
              </span>
              <span className="flex items-center gap-3 text-small text-ink-soft">
                <span className="numeric">{i.count} Düfte</span>
                <Icon icon={ArrowRight} size={20} className="transition-transform duration-300 ease-out group-hover:translate-x-1" />
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------------------------------------------------------------- Nischendüfte */

export function NicheFeature({ products }: { products: ProductCardDTO[] }) {
  if (!products.length) return null;
  const hero = products[0];
  const image = hero.images.find((i) => i.kind === "lifestyle") ?? hero.images[0];
  return (
    <section aria-labelledby="niche-title" className="bg-porcelain">
      <div className="container-page section-space grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
        <div className="flex flex-col gap-6 lg:col-span-4 lg:pr-10">
          <h2 id="niche-title" className="font-display text-h1">
            Nischendüfte
          </h2>
          <p className="text-body-lg text-ink-soft">
            Unabhängige Parfumhäuser und kleine Manufakturen: Düfte mit eigener Handschrift, abseits der großen Kampagnen.
          </p>
          <div>
            <ButtonLink href="/nischenduefte" variant="secondary">
              Nischendüfte entdecken
            </ButtonLink>
          </div>
        </div>
        <div className="relative aspect-[4/5] overflow-hidden bg-mist lg:col-span-4">
          {image && <Image src={image.url} alt={image.alt} fill sizes="(min-width: 1024px) 32vw, 100vw" className="object-cover" />}
        </div>
        <ul className="flex flex-col divide-y divide-line border-y border-line lg:col-span-4 lg:self-end">
          {products.slice(0, 5).map((p) => (
            <li key={p.id}>
              <Link href={`/produkt/${p.slug}`} className="group flex items-center justify-between gap-4 py-4">
                <span className="min-w-0">
                  <span className="label block text-[0.6875rem] text-muted">{p.brand.name}</span>
                  <span className="mt-1 block font-display text-[1.25rem] leading-tight">{p.name}</span>
                </span>
                <Icon icon={ArrowRight} size={18} className="shrink-0 text-ink-soft transition-transform duration-300 ease-out group-hover:translate-x-1" />
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

/* ---------------------------------------------------------------- Parfümerie Liebe Hannover */

export function StoreTeaser({ settings }: { settings: ShopSettings }) {
  const s = settings.store;
  const address = s.street && s.postalCode ? `${s.street}, ${s.postalCode} ${s.city}` : null;
  const today = s.openingHours.find((o) => o.hours);
  return (
    <section aria-labelledby="store-title" className="container-page section-space">
      <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-7">
          {s.imageUrl ? (
            <div className="relative aspect-[4/3] overflow-hidden bg-porcelain">
              <Image src={s.imageUrl} alt={s.imageAlt || "Die Parfümerie Liebe in Hannover"} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
            </div>
          ) : (
            <ImagePlaceholder label="Foto der Parfümerie Liebe in Hannover" className="aspect-[4/3]" />
          )}
        </div>
        <div className="flex flex-col justify-center gap-6 md:col-span-5 md:pl-6 lg:pl-12">
          <h2 id="store-title" className="font-display text-h1">
            Parfümerie Liebe in {s.city}
          </h2>
          {s.about ? (
            <p className="text-body-lg text-ink-soft">{s.about}</p>
          ) : (
            <p className="text-body-lg text-ink-soft">
              Der Online-Shop gehört zu unserer Parfümerie in {s.city}. Dort beraten wir Sie persönlich und Sie können Düfte in Ruhe testen.
            </p>
          )}
          <dl className="flex flex-col gap-3 text-small">
            <div className="flex items-start gap-3">
              <dt className="sr-only">Adresse</dt>
              <Icon icon={MapPin} size={18} className="mt-0.5 shrink-0 text-ink-soft" />
              <dd>{address ?? <Placeholder>Adresse</Placeholder>}</dd>
            </div>
            <div className="flex items-start gap-3">
              <dt className="sr-only">Öffnungszeiten</dt>
              <Icon icon={Clock} size={18} className="mt-0.5 shrink-0 text-ink-soft" />
              <dd>{today ? `${today.day}: ${today.hours}` : <Placeholder>Öffnungszeiten</Placeholder>}</dd>
            </div>
          </dl>
          <div>
            <ButtonLink href="/parfuemerie" variant="secondary">
              Zur Parfümerie
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
