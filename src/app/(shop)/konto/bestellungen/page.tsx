import { OrderList } from "@/features/account/order-list";
import { requireUser } from "@/services/auth/session";
import { customerOrders } from "@/services/orders/customer";

export default async function OrdersPage() {
  const user = await requireUser("/konto/bestellungen");
  const orders = await customerOrders(user.id);
  return (
    <section aria-labelledby="orders-title">
      <h2 id="orders-title" className="font-display text-h2">Bestellungen</h2>
      <div className="mt-6">
        {orders.length ? <OrderList orders={orders} /> : <p className="text-body text-ink-soft">Noch keine Bestellungen.</p>}
      </div>
    </section>
  );
}
