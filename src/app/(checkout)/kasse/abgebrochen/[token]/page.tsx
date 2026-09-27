import type { Metadata } from "next";
import { Button, ButtonLink } from "@/components/ui/button";
import { cancelPendingOrderAction } from "@/features/checkout/actions";

export const metadata: Metadata = { title: "Zahlung abgebrochen", robots: { index: false, follow: false } };

export default async function CancelledPage({ params, searchParams }: { params: Promise<{ token: string }>; searchParams: Promise<{ fehlgeschlagen?: string }> }) {
  const { token } = await params;
  const failed = (await searchParams).fehlgeschlagen === "1";
  return (
    <div className="container-page flex flex-col items-start gap-6 py-20">
      <h1 className="font-display text-h1">{failed ? "Die Zahlung ist fehlgeschlagen." : "Die Zahlung wurde abgebrochen."}</h1>
      <p className="max-w-lg text-body-lg text-ink-soft">
        Es wurde nichts abgebucht und Ihr Warenkorb ist unverändert. Sie können es erneut versuchen oder eine andere Zahlungsart wählen.
      </p>
      <div className="flex flex-wrap gap-3">
        <form action={cancelPendingOrderAction.bind(null, token)}>
          <Button type="submit">Zurück zur Kasse</Button>
        </form>
        <ButtonLink href="/kontakt" variant="ghost">
          Hilfe erhalten
        </ButtonLink>
      </div>
    </div>
  );
}
