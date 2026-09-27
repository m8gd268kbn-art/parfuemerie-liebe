import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { OrderList } from "@/features/account/order-list";
import { StatusTimeline } from "@/features/orders/order-details";
import { VerifyNotice } from "@/features/account/verify-notice";
import { requireUser } from "@/services/auth/session";
import { customerOrders } from "@/services/orders/customer";

export default async function AccountOverview() {
  const user = await requireUser("/konto");
  const orders = await customerOrders(user.id, 5);
  const current = orders.find(({ order }) => ["paid", "processing", "packed", "shipped"].includes(order.status));
  return (
    <div className="flex flex-col gap-12">
      {!user.emailVerified && <VerifyNotice />}
      {current && (
        <section aria-labelledby="current-title">
          <h2 id="current-title" className="font-display text-h3">Aktuelle Bestellung</h2>
          <div className="mt-5 rounded-sm border border-line bg-white p-6">
            <p className="numeric text-small">
              <Link href={`/konto/bestellungen/${current.order.number}`} className="font-medium link-underline">{current.order.number}</Link>
            </p>
            <div className="mt-5"><StatusTimeline status={current.order.status} /></div>
          </div>
        </section>
      )}
      <section aria-labelledby="orders-title">
        <div className="flex items-baseline justify-between gap-4">
          <h2 id="orders-title" className="font-display text-h3">Letzte Bestellungen</h2>
          {orders.length > 0 && <Link href="/konto/bestellungen" className="text-small link-underline">Alle Bestellungen</Link>}
        </div>
        <div className="mt-5">
          {orders.length ? (
            <OrderList orders={orders} />
          ) : (
            <div className="flex flex-col items-start gap-4 rounded-sm border border-line p-6">
              <p className="text-body text-ink-soft">Sie haben noch nichts bestellt. Ihre Bestellungen erscheinen hier mit Status und Sendungsverfolgung.</p>
              <ButtonLink href="/neuheiten" variant="secondary">Neuheiten entdecken</ButtonLink>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
