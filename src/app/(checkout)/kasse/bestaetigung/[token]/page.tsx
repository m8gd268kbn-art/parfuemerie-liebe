import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ButtonLink } from "@/components/ui/button";
import { ConfirmationPoller } from "@/features/checkout/confirmation-poller";
import { CreateAccountFromOrder } from "@/features/checkout/create-account";
import { OrderDetails, StatusTimeline } from "@/features/orders/order-details";
import { getCurrentUser } from "@/services/auth/session";
import { getOrderView } from "@/services/orders";

export const metadata: Metadata = { title: "Bestellbestätigung", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function ConfirmationPage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const view = await getOrderView({ publicToken: token });
  if (!view) notFound();
  const { order } = view;
  const user = await getCurrentUser();
  const pending = order.status === "pending_payment";
  const failed = order.status === "cancelled";

  return (
    <div className="container-page pt-12 pb-24">
      <ConfirmationPoller pending={pending} orderNumber={order.number} total={order.totalCents} />
      <header className="mb-12 max-w-2xl">
        <p className="numeric text-small text-ink-soft">Bestellung {order.number}</p>
        <h1 className="mt-3 font-display text-h1">
          {pending ? "Wir warten auf die Bestätigung Ihrer Zahlung." : failed ? "Die Zahlung wurde nicht abgeschlossen." : `Vielen Dank, ${order.billingAddress.firstName}.`}
        </h1>
        <p className="mt-4 text-body-lg text-ink-soft" aria-live="polite">
          {pending
            ? "Das dauert meist nur wenige Sekunden. Diese Seite aktualisiert sich automatisch."
            : failed
              ? "Ihre Bestellung wurde nicht ausgeführt und es wurde nichts abgebucht. Ihr Warenkorb ist noch da."
              : `Ihre Zahlung ist eingegangen. Eine Bestätigung haben wir an ${order.email} gesendet. Als Nächstes packen wir Ihre Bestellung sorgfältig und informieren Sie beim Versand.`}
        </p>
        {!pending && !failed && (
          <div className="mt-8">
            <StatusTimeline status={order.status} />
          </div>
        )}
        {failed && (
          <div className="mt-6">
            <ButtonLink href="/kasse">Erneut zur Kasse</ButtonLink>
          </div>
        )}
      </header>
      <OrderDetails view={view} />
      {!user && !order.userId && !failed && (
        <section aria-labelledby="account-title" className="mt-16 max-w-lg border-t border-line pt-10">
          <h2 id="account-title" className="font-display text-h3">
            Kundenkonto mit diesen Daten anlegen?
          </h2>
          <div className="mt-4">
            <CreateAccountFromOrder token={token} email={order.email} />
          </div>
        </section>
      )}
      <div className="mt-16 flex flex-wrap gap-3">
        <ButtonLink href="/" variant="secondary">
          Weiter einkaufen
        </ButtonLink>
        <ButtonLink href={`/bestellung/${token}`} variant="ghost">
          Bestellstatus
        </ButtonLink>
      </div>
    </div>
  );
}
