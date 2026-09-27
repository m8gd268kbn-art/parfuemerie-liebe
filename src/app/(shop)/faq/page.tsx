import type { Metadata } from "next";
import Link from "next/link";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { ProsePage } from "@/features/content/prose";
import { defaultMethod } from "@/lib/commerce/shipping";
import { formatPrice } from "@/lib/format";
import { JsonLd } from "@/lib/seo";
import { availablePaymentMethods } from "@/services/payments";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Häufige Fragen", alternates: { canonical: "/faq" } };

export default async function FaqPage() {
  const s = await getSettings();
  const m = defaultMethod(s);
  const pay = availablePaymentMethods(s).map((p) => p.label);
  const faqs: { q: string; a: React.ReactNode; text: string }[] = [
    { q: "Kann ich ohne Kundenkonto bestellen?", a: "Ja. Sie bestellen als Gast und können nach der Bestellung auf Wunsch ein Konto anlegen.", text: "Ja, Gastbestellung ist möglich." },
    {
      q: "Wie hoch sind die Versandkosten?",
      a: m ? <>Innerhalb Deutschlands {formatPrice(m.priceCents)}{m.freeFromCents != null && <>, ab {formatPrice(m.freeFromCents)} Warenwert kostenlos</>}. Details unter <Link href="/versand">Versand</Link>.</> : "Siehe Versandinformationen.",
      text: m ? `Innerhalb Deutschlands ${formatPrice(m.priceCents)}.` : "Siehe Versandinformationen.",
    },
    { q: "Wann kommt meine Bestellung?", a: m?.deliveryTime ? `In der Regel in ${m.deliveryTime}. Mit dem Versand erhalten Sie eine Sendungsnummer.` : "Mit dem Versand erhalten Sie eine Sendungsnummer.", text: m?.deliveryTime ?? "" },
    { q: "Welche Zahlungsarten gibt es?", a: pay.length ? `${pay.join(", ")}.` : "Die Zahlungsarten werden derzeit eingerichtet.", text: pay.join(", ") },
    { q: "Bekomme ich Duftproben?", a: s.samples.enabled ? `Ja, bis zu ${s.samples.maxCount} kostenlose Proben pro Bestellung, auswählbar im Warenkorb.` : "Derzeit nicht.", text: "" },
    { q: "Kann ich Düfte vorher testen?", a: <>Gern in unserer <Link href="/parfuemerie">Parfümerie in {s.store.city}</Link>. Dort beraten wir Sie auch persönlich.</>, text: "In unserer Parfümerie." },
    { q: "Kann ich ein Parfum zurückgeben?", a: <>{s.returns.summary} Mehr unter <Link href="/rueckgabe">Rückgabe</Link>.</>, text: s.returns.summary },
  ];
  return (
    <ProsePage title="Häufige Fragen" path="/faq" intro={<>Ihre Frage ist nicht dabei? <Link href="/kontakt" className="text-ink link-underline">Schreiben Sie uns</Link>.</>}>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs.filter((f) => f.text).map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.text } })) }} />
      <div className="not-prose">
        <Accordion>
          {faqs.map((f, i) => (
            <AccordionItem key={i} value={`q${i}`} title={f.q}>
              <p className="max-w-[65ch]">{f.a}</p>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </ProsePage>
  );
}
