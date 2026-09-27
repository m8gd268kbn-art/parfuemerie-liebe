import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { verifyEmail } from "@/services/auth/service";

export const metadata: Metadata = { title: "E-Mail bestätigen", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function VerifyEmailPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const ok = await verifyEmail((await searchParams).token ?? "");
  return (
    <div className="container-page flex flex-col items-start gap-6 py-20">
      <h1 className="font-display text-h1">{ok ? "Ihre E-Mail-Adresse ist bestätigt." : "Dieser Link ist nicht mehr gültig."}</h1>
      <p className="max-w-lg text-body-lg text-ink-soft">
        {ok ? "Danke. Ihr Kundenkonto ist vollständig eingerichtet." : "Der Bestätigungslink ist abgelaufen oder wurde bereits verwendet. In Ihrem Kundenkonto können Sie einen neuen anfordern."}
      </p>
      <ButtonLink href="/konto">Zum Kundenkonto</ButtonLink>
    </div>
  );
}
