import Link from "next/link";
import { PAYMENT_METHODS } from "@/config/catalog";
import { env } from "@/config/env";
import { ACheck, AdminForm, AField, AFile } from "@/features/admin/kit";
import { saveSettingsAction, type SettingsSection } from "@/features/admin/settings-actions";
import { AdminPage, Panel } from "@/features/admin/ui";
import { centsToEuroInput } from "@/lib/format";
import { cn } from "@/lib/utils";
import { getSettingsFresh } from "@/services/settings";

export const metadata = { title: "Einstellungen" };

const TABS: { key: SettingsSection; label: string }[] = [
  { key: "shop", label: "Parfümerie und Kontakt" },
  { key: "servicebar", label: "Service-Leiste" },
  { key: "versand", label: "Versand und Rückgabe" },
  { key: "proben", label: "Duftproben" },
  { key: "zahlung", label: "Zahlarten" },
  { key: "abholung", label: "Click & Collect" },
  { key: "startseite", label: "Startseite" },
  { key: "recht", label: "Rechtstexte" },
  { key: "social", label: "Social Media" },
];

export default async function AdminSettings({ searchParams }: { searchParams: Promise<{ tab?: string }> }) {
  const sp = await searchParams;
  const tab = TABS.find((t) => t.key === sp.tab)?.key ?? "shop";
  const s = await getSettingsFresh();
  const action = saveSettingsAction.bind(null, tab);
  const provider = env().PAYMENT_PROVIDER;

  return (
    <AdminPage title="Einstellungen" description="Leere Felder erscheinen im Shop als gekennzeichnete Platzhalter oder werden ausgeblendet. Bitte nur geprüfte Angaben eintragen.">
      <nav aria-label="Bereiche" className="flex flex-wrap gap-1 border-b border-line pb-4">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/einstellungen?tab=${t.key}`} aria-current={tab === t.key ? "page" : undefined} className={cn("rounded-sm px-3 py-1.5 text-caption", tab === t.key ? "bg-ink text-paper" : "text-ink-soft hover:bg-porcelain")}>
            {t.label}
          </Link>
        ))}
      </nav>

      <Panel>
        {tab === "shop" && (
          <AdminForm action={action}>
            <p className="text-small text-ink-soft">Name im Shop: <strong className="font-semibold">Parfümerie Liebe</strong> (fest).</p>
            <div className="grid gap-5 md:grid-cols-2">
              <AField name="legalName" label="Rechtlicher Name (Impressum)" defaultValue={s.store.legalName} hint="z. B. Inhaberin/Inhaber oder Firma laut Gewerbeanmeldung" />
              <AField name="vatId" label="USt-IdNr." defaultValue={s.store.vatId} />
              <AField name="street" label="Straße und Hausnummer" defaultValue={s.store.street} />
              <div className="grid grid-cols-[8rem_1fr] gap-3">
                <AField name="postalCode" label="PLZ" defaultValue={s.store.postalCode} />
                <AField name="city" label="Ort" required defaultValue={s.store.city} />
              </div>
              <AField name="phone" label="Telefon" defaultValue={s.store.phone} type="tel" />
              <AField name="email" label="E-Mail (öffentlich)" defaultValue={s.store.email} type="email" />
              <AField name="supportEmail" label="E-Mail für Kontaktanfragen" defaultValue={s.store.supportEmail} type="email" hint="Empfängt Nachrichten aus dem Kontaktformular." />
              <AField name="mapUrl" label="Link zur Karte" defaultValue={s.store.mapUrl} hint="Wird als Link geöffnet, keine eingebettete Karte (Datenschutz)." />
            </div>
            <fieldset className="border-t border-line pt-6">
              <legend className="mb-4 text-small font-semibold">Öffnungszeiten</legend>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {s.store.openingHours.map((h, i) => <AField key={h.day} name={`hours.${i}`} label={h.day} defaultValue={h.hours} placeholder="z. B. 10:00 bis 18:00 oder geschlossen" />)}
              </div>
            </fieldset>
            <fieldset className="grid gap-5 border-t border-line pt-6 md:grid-cols-2">
              <legend className="mb-4 text-small font-semibold">Filialseite</legend>
              <AField name="about" label="Über die Parfümerie" textarea rows={5} defaultValue={s.store.about} className="md:col-span-2" />
              <AField name="history" label="Geschichte" textarea rows={5} defaultValue={s.store.history} hint="Nur belegte Angaben (Gründungsjahr, Inhaberin/Inhaber …)." />
              <AField name="services" label="Leistungen in der Parfümerie" textarea rows={5} defaultValue={s.store.services.join("\n")} hint="Eine Leistung pro Zeile." />
              <AField name="directions" label="Anfahrt" textarea rows={3} defaultValue={s.store.directions} />
              <div className="flex flex-col gap-5">
                <AFile name="image" label="Foto der Parfümerie" current={s.store.imageUrl || null} removeName="removeImage" />
                <AField name="imageAlt" label="Alternativtext zum Foto" defaultValue={s.store.imageAlt} />
              </div>
            </fieldset>
          </AdminForm>
        )}

        {tab === "servicebar" && (
          <AdminForm action={action}>
            <ACheck name="enabled" label="Service-Leiste über dem Header anzeigen" defaultChecked={s.serviceBar.enabled} />
            <AField name="items" label="Hinweise" textarea rows={5} defaultValue={s.serviceBar.items.join("\n")} hint="Einer pro Zeile, höchstens 5. Platzhalter: {freeShippingFrom}, {shippingPrice}, {samplesCount}, {city}. Nur zutreffende Aussagen." />
          </AdminForm>
        )}

        {tab === "versand" && (
          <AdminForm action={action}>
            <input type="hidden" name="zoneCount" value={s.shipping.zones.length} />
            <AField name="taxRatePercent" label="Mehrwertsteuersatz in %" type="number" required defaultValue={s.shipping.taxRatePercent} className="max-w-48" />
            {[...s.shipping.zones, null].map((z, zi) => {
              const p = `zone.${zi}.`;
              return (
                <fieldset key={z?.id ?? "new"} className="flex flex-col gap-4 border-t border-line pt-6">
                  <legend className="mb-4 text-small font-semibold">{z ? `Versandzone: ${z.name}` : "Neue Versandzone"}</legend>
                  <input type="hidden" name={`${p}id`} value={z?.id ?? ""} />
                  <input type="hidden" name={`${p}methodCount`} value={z?.methods.length ?? 0} />
                  <div className="grid gap-4 md:grid-cols-3">
                    <AField name={`${p}name`} label="Name der Zone" defaultValue={z?.name} placeholder={z ? undefined : "z. B. Österreich"} />
                    <AField name={`${p}countries`} label="Länder (ISO-Codes)" defaultValue={z?.countries.join(", ")} placeholder="DE" />
                    <div className="flex items-end gap-5 pb-2.5">
                      <ACheck name={`${p}active`} label="Aktiv" defaultChecked={z?.active ?? true} />
                      {z && <ACheck name={`${p}remove`} label="Zone entfernen" />}
                    </div>
                  </div>
                  {[...(z?.methods ?? []), null].map((m, mi) => {
                    const mp = `${p}method.${mi}.`;
                    return (
                      <div key={m?.id ?? "new"} className="grid gap-3 rounded-sm bg-porcelain/60 p-4 sm:grid-cols-3 lg:grid-cols-6">
                        <input type="hidden" name={`${mp}id`} value={m?.id ?? ""} />
                        <AField name={`${mp}name`} label={m ? "Versandart" : "Neue Versandart"} defaultValue={m?.name} className="lg:col-span-2" />
                        <AField name={`${mp}carrier`} label="Versanddienst" defaultValue={m?.carrier} />
                        <AField name={`${mp}price`} label="Preis in €" defaultValue={m ? centsToEuroInput(m.priceCents) : ""} inputMode="decimal" />
                        <AField name={`${mp}freeFrom`} label="Frei ab €" defaultValue={centsToEuroInput(m?.freeFromCents)} inputMode="decimal" />
                        <AField name={`${mp}deliveryTime`} label="Lieferzeit" defaultValue={m?.deliveryTime} placeholder="2-4 Werktage" />
                        <div className="flex gap-5 sm:col-span-3 lg:col-span-6">
                          <ACheck name={`${mp}active`} label="Aktiv" defaultChecked={m?.active ?? true} />
                          {m && <ACheck name={`${mp}remove`} label="Versandart entfernen" />}
                        </div>
                      </div>
                    );
                  })}
                </fieldset>
              );
            })}
            <fieldset className="grid gap-4 border-t border-line pt-6 md:grid-cols-[12rem_1fr]">
              <legend className="mb-4 text-small font-semibold">Rückgabe</legend>
              <AField name="withdrawalDays" label="Widerrufsfrist in Tagen" type="number" required defaultValue={s.returns.withdrawalDays} />
              <AField name="returnsSummary" label="Kurzinfo zur Rückgabe" defaultValue={s.returns.summary} />
            </fieldset>
          </AdminForm>
        )}

        {tab === "proben" && (
          <AdminForm action={action}>
            <ACheck name="enabled" label="Kostenlose Duftproben im Warenkorb anbieten" defaultChecked={s.samples.enabled} />
            <div className="grid max-w-xl gap-5 sm:grid-cols-2">
              <AField name="maxCount" label="Proben pro Bestellung" type="number" required defaultValue={s.samples.maxCount} />
              <AField name="minSubtotal" label="Ab Warenwert in €" defaultValue={centsToEuroInput(s.samples.minSubtotalCents)} inputMode="decimal" hint="0 = ohne Mindestwert" />
            </div>
          </AdminForm>
        )}

        {tab === "zahlung" && (
          <AdminForm action={action}>
            <p className="max-w-2xl text-small text-ink-soft">
              Aktiver Zahlungsanbieter: <strong className="font-semibold">{provider === "stripe" ? "Stripe" : "Testzahlung (Entwicklung)"}</strong>. Aktivieren Sie eine Zahlart erst, wenn sie im Stripe-Dashboard freigeschaltet ist. Der Shop zeigt nur aktivierte Zahlarten an.
            </p>
            <div className="flex flex-col gap-2.5">
              {PAYMENT_METHODS.map((m) => (
                <ACheck key={m.id} name={`pm.${m.id}`} label={m.label} defaultChecked={s.payments.methods.some((x) => x.id === m.id && x.enabled)} />
              ))}
            </div>
          </AdminForm>
        )}

        {tab === "abholung" && (
          <AdminForm action={action}>
            <ACheck name="enabled" label="Abholung in der Parfümerie anbieten (Click & Collect)" defaultChecked={s.pickup.enabled} />
            <div className="grid gap-5 md:grid-cols-2">
              <AField name="label" label="Bezeichnung im Checkout" required defaultValue={s.pickup.label} />
              <AField name="readyTime" label="Abholbereit" defaultValue={s.pickup.readyTime} placeholder="z. B. am nächsten Werktag" />
              <AField name="instructions" label="Hinweise zur Abholung" textarea rows={3} defaultValue={s.pickup.instructions} className="md:col-span-2" hint="z. B. Ausweis und Bestellnummer mitbringen." />
            </div>
          </AdminForm>
        )}

        {tab === "startseite" && (
          <AdminForm action={action}>
            <div className="grid gap-5 md:grid-cols-2">
              <AField name="heroHeadline" label="Überschrift" required defaultValue={s.home.heroHeadline} />
              <AField name="heroSubline" label="Unterzeile" defaultValue={s.home.heroSubline} />
              <AField name="heroPrimaryLabel" label="Hauptknopf: Text" required defaultValue={s.home.heroPrimaryLabel} />
              <AField name="heroPrimaryHref" label="Hauptknopf: Pfad" required defaultValue={s.home.heroPrimaryHref} hint="Interner Pfad, z. B. /parfum" />
              <AField name="heroSecondaryLabel" label="Zweiter Link: Text" defaultValue={s.home.heroSecondaryLabel} />
              <AField name="heroSecondaryHref" label="Zweiter Link: Pfad" defaultValue={s.home.heroSecondaryHref} />
              <AFile name="heroImage" label="Titelbild" current={s.home.heroImageUrl} hint="Querformat, mindestens 2400 px breit." />
              <AField name="heroImageAlt" label="Alternativtext zum Titelbild" required defaultValue={s.home.heroImageAlt} />
            </div>
          </AdminForm>
        )}

        {tab === "recht" && (
          <AdminForm action={action}>
            <p className="max-w-2xl rounded-sm border border-warning/30 bg-warning-soft px-4 py-3 text-small text-warning">
              Rechtstexte bitte nur in anwaltlich oder durch einen Rechtstexte-Dienst geprüfter Fassung einfügen. Solange ein Feld leer ist, zeigt der Shop einen deutlich gekennzeichneten Platzhalter.
            </p>
            <AField name="impressum" label="Impressum" textarea rows={10} defaultValue={s.legal.impressum} />
            <AField name="datenschutz" label="Datenschutzerklärung" textarea rows={14} defaultValue={s.legal.datenschutz} />
            <AField name="agb" label="AGB" textarea rows={14} defaultValue={s.legal.agb} />
            <AField name="widerruf" label="Widerrufsbelehrung und Muster-Widerrufsformular" textarea rows={14} defaultValue={s.legal.widerruf} />
          </AdminForm>
        )}

        {tab === "social" && (
          <AdminForm action={action}>
            <div className="grid gap-5 md:grid-cols-2">
              <AField name="instagram" label="Instagram" defaultValue={s.social.instagram} placeholder="https://www.instagram.com/…" />
              <AField name="facebook" label="Facebook" defaultValue={s.social.facebook} />
              <AField name="tiktok" label="TikTok" defaultValue={s.social.tiktok} />
              <AField name="pinterest" label="Pinterest" defaultValue={s.social.pinterest} />
            </div>
          </AdminForm>
        )}
      </Panel>
    </AdminPage>
  );
}
