import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { OrderDetails, StatusTimeline } from "@/features/orders/order-details";
import { ORDER_STATUS } from "@/lib/commerce/order-status";
import { getOrderView } from "@/services/orders";

export const metadata: Metadata = { title: "Bestellstatus", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function OrderStatusPage({ params }: { params: Promise<{ token: string }> }) {
  const view = await getOrderView({ publicToken: (await params).token });
  if (!view) notFound();
  return (
    <div className="container-page pt-12 pb-24">
      <header className="mb-12 max-w-2xl">
        <p className="numeric text-small text-ink-soft">Bestellung {view.order.number}</p>
        <h1 className="mt-3 font-display text-h1">{ORDER_STATUS[view.order.status].label}</h1>
        <div className="mt-8">
          <StatusTimeline status={view.order.status} />
        </div>
      </header>
      <OrderDetails view={view} />
    </div>
  );
}
