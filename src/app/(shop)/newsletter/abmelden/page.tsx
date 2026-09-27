import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { unsubscribeNewsletter } from "@/services/newsletter";

export const metadata: Metadata = { title: "Newsletter abmelden", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function NewsletterUnsubscribePage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const ok = await unsubscribeNewsletter((await searchParams).token ?? "");
  return (
    <div className="container-page flex flex-col items-start gap-6 py-20">
      <h1 className="font-display text-h1">{ok ? "Sie sind abgemeldet." : "Abmeldung nicht möglich."}</h1>
      <p className="max-w-lg text-body-lg text-ink-soft">
        {ok ? "Sie erhalten keine Newsletter mehr." : "Der Link ist ungültig. Schreiben Sie uns gern über die Kontaktseite, wir tragen Sie manuell aus."}
      </p>
      <ButtonLink href="/">Zur Startseite</ButtonLink>
    </div>
  );
}
