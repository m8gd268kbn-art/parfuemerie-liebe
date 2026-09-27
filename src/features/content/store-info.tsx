import { Clock, Envelope, MapPin, Phone } from "@phosphor-icons/react/dist/ssr";
import { Icon } from "@/components/ui/icon";
import { Placeholder } from "@/components/ui/placeholder";
import type { ShopSettings } from "@/lib/settings-schema";

/** Kontaktdaten und Öffnungszeiten der Parfümerie; fehlende Angaben als Platzhalter. */
export function StoreInfo({ settings }: { settings: ShopSettings }) {
  const s = settings.store;
  const hasHours = s.openingHours.some((o) => o.hours);
  return (
    <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
      <dl className="flex flex-col gap-4 text-small">
        <div className="flex gap-3">
          <dt><Icon icon={MapPin} size={18} className="mt-0.5 text-ink-soft" /><span className="sr-only">Adresse</span></dt>
          <dd>{s.street ? <>{s.name}<br />{s.street}<br />{s.postalCode} {s.city}</> : <Placeholder>Adresse der Parfümerie</Placeholder>}</dd>
        </div>
        <div className="flex gap-3">
          <dt><Icon icon={Phone} size={18} className="mt-0.5 text-ink-soft" /><span className="sr-only">Telefon</span></dt>
          <dd>{s.phone ? <a href={`tel:${s.phone.replace(/[^+\d]/g, "")}`} className="link-underline">{s.phone}</a> : <Placeholder>Telefonnummer</Placeholder>}</dd>
        </div>
        <div className="flex gap-3">
          <dt><Icon icon={Envelope} size={18} className="mt-0.5 text-ink-soft" /><span className="sr-only">E-Mail</span></dt>
          <dd>{s.email ? <a href={`mailto:${s.email}`} className="link-underline">{s.email}</a> : <Placeholder>E-Mail-Adresse</Placeholder>}</dd>
        </div>
      </dl>
      <div className="flex gap-3 text-small">
        <Icon icon={Clock} size={18} className="mt-0.5 shrink-0 text-ink-soft" />
        {hasHours ? (
          <dl className="grid grid-cols-[6.5rem_1fr] gap-y-1">
            {s.openingHours.map((o) => (
              <div key={o.day} className="contents">
                <dt className="text-ink-soft">{o.day}</dt>
                <dd>{o.hours || "geschlossen"}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <Placeholder>Öffnungszeiten</Placeholder>
        )}
      </div>
    </div>
  );
}
