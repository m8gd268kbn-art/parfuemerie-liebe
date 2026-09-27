import { ArrowCounterClockwise, ArrowRight, ArrowUpRight, Gift, LockSimple, Truck } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";
import { ButtonLink, TextLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder } from "@/components/ui/placeholder";
import { defaultMethod } from "@/lib/commerce/shipping";
import { formatPrice } from "@/lib/format";
import type { ShopSettings } from "@/lib/settings-schema";
import { cn } from "@/lib/utils";

/*
 * Editorialer Aufbau der Startseite: großes Wort mit freigestelltem Motiv, Kategorie-Band mit
 * Ziffern, geteilter Abschnitt mit schräger Kante, Service-Zeile. Farben und Schriften bleiben
 * die der Parfümerie Liebe (DESIGN.md), nur die Struktur folgt der Vorlage des Auftraggebers.
 */

/** Laufweite eines Worts in Bodoni-Versalien (em), damit es genau die Containerbreite füllt. */
function wordEm(word: string) {
  const narrow = new Set(["I", "J", "1"]);
  const wide = new Set(["M", "W", "Ö", "O", "Q", "C", "G", "D"]);
  let em = 0;
  for (const ch of word.toUpperCase()) em += narrow.has(ch) ? 0.36 : wide.has(ch) ? 0.82 : ch === " " ? 0.3 : 0.64;
  // Kalibriert an Bodoni Moda (optische Größe bei Plakatgröße): füllt 93 bis 99 % der Breite.
  return Math.max(1, em * 0.905);
}

/* ---------------------------------------------------------------- Hero */

export function Hero({ settings }: { settings: ShopSettings }) {
  const h = settings.home;
  const s = settings.store;
  const word = (h.heroWord || "Liebe").toUpperCase();
  return (
    <section aria-labelledby="hero-title" className="container-page overflow-hidden">
      <div className="relative flex flex-col pt-6 pb-8 md:min-h-[calc(100dvh-var(--header-height)-var(--service-bar-height))] md:pt-10 md:pb-12">
        <div className="hero-copy relative z-20 flex items-start justify-between gap-6">
          <div className="max-w-[20rem]" style={{ ["--i" as string]: 0 }}>
            <h1 id="hero-title" className="label text-[0.75rem] leading-[1.7] tracking-[0.2em] text-ink">
              {h.heroHeadline}
            </h1>
            <p className="mt-3 text-small text-ink-soft">{h.heroSubline}</p>
          </div>
          {s.foundedYear && <SinceBadge year={s.foundedYear} city={s.city} />}
        </div>

        {/* Bühne: das Wort hinter dem freigestellten Motiv */}
        <div className="relative my-4 flex min-h-[19rem] flex-1 items-center justify-center sm:min-h-[26rem] md:my-0 md:min-h-[24rem]">
          <p aria-hidden="true" className="hero-word font-display whitespace-nowrap text-ink select-none" style={{ "--word-em": wordEm(word) } as CSSProperties}>
            {word}
          </p>
          {/* Höhe an die Viewportbreite gekoppelt: das Motiv verdeckt bei jeder Breite etwa gleich viel vom Wort */}
          <div className="hero-bottle absolute bottom-0 left-1/2 z-10 aspect-[1400/1674] h-[min(100%,62vw)] -translate-x-1/2 md:h-[min(calc(100%+6rem),62vw)]">
            <Image src={h.heroImageUrl} alt={h.heroImageAlt} fill priority sizes="(min-width: 768px) 40vw, 80vw" className="object-contain object-bottom" />
          </div>
        </div>

        <div className="hero-copy relative z-20 flex flex-wrap items-end justify-between gap-x-8 gap-y-5">
          <div className="flex flex-wrap items-center gap-x-8 gap-y-4" style={{ ["--i" as string]: 1 }}>
            <ButtonLink href={h.heroPrimaryHref} size="lg">
              {h.heroPrimaryLabel}
              <Icon icon={ArrowUpRight} size={16} />
            </ButtonLink>
            <TextLink href={h.heroSecondaryHref}>{h.heroSecondaryLabel}</TextLink>
          </div>
          <p className="label hidden text-right text-[0.6875rem] leading-[1.9] tracking-[0.18em] text-ink-soft sm:block" style={{ ["--i" as string]: 2 }}>
            {s.city}
            <br />
            <span className="border-b border-ink pb-0.5 text-ink">Seit {s.foundedYear}</span>
          </p>
        </div>
      </div>
    </section>
  );
}

/** Runder Stempel mit umlaufender Schrift (statisch, keine Dauerbewegung). */
function SinceBadge({ year, city }: { year: string; city: string }) {
  const text = `Parfümerie Liebe · ${city} · seit ${year} · `;
  return (
    <div className="relative hidden size-28 shrink-0 text-ink md:block" style={{ ["--i" as string]: 1 }} aria-label={`Parfümerie Liebe, ${city}, seit ${year}`} role="img">
      <svg viewBox="0 0 120 120" className="size-full" aria-hidden="true">
        <defs>
          <path id="since-circle" d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0" />
        </defs>
        <circle cx="60" cy="60" r="58" fill="none" stroke="currentColor" strokeWidth="0.75" />
        <text className="fill-current font-sans text-[9.2px] font-semibold tracking-[0.2em] uppercase">
          <textPath href="#since-circle" textLength="286">
            {text}
          </textPath>
        </text>
      </svg>
      <span className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 font-display text-[1.5rem] leading-none">{year}</span>
    </div>
  );
}

/* ---------------------------------------------------------------- Kategorie-Band */

export function CategoryBand({ counts }: { counts: { women: number; men: number; unisex: number; niche: number } }) {
  const items = [
    { label: "Damen", href: "/damen", count: counts.women, image: "/media/cutouts/damen.webp", alt: "Runder Flakon mit roséfarbener Flüssigkeit" },
    { label: "Herren", href: "/herren", count: counts.men, image: "/media/cutouts/herren.webp", alt: "Rechteckiger Flakon aus dunkelblauem Glas" },
    { label: "Unisex", href: "/unisex", count: counts.unisex, image: "/media/cutouts/unisex.webp", alt: "Zylindrischer Flakon mit hellgoldener Flüssigkeit" },
    { label: "Nischendüfte", href: "/nischenduefte", count: counts.niche, image: "/media/cutouts/nische.webp", alt: "Kantiger Flakon mit bernsteinfarbener Flüssigkeit" },
  ];
  return (
    <section aria-labelledby="categories-title" className="bg-porcelain">
      <div className="container-page py-8 md:py-12">
        <h2 id="categories-title" className="sr-only">
          Düfte nach Kategorie
        </h2>
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
          {items.map((c, i) => (
            <li key={c.href}>
              <Link href={c.href} className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden border border-line bg-paper p-4 transition-colors duration-200 hover:border-line-strong md:aspect-[3/4] md:p-5">
                <span aria-hidden="true" className="numeric absolute top-2 left-4 font-display text-[3.75rem] leading-none text-transparent [-webkit-text-stroke:1px_var(--color-line-strong)] md:top-3 md:left-5 md:text-[5rem]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="absolute right-[-6%] bottom-[6%] h-[64%] w-[62%] transition-transform duration-500 ease-out group-hover:-translate-y-1 md:h-[70%]">
                  <Image src={c.image} alt={c.alt} fill sizes="(min-width: 768px) 14vw, 30vw" className="object-contain object-bottom" />
                </span>
                <span className="relative z-10 flex flex-col gap-1">
                  <span className="label text-[0.75rem] text-ink">{c.label}</span>
                  <span className="numeric text-caption text-ink-soft">{c.count} Düfte</span>
                  <span className="label mt-2 inline-flex items-center gap-1.5 text-[0.6875rem] text-ink">
                    <span className="link-underline">Ansehen</span>
                    <Icon icon={ArrowRight} size={12} className="transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Geteilter Abschnitt mit schräger Kante */

export function HouseSplit({ settings }: { settings: ShopSettings }) {
  const s = settings.store;
  const title = `Unser Haus in ${s.city}`;
  return (
    <section aria-labelledby="house-title" className="container-page section-space">
      <div className="relative grid grid-cols-1 overflow-hidden bg-porcelain md:min-h-[34rem] md:grid-cols-12">
        <div className="relative order-1 aspect-[4/3] md:absolute md:inset-y-0 md:right-0 md:order-none md:aspect-auto md:w-[58%] md:[clip-path:polygon(22%_0,100%_0,100%_100%,0_100%)]">
          {s.imageUrl ? (
            <Image src={s.imageUrl} alt={s.imageAlt || `Die Parfümerie Liebe in ${s.city}`} fill sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
          ) : (
            <ImagePlaceholder label="Foto der Parfümerie Liebe" className="size-full" />
          )}
        </div>
        <div className="relative order-2 flex flex-col justify-center gap-6 p-6 sm:p-10 md:col-span-6 md:py-16 md:pr-6 md:pl-14 lg:pl-16">
          <h2 id="house-title" className="font-display text-h1">
            {title}
          </h2>
          <p className="max-w-md text-body-lg text-ink-soft">{s.about}</p>
          {s.street && (
            <p className="text-small text-ink-soft">
              {s.street}, {s.postalCode} {s.city}
            </p>
          )}
          <div>
            <ButtonLink href="/parfuemerie" variant="secondary">
              Unsere Parfümerie
              <Icon icon={ArrowUpRight} size={16} />
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------------------------------------------------------- Service-Zeile */

export function ServiceRow({ settings }: { settings: ShopSettings }) {
  const method = defaultMethod(settings);
  const items = [
    method && {
      icon: Truck,
      title: method.freeFromCents != null ? `Versandkostenfrei ab ${formatPrice(method.freeFromCents)}` : `Versand ${formatPrice(method.priceCents)}`,
      text: method.deliveryTime ? `Lieferzeit ${method.deliveryTime}` : method.name,
    },
    { icon: ArrowCounterClockwise, title: `${settings.returns.withdrawalDays} Tage Widerrufsrecht`, text: "Details in der Widerrufsbelehrung" },
    settings.samples.enabled && settings.samples.maxCount > 0 && {
      icon: Gift,
      title: `${settings.samples.maxCount} Duftproben gratis`,
      text: "Zu jeder Bestellung wählbar",
    },
    { icon: LockSimple, title: "Sicher bezahlen", text: "Zahlungsdaten werden nicht bei uns gespeichert" },
  ].filter((x): x is { icon: typeof Truck; title: string; text: string } => Boolean(x));
  return (
    <section aria-label="Service" className="border-y border-line">
      <ul className="container-page grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((it, i) => (
          <li
            key={it.title}
            className={cn(
              "flex items-center gap-4 border-line py-5 lg:py-7",
              i > 0 && "border-t lg:border-t-0 lg:border-l lg:pl-6",
              i === 1 && "sm:border-t-0",
              i % 2 === 1 && "sm:border-l sm:pl-6",
            )}
          >
            <Icon icon={it.icon} size={28} className="shrink-0 text-ink" />
            <div>
              <p className="label text-[0.6875rem] text-ink">{it.title}</p>
              <p className="mt-1 text-caption text-ink-soft">{it.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
