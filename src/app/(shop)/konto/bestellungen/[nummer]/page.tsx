import Link from "next/link";
import { notFound } from "next/navigation";
import { OrderDetails, StatusTimeline } from "@/features/orders/order-details";
import { ORDER_STATUS } from "@/lib/commerce/order-status";
import { requireUser } from "@/services/auth/session";
import { getOrderView } from "@/services/orders";
import { customerOrderByNumber } from "@/services/orders/customer";

export default async function OrderDetailPage({ params }: { params: Promise<{ nummer: string }> }) {
  const { nummer } = await params;
  const user = await requireUser(`/konto/bestellungen/${nummer}`);
  const id = await customerOrderByNumber(user.id, nummer);
  if (!id) notFound();
  const view = (await getOrderView({ id }))!;
  return (
    <div className="flex flex-col gap-10">
      <div>
        <Link href="/konto/bestellungen" className="text-small text-ink-soft link-underline">Alle Bestellungen</Link>
        <h2 className="mt-4 font-display text-h2">Bestellung {view.order.number}</h2>
        <p className="mt-2 text-small text-ink-soft">{ORDER_STATUS[view.order.status].customer}</p>
        <div className="mt-6 max-w-xl"><StatusTimeline status={view.order.status} /></div>
      </div>
      <OrderDetails view={view} />
      <p className="text-caption text-muted">Eine Rechnung erhalten Sie mit der Lieferung. Fragen zur Bestellung? Schreiben Sie uns über die Kontaktseite.</p>
    </div>
  );
}
