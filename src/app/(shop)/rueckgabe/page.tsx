import type { Metadata } from "next";
import Link from "next/link";
import { Placeholder } from "@/components/ui/placeholder";
import { ProsePage } from "@/features/content/prose";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Rückgabe", alternates: { canonical: "/rueckgabe" } };

export default async function ReturnsPage() {
  const s = await getSettings();
  return (
    <ProsePage title="Rückgabe" path="/rueckgabe" intro={s.returns.summary}>
      <h2>Widerrufsfrist</h2>
      <p>Sie haben ein gesetzliches Widerrufsrecht von {s.returns.withdrawalDays} Tagen. Die Einzelheiten stehen in der <Link href="/widerruf">Widerrufsbelehrung</Link>.</p>
      <h2>Hygieneartikel</h2>
      <p>Parfum ist ein Hygieneartikel. Bei versiegelten Waren, deren Versiegelung nach der Lieferung entfernt wurde, kann das Widerrufsrecht ausgeschlossen sein. Maßgeblich ist die Widerrufsbelehrung.</p>
      <h2>So senden Sie zurück</h2>
      <ol className="list-decimal pl-5">
        <li>Teilen Sie uns Ihren Widerruf mit Bestellnummer mit, per E-Mail oder über die <Link href="/kontakt">Kontaktseite</Link>.</li>
        <li>Verpacken Sie die Ware sicher, Glasflakons am besten in der Originalverpackung.</li>
        <li>Senden Sie das Paket an unsere Rücksendeadresse: {s.store.street ? `${s.store.name}, ${s.store.street}, ${s.store.postalCode} ${s.store.city}` : <Placeholder>Rücksendeadresse</Placeholder>}</li>
      </ol>
      <h2>Erstattung</h2>
      <p>Die Erstattung erfolgt über die ursprüngliche Zahlungsart, sobald die Rücksendung bei uns eingegangen ist.</p>
    </ProsePage>
  );
}
