import type { Metadata } from "next";
import { LegalPlaceholder, PlainText, ProsePage } from "@/features/content/prose";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Widerrufsbelehrung", alternates: { canonical: "/widerruf" } };

export default async function Page() {
  const text = (await getSettings()).legal.widerruf;
  return (
    <ProsePage title="Widerrufsbelehrung" path="/widerruf">
      {text ? <PlainText text={text} /> : <LegalPlaceholder title="Widerrufsbelehrung" sections={['Widerrufsrecht', 'Folgen des Widerrufs', 'Ausschluss des Widerrufsrechts (z. B. versiegelte Hygieneartikel)', 'Muster-Widerrufsformular']} />}
    </ProsePage>
  );
}
