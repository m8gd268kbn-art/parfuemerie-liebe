import type { Metadata } from "next";
import { LegalPlaceholder, PlainText, ProsePage } from "@/features/content/prose";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Datenschutzerklärung", alternates: { canonical: "/datenschutz" } };

export default async function Page() {
  const text = (await getSettings()).legal.datenschutz;
  return (
    <ProsePage title="Datenschutzerklärung" path="/datenschutz">
      {text ? <PlainText text={text} /> : <LegalPlaceholder title="Datenschutzerklärung" sections={['Verantwortliche Stelle', 'Erhobene Daten und Zwecke', 'Rechtsgrundlagen', 'Cookies und Einwilligungen', 'Zahlungsdienstleister', 'Versanddienstleister', 'Newsletter mit Double-Opt-In', 'Speicherdauer', 'Ihre Rechte', 'Beschwerderecht bei einer Aufsichtsbehörde']} />}
    </ProsePage>
  );
}
