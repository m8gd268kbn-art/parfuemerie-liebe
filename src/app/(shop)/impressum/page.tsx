import type { Metadata } from "next";
import { LegalPlaceholder, PlainText, ProsePage } from "@/features/content/prose";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Impressum", alternates: { canonical: "/impressum" } };

export default async function Page() {
  const text = (await getSettings()).legal.impressum;
  return (
    <ProsePage title="Impressum" path="/impressum">
      {text ? <PlainText text={text} /> : <LegalPlaceholder title="Impressum" sections={['Angaben gemäß § 5 DDG', 'Vertreten durch', 'Kontakt', 'Umsatzsteuer-ID', 'Verbraucherstreitbeilegung']} />}
    </ProsePage>
  );
}
