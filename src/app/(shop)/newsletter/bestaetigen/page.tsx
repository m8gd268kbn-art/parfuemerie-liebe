import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { confirmNewsletter } from "@/services/newsletter";

export const metadata: Metadata = { title: "Newsletter bestätigen", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewsletterConfirmPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const ok = await confirmNewsletter((await searchParams).token ?? "");
  return (
    <div className="container-page flex flex-col items-start gap-6 py-20">
      <h1 className="font-display text-h1">{ok ? "Ihre Anmeldung ist bestätigt." : "Dieser Link ist nicht mehr gültig."}</h1>
      <p className="max-w-lg text-body-lg text-ink-soft">
        {ok ? "Schön, dass Sie dabei sind. Wir melden uns mit Neuheiten und Nachrichten aus der Parfümerie." : "Die Anmeldung wurde bereits bestätigt oder der Link ist abgelaufen."}
      </p>
      <ButtonLink href="/">Zur Startseite</ButtonLink>
    </div>
  );
}
