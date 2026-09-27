import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder, Placeholder } from "@/components/ui/placeholder";
import { StoreInfo } from "@/features/content/store-info";
import { breadcrumbJsonLd, JsonLd, localBusinessJsonLd } from "@/lib/seo";
import { getBrands } from "@/services/catalog";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = {
  title: "Unsere Parfümerie in Hannover",
  description: "Die Parfümerie Liebe in Hannover: persönliche Beratung, Düfte zum Testen, Adresse und Öffnungszeiten.",
  alternates: { canonical: "/parfuemerie" },
};

export default async function StorePage() {
  const [settings, brands] = await Promise.all([getSettings(), getBrands()]);
  const s = settings.store;
  const crumbs = [{ label: "Startseite", href: "/" }, { label: "Unsere Parfümerie", href: "/parfuemerie" }];
  return (
    <>
      <JsonLd data={localBusinessJsonLd(settings)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div className="container-page pt-8">
        <Breadcrumbs items={crumbs} />
        <header className="mt-8 grid gap-10 md:mt-10 md:grid-cols-12 md:gap-6">
          <div className="flex flex-col justify-end gap-5 md:col-span-5">
            <h1 className="font-display text-display">Parfümerie Liebe</h1>
            <p className="text-body-lg text-ink-soft">
              {s.about || `Unsere Parfümerie in ${s.city}. Hier testen Sie Düfte in Ruhe und lassen sich persönlich beraten. Den Online-Shop führen wir aus demselben Sortiment.`}
            </p>
          </div>
          <div className="md:col-span-7">
            {s.imageUrl ? (
              <div className="relative aspect-[4/3] overflow-hidden bg-porcelain">
                <Image src={s.imageUrl} alt={s.imageAlt || `Die Parfümerie Liebe in ${s.city}`} fill priority sizes="(min-width: 768px) 58vw, 100vw" className="object-cover" />
              </div>
            ) : (
              <ImagePlaceholder label="Foto der Parfümerie Liebe (außen oder Verkaufsraum)" className="aspect-[4/3]" />
            )}
          </div>
        </header>
      </div>

      <section aria-labelledby="history-title" className="container-page section-space grid gap-8 md:grid-cols-12 md:gap-6">
        <h2 id="history-title" className="font-display text-h2 md:col-span-4">Geschichte</h2>
        <div className="text-body-lg text-ink-soft md:col-span-7 md:col-start-6">
          {s.history ? <p className="whitespace-pre-line">{s.history}</p> : <Placeholder>Geschichte der Parfümerie Liebe (Gründung, Inhaberin/Inhaber, Team)</Placeholder>}
        </div>
      </section>

      <section id="beratung" aria-labelledby="advice-title" className="scroll-mt-28 bg-porcelain">
        <div className="container-page section-space grid gap-10 md:grid-cols-12 md:gap-6">
          <div className="md:col-span-5">
            <h2 id="advice-title" className="font-display text-h1">Beratung</h2>
            <p className="mt-4 text-body-lg text-ink-soft">Ein Duft entfaltet sich auf der Haut. In der Parfümerie nehmen wir uns Zeit, gemeinsam mit Ihnen zu testen, bis er passt.</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <ButtonLink href="/kontakt">Kontakt aufnehmen</ButtonLink>
              <ButtonLink href="/duftfinder" variant="secondary">Online-Duftfinder</ButtonLink>
            </div>
          </div>
          <div className="md:col-span-6 md:col-start-7">
            <h3 className="mb-4 text-small font-semibold">Services vor Ort</h3>
            {s.services.length ? (
              <ul className="divide-y divide-line border-y border-line">
                {s.services.map((x) => <li key={x} className="py-3 text-body">{x}</li>)}
              </ul>
            ) : (
              <Placeholder>Liste der Services (z. B. Beratung, Proben, Verpackung) im Admin pflegen</Placeholder>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="visit-title" className="container-page section-space grid gap-10 md:grid-cols-12 md:gap-6">
        <div className="md:col-span-5">
          <h2 id="visit-title" className="font-display text-h2">Besuchen Sie uns</h2>
          <p className="mt-3 text-body text-ink-soft">{s.directions || "Anfahrt, Parkmöglichkeiten und Haltestellen folgen."}</p>
          {s.mapUrl ? (
            <a href={s.mapUrl} target="_blank" rel="noopener noreferrer" className="mt-6 inline-flex items-center gap-2 text-small font-medium link-underline">
              In der Karte öffnen <Icon icon={ArrowUpRight} size={14} />
            </a>
          ) : (
            <p className="mt-6"><Placeholder>Link zur Karte</Placeholder></p>
          )}
        </div>
        <div className="md:col-span-6 md:col-start-7">
          <StoreInfo settings={settings} />
        </div>
      </section>

      <section aria-labelledby="store-brands" className="container-page pb-[var(--section-space)]">
        <h2 id="store-brands" className="mb-6 font-display text-h3">Marken, die Sie auch online finden</h2>
        <ul className="flex flex-wrap gap-2">
          {brands.filter((b) => b.productCount > 0).map((b) => (
            <li key={b.id}>
              <Link href={`/marken/${b.slug}`} className="inline-flex h-10 items-center rounded-sm border border-line px-4 text-small hover:border-ink">{b.name}</Link>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
