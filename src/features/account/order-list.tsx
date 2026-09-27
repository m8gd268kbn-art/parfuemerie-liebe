import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { ORDER_STATUS } from "@/lib/commerce/order-status";
import { formatDate, formatPrice } from "@/lib/format";
import type { customerOrders } from "@/services/orders/customer";

export function OrderList({ orders }: { orders: Awaited<ReturnType<typeof customerOrders>> }) {
  return (
    <ul className="divide-y divide-line border-y border-line">
      {orders.map(({ order, items }) => (
        <li key={order.id}>
          <Link href={`/konto/bestellungen/${order.number}`} className="group grid grid-cols-1 gap-4 py-5 sm:grid-cols-[1fr_auto] sm:items-center">
            <div className="flex items-center gap-4">
              <div className="flex -space-x-3">
                {items.slice(0, 3).map((i) => (
                  <span key={i.id} className="relative block h-16 w-12 overflow-hidden border border-paper bg-porcelain">
                    {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="48px" className="object-cover" />}
                  </span>
                ))}
              </div>
              <div>
                <p className="numeric text-small font-medium group-hover:underline">{order.number}</p>
                <p className="text-caption text-ink-soft">
                  {formatDate(order.createdAt)} · {items.reduce((n, i) => n + i.quantity, 0)} Artikel
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4 sm:justify-end">
              <Badge tone={ORDER_STATUS[order.status].tone === "danger" ? "muted" : "neutral"} className="border border-line">
                {ORDER_STATUS[order.status].label}
              </Badge>
              <span className="numeric text-small">{formatPrice(order.totalCents)}</span>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
