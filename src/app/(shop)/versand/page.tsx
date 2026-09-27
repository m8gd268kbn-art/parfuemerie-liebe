import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/features/content/prose";
import { COUNTRY_NAMES } from "@/lib/commerce/shipping";
import { formatPrice } from "@/lib/format";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Versand", alternates: { canonical: "/versand" } };

export default async function ShippingPage() {
  const s = await getSettings();
  const zones = s.shipping.zones.filter((z) => z.active);
  return (
    <ProsePage title="Versand" path="/versand" intro="Alle Preise enthalten die gesetzliche Mehrwertsteuer. Versandkosten richten sich nach Lieferland und Versandart.">
      {zones.map((z) => (
        <section key={z.id}>
          <h2>{z.name}</h2>
          <p className="text-small">Lieferländer: {z.countries.map((c) => COUNTRY_NAMES[c] ?? c).join(", ")}</p>
          <ul>
            {z.methods.filter((m) => m.active).map((m) => (
              <li key={m.id}>
                <strong className="text-ink">{m.name}{m.carrier ? ` mit ${m.carrier}` : ""}</strong>: {formatPrice(m.priceCents)}
                {m.freeFromCents != null && `, versandkostenfrei ab ${formatPrice(m.freeFromCents)} Warenwert`}
                {m.deliveryTime && `. Lieferzeit ${m.deliveryTime}`}.
              </li>
            ))}
          </ul>
        </section>
      ))}
      {s.pickup.enabled && (
        <section>
          <h2>Abholung</h2>
          <p>{s.pickup.label}. {s.pickup.readyTime && `Abholbereit ${s.pickup.readyTime}. `}{s.pickup.instructions}</p>
        </section>
      )}
      <h2>Duftproben</h2>
      <p>{s.samples.enabled ? `Zu jeder Bestellung können Sie bis zu ${s.samples.maxCount} kostenlose Duftproben wählen${s.samples.minSubtotalCents ? ` (ab ${formatPrice(s.samples.minSubtotalCents)} Warenwert)` : ""}, solange der Vorrat reicht.` : "Derzeit bieten wir keine Duftproben zur Bestellung an."}</p>
      <h2>Sendungsverfolgung</h2>
      <p>Sobald Ihre Bestellung versendet ist, erhalten Sie eine E-Mail mit Sendungsnummer. Den Status sehen Sie auch unter <Link href="/bestellung-verfolgen">Bestellung verfolgen</Link>.</p>
    </ProsePage>
  );
}
