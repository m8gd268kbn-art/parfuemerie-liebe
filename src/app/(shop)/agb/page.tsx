import type { Metadata } from "next";
import { LegalPlaceholder, PlainText, ProsePage } from "@/features/content/prose";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Allgemeine Geschäftsbedingungen", alternates: { canonical: "/agb" } };

export default async function Page() {
  const text = (await getSettings()).legal.agb;
  return (
    <ProsePage title="Allgemeine Geschäftsbedingungen" path="/agb">
      {text ? <PlainText text={text} /> : <LegalPlaceholder title="Allgemeine Geschäftsbedingungen" sections={['Geltungsbereich', 'Vertragspartner und Vertragsschluss', 'Preise und Versandkosten', 'Zahlung', 'Lieferung und Abholung', 'Eigentumsvorbehalt', 'Gewährleistung', 'Streitbeilegung']} />}
    </ProsePage>
  );
}
