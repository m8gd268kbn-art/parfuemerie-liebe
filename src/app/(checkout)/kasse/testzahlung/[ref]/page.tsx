import { eq } from "drizzle-orm";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { env } from "@/config/env";
import { simulateTestPaymentAction } from "@/features/checkout/actions";
import { formatPrice } from "@/lib/format";
import { db } from "@/services/db";
import { orders, payments } from "@/services/db/schema";
import { paymentMethodLabel } from "@/services/payments";

export const metadata: Metadata = { title: "Testzahlung", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Simulierte Zahlungsseite des Test-Anbieters (ersetzt in Entwicklung die Stripe-Seite). */
export default async function TestPaymentPage({ params }: { params: Promise<{ ref: string }> }) {
  if (env().PAYMENT_PROVIDER !== "test") notFound();
  const { ref } = await params;
  const [row] = await db
    .select({ amount: payments.amountCents, method: payments.method, status: payments.status, number: orders.number, orderStatus: orders.status })
    .from(payments)
    .innerJoin(orders, eq(orders.id, payments.orderId))
    .where(eq(payments.providerRef, ref))
    .limit(1);
  if (!row) notFound();

  return (
    <div className="container-page flex justify-center py-16">
      <div className="flex w-full max-w-md flex-col gap-6 rounded-sm border border-line bg-white p-8">
        <Badge tone="muted" className="self-start">Testzahlung</Badge>
        <div>
          <h1 className="font-display text-h2">Zahlung simulieren</h1>
          <p className="mt-2 text-small text-ink-soft">
            Diese Seite ersetzt in der Entwicklung die Zahlungsseite des Anbieters. Die Bestätigung erfolgt wie in Produktion ausschließlich über einen signierten Webhook.
          </p>
        </div>
        <dl className="numeric grid grid-cols-2 gap-y-2 text-small">
          <dt className="text-muted">Bestellung</dt>
          <dd>{row.number}</dd>
          <dt className="text-muted">Zahlungsart</dt>
          <dd>{paymentMethodLabel(row.method ?? "card")}</dd>
          <dt className="text-muted">Betrag</dt>
          <dd className="font-semibold">{formatPrice(row.amount)}</dd>
        </dl>
        {row.status === "pending" && row.orderStatus === "pending_payment" ? (
          <div className="flex flex-col gap-2">
            <form action={simulateTestPaymentAction.bind(null, ref, "succeeded")}>
              <Button type="submit" size="lg" className="w-full">
                Zahlung erfolgreich
              </Button>
            </form>
            <form action={simulateTestPaymentAction.bind(null, ref, "failed")}>
              <Button type="submit" variant="secondary" className="w-full">
                Zahlung fehlschlagen lassen
              </Button>
            </form>
          </div>
        ) : (
          <p className="text-small text-ink-soft">Für diese Bestellung ist keine Zahlung mehr offen.</p>
        )}
      </div>
    </div>
  );
}
