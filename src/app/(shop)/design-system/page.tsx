import { Heart, MagnifyingGlass, ShoppingBag } from "@phosphor-icons/react/dist/ssr";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Button, IconButton, TextLink } from "@/components/ui/button";
import { Check, Field, Input, Select } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { ImagePlaceholder, Placeholder } from "@/components/ui/placeholder";
import { Price } from "@/components/ui/price";
import { Skeleton } from "@/components/ui/skeleton";
import { Stars } from "@/components/ui/stars";
import { FAMILIES } from "@/config/catalog";
import { ProductCard } from "@/features/catalog/product-card";
import { LoadingDemo, QuantityDemo, ToastDemo } from "@/features/content/ds-demos";
import { Intensity, NoteLayers } from "@/features/product/scent-profile";
import { getCurrentUser } from "@/services/auth/session";
import { getCatalog, getProductDetail } from "@/services/catalog";

export const metadata: Metadata = { title: "Design-System (intern)", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

const COLORS: { name: string; token: string; hex: string; use: string }[] = [
  { name: "Paper", token: "paper", hex: "#fafaf7", use: "Seitengrund" },
  { name: "White", token: "white", hex: "#ffffff", use: "Produktflächen, Felder" },
  { name: "Porcelain", token: "porcelain", hex: "#f2f1ec", use: "Ruhige Flächen, Bildplatten" },
  { name: "Mist", token: "mist", hex: "#e9e7e1", use: "Skeletons, deaktiviert" },
  { name: "Line", token: "line", hex: "#e3e0d9", use: "Haarlinien (dekorativ)" },
  { name: "Line strong", token: "line-strong", hex: "#8c877e", use: "Feldränder (≥ 3:1)" },
  { name: "Ink", token: "ink", hex: "#1b1e1f", use: "Text, Anthrazit" },
  { name: "Ink soft", token: "ink-soft", hex: "#3e4244", use: "Sekundärtext" },
  { name: "Muted", token: "muted", hex: "#67635c", use: "Tertiärtext (≥ 4.5:1)" },
  { name: "Liebe-Rot (Logo)", token: "brand", hex: "#ff0000", use: "Nur der Schriftzug" },
  { name: "Liebe-Rot", token: "accent", hex: "#e30613", use: "Primärknopf, Service-Leiste, Zähler, Herz" },
  { name: "Liebe-Rot tief", token: "accent-strong", hex: "#b8101f", use: "Hover, Textauswahl" },
  { name: "Rosé", token: "accent-soft", hex: "#fce8e9", use: "Auswahl-Hintergrund" },
  { name: "Positiv", token: "positive", hex: "#1f6040", use: "Auf Lager, gespeichert, Ersparnis" },
  { name: "Danger", token: "danger", hex: "#9b2c2c", use: "Fehler" },
  { name: "Warning", token: "warning", hex: "#7a5212", use: "Hinweise" },
];

const TYPE: { cls: string; label: string; sample: string }[] = [
  { cls: "font-display text-display", label: "Display · Bodoni Moda", sample: "Der Duft, der bleibt." },
  { cls: "font-display text-h1", label: "H1 · Bodoni Moda", sample: "Nischendüfte" },
  { cls: "font-display text-h2", label: "H2 · Bodoni Moda", sample: "Aus unserer Parfümerie" },
  { cls: "text-h3 font-semibold", label: "H3 · Mona Sans", sample: "Kopf-, Herz- und Basisnote" },
  { cls: "text-body-lg", label: "Body large", sample: "Parfums und Nischendüfte, ausgewählt in Hannover." },
  { cls: "text-body", label: "Body", sample: "Versand in 2 bis 4 Werktagen. Duftproben zu jeder Bestellung." },
  { cls: "text-small text-ink-soft", label: "Small", sample: "Inkl. MwSt., zzgl. Versand" },
  { cls: "text-caption text-muted", label: "Caption", sample: "129,00 € / 100 ml" },
  { cls: "label", label: "Label · Mona Sans breit", sample: "Eau de Parfum" },
];

function Section({ id, title, intro, children }: { id: string; title: string; intro?: string; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-t`} className="border-t border-line py-14">
      <h2 id={`${id}-t`} className="font-display text-h2">{title}</h2>
      {intro && <p className="mt-3 max-w-2xl text-body text-ink-soft">{intro}</p>}
      <div className="mt-10">{children}</div>
    </section>
  );
}

export default async function DesignSystemPage() {
  // Intern: in Produktion nur für Admins sichtbar, zusätzlich noindex (Meta + X-Robots-Tag).
  if (process.env.NODE_ENV === "production") {
    const user = await getCurrentUser();
    if (user?.role !== "admin") notFound();
  }
  const catalog = await getCatalog();
  const sample = catalog.find((p) => p.onSale) ?? catalog[0];
  const detail = sample ? await getProductDetail(sample.slug) : null;

  return (
    <div className="container-page py-12">
      <Breadcrumbs items={[{ label: "Start", href: "/" }, { label: "Design-System" }]} />
      <header className="mt-8 max-w-3xl">
        <h1 className="font-display text-h1">Design-System</h1>
        <p className="mt-4 text-body-lg text-ink-soft">
          Richtung „Das Haus Liebe“: weißer Stein, Rundbögen und die rote Schrift des Stammhauses in der Karmarschstraße. Liebe-Rot ist der einzige Markenakzent, Anthrazit trägt Text und Bedienung, Farbe im Produktbild kommt aus den Flüssigkeiten im Glas. Interne Referenz, nicht indexiert.
        </p>
        <nav aria-label="Abschnitte" className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-small">
          {[["farben", "Farben"], ["typo", "Typografie"], ["form", "Form und Bewegung"], ["aktionen", "Aktionen"], ["felder", "Formulare"], ["anzeige", "Anzeige"], ["produkt", "Produkt"]].map(([id, l]) => (
            <a key={id} href={`#${id}`} className="link-underline text-ink-soft">{l}</a>
          ))}
        </nav>
      </header>

      <Section id="farben" title="Farben" intro="Kontraste nach WCAG AA. Tailwind-Standardfarben sind entfernt; nur diese Tokens sind verfügbar.">
        <ul className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
          {COLORS.map((c) => (
            <li key={c.token}>
              <span className="block h-16 border border-line" style={{ background: c.hex }} />
              <p className="mt-3 text-small font-semibold">{c.name}</p>
              <p className="tabular text-caption text-muted">--color-{c.token} · {c.hex}</p>
              <p className="text-caption text-ink-soft">{c.use}</p>
            </li>
          ))}
        </ul>
        <h3 className="mt-14 text-h4 font-semibold">Flüssigkeiten der Duftfamilien</h3>
        <p className="mt-1 text-small text-ink-soft">Nur in Bildern, Notenschichten und Duftwelten. Nie für Text, Buttons oder Flächen der Oberfläche.</p>
        <ul className="mt-6 flex flex-wrap gap-6">
          {FAMILIES.map((f) => (
            <li key={f.key} className="flex items-center gap-3">
              <span className="size-9 rounded-full border border-line" style={{ background: f.liquid }} />
              <span className="text-small">{f.label}<span className="tabular block text-caption text-muted">{f.liquid}</span></span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="typo" title="Typografie" intro="Bodoni Moda (optische Größen) für Überschriften, Mona Sans mit Breitenachse für Oberfläche und Etiketten. Preise mit proportionalen Versalziffern.">
        <ul className="flex flex-col gap-8">
          {TYPE.map((t) => (
            <li key={t.label} className="grid grid-cols-1 gap-2 md:grid-cols-[14rem_1fr] md:items-baseline">
              <span className="text-caption text-muted">{t.label}</span>
              <span className={t.cls}>{t.sample}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="form" title="Form und Bewegung">
        <dl className="grid grid-cols-1 gap-x-10 gap-y-6 text-small md:grid-cols-2">
          <div><dt className="font-semibold">Radius</dt><dd className="text-ink-soft">2 px für Bedienelemente und Panels, 0 für Produktbilder, rund nur Icon-Buttons und Farbmuster. Rundbogen (oben halbkreisförmig) nur für Schaufenster-Momente: Startseiten-Stillleben und Fotos des Hauses.</dd></div>
          <div><dt className="font-semibold">Schatten</dt><dd className="text-ink-soft">Nur für Ebenen über der Seite (Drawer, Dialog, Popover, Hinweise). Flächen trennen Haarlinien.</dd></div>
          <div><dt className="font-semibold">Kurven</dt><dd className="tabular text-ink-soft">ease-out cubic-bezier(0.23, 1, 0.32, 1), Drawer cubic-bezier(0.32, 0.72, 0, 1)</dd></div>
          <div><dt className="font-semibold">Dauern</dt><dd className="tabular text-ink-soft">Druck 140 ms, schnell 180 ms, Basis 240 ms, Drawer 380 ms, Schließen 220 ms</dd></div>
          <div><dt className="font-semibold">Druckzustand</dt><dd className="text-ink-soft">scale(0.97) beim Drücken; Hover-Effekte nur bei feinem Zeiger.</dd></div>
          <div><dt className="font-semibold">Reduzierte Bewegung</dt><dd className="text-ink-soft">prefers-reduced-motion ersetzt Bewegungen durch Überblendungen oder schaltet sie ab.</dd></div>
        </dl>
      </Section>

      <Section id="aktionen" title="Aktionen" intro="Eine primäre Aktion pro Bereich. Beschriftungen in breiten Versalien, nie umbrechend.">
        <div className="flex flex-col gap-8">
          <div className="flex flex-wrap items-center gap-3">
            <Button>In den Warenkorb</Button>
            <Button variant="secondary">Zur Wunschliste</Button>
            <Button variant="ghost">Abbrechen</Button>
            <Button disabled>Ausverkauft</Button>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button size="lg">Zahlungspflichtig bestellen</Button>
            <Button size="md">Weiter</Button>
            <Button size="sm">Speichern</Button>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <LoadingDemo />
            <ToastDemo />
            <TextLink href="/design-system#aktionen">Textlink</TextLink>
            <span className="flex gap-1">
              <IconButton label="Suche öffnen"><Icon icon={MagnifyingGlass} /></IconButton>
              <IconButton label="Wunschliste"><Icon icon={Heart} /></IconButton>
              <IconButton label="Warenkorb" badge={2}><Icon icon={ShoppingBag} /></IconButton>
            </span>
          </div>
          <div className="bg-ink p-6"><Button variant="inverse">Auf dunklem Grund</Button></div>
        </div>
      </Section>

      <Section id="felder" title="Formulare" intro="Beschriftung immer sichtbar über dem Feld, Fehler direkt darunter und per aria-describedby verknüpft.">
        <div className="grid grid-cols-1 max-w-3xl gap-6 md:grid-cols-2">
          <Field label="E-Mail-Adresse" hint="Für Bestellbestätigung und Versandinfo.">
            {({ id, describedBy, invalid }) => <Input id={id} type="email" placeholder="name@beispiel.de" aria-describedby={describedBy} invalid={invalid} />}
          </Field>
          <Field label="PLZ" error="Bitte eine fünfstellige PLZ angeben.">
            {({ id, describedBy, invalid }) => <Input id={id} defaultValue="301" aria-describedby={describedBy} invalid={invalid} />}
          </Field>
          <Field label="Land">
            {({ id, describedBy }) => (
              <Select id={id} aria-describedby={describedBy} defaultValue="DE">
                <option value="DE">Deutschland</option>
                <option value="AT">Österreich</option>
              </Select>
            )}
          </Field>
          <div className="flex flex-col gap-3 pt-6">
            <Check label="Newsletter erhalten" description="Freiwillig, mit Bestätigung per E-Mail." />
            <Check label="Deaktiviert" disabled />
          </div>
          <div><p className="mb-2 text-caption font-medium">Menge</p><QuantityDemo /></div>
        </div>
      </Section>

      <Section id="anzeige" title="Anzeige">
        <div className="flex flex-col gap-10">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Neu</Badge>
            <Badge tone="accent">Exklusiv</Badge>
            <Badge tone="sale">-15 %</Badge>
            <Badge tone="muted">Nische</Badge>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
            <div><p className="mb-2 text-caption text-muted">Preis</p><Price cents={12900} unit={{ sizeMl: 100 }} /></div>
            <div><p className="mb-2 text-caption text-muted">Ab-Preis</p><Price cents={6900} from /></div>
            <div><p className="mb-2 text-caption text-muted">Reduziert mit § 11 PAngV</p><Price cents={9900} compareAtCents={12900} lowest30dCents={11900} unit={{ sizeMl: 100 }} /></div>
            <div><p className="mb-2 text-caption text-muted">Bewertung</p><Stars value={4.5} label="4,5 von 5 Sternen" /></div>
          </div>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="flex flex-col gap-2"><p className="text-caption text-muted">Skeleton</p><Skeleton className="aspect-[4/5] max-w-56" /><Skeleton className="h-4 w-40" /></div>
            <div className="flex flex-col gap-2"><p className="text-caption text-muted">Bildplatzhalter</p><ImagePlaceholder label="Foto der Parfümerie folgt" className="aspect-[4/5] max-w-56" /></div>
            <div className="flex flex-col gap-3"><p className="text-caption text-muted">Datenplatzhalter</p><Placeholder>Telefonnummer</Placeholder><Placeholder>Öffnungszeiten</Placeholder></div>
          </div>
        </div>
      </Section>

      {sample && (
        <Section id="produkt" title="Produkt" intro="Produktkarte mit echten Katalogdaten (Demo). Duftnoten als Flüssigkeitsschichten, Intensität als Skala.">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-[repeat(2,minmax(0,16rem))_1fr]">
            {catalog.slice(0, 2).map((p) => <ProductCard key={p.id} product={p} />)}
            {detail && (
              <div className="flex flex-col gap-8">
                <NoteLayers product={detail} />
                {detail.intensity != null && <Intensity value={detail.intensity} />}
              </div>
            )}
          </div>
        </Section>
      )}
    </div>
  );
}
