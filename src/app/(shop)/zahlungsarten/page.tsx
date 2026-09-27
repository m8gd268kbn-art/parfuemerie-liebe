import type { Metadata } from "next";
import { ProsePage } from "@/features/content/prose";
import { availablePaymentMethods } from "@/services/payments";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Zahlungsarten", alternates: { canonical: "/zahlungsarten" } };

export default async function PaymentsPage() {
  const methods = availablePaymentMethods(await getSettings());
  return (
    <ProsePage title="Zahlungsarten" path="/zahlungsarten" intro="Sie bezahlen über die gesicherte Zahlungsseite unseres Zahlungsdienstleisters. Kartendaten werden nicht bei uns gespeichert.">
      <h2>Verfügbare Zahlungsarten</h2>
      {methods.length ? (
        <ul>{methods.map((m) => <li key={m.id}>{m.label}</li>)}</ul>
      ) : (
        <p>Derzeit sind keine Zahlungsarten freigeschaltet.</p>
      )}
      <h2>Wann wird abgebucht?</h2>
      <p>Mit Abschluss der Bestellung leiten wir Sie zur Zahlung weiter. Ihre Bestellung gilt erst als bezahlt, wenn der Zahlungsdienstleister die Zahlung bestätigt hat.</p>
      <h2>Sicherheit</h2>
      <p>Die Übertragung erfolgt verschlüsselt. Sensible Zahlungsdaten verarbeitet ausschließlich der Zahlungsdienstleister.</p>
    </ProsePage>
  );
}
