import { and, desc, eq, ilike, or, type SQL } from "drizzle-orm";
import Link from "next/link";
import { AdminLink, AdminPage, StatusPill, Table, Td } from "@/features/admin/ui";
import { ORDER_STATUS, type OrderStatus } from "@/lib/commerce/order-status";
import { formatDateTime, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { db } from "@/services/db";
import { orders } from "@/services/db/schema";

export const metadata = { title: "Bestellungen" };

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = sp.status && sp.status in ORDER_STATUS ? (sp.status as OrderStatus) : null;
  const q = sp.q?.trim().slice(0, 80);
  const conds: SQL[] = [];
  if (status) conds.push(eq(orders.status, status));
  if (q) conds.push(or(ilike(orders.number, `%${q}%`), ilike(orders.email, `%${q}%`))!);
  const rows = await db.select().from(orders).where(conds.length ? and(...conds) : undefined).orderBy(desc(orders.createdAt)).limit(200);
  const tabs: (OrderStatus | null)[] = [null, "pending_payment", "paid", "processing", "packed", "shipped", "delivered", "cancelled", "refunded"];
  return (
    <AdminPage title="Bestellungen">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Status" className="flex flex-wrap gap-1">
          {tabs.map((t) => (
            <Link key={t ?? "all"} href={t ? `/admin/bestellungen?status=${t}` : "/admin/bestellungen"} className={cn("rounded-sm px-3 py-1.5 text-caption", status === t ? "bg-ink text-paper" : "text-ink-soft hover:bg-porcelain")}>
              {t ? ORDER_STATUS[t].label : "Alle"}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2">
          {status && <input type="hidden" name="status" value={status} />}
          <input name="q" defaultValue={q} placeholder="Nummer oder E-Mail" aria-label="Bestellungen suchen" className="h-9 w-56 rounded-sm border border-line-strong bg-white px-3 text-small" />
        </form>
      </div>
      <Table head={["Nummer", "Datum", "Kundin/Kunde", "Status", "Art", "Summe"]} empty={rows.length ? undefined : "Keine Bestellungen gefunden."}>
        {rows.map((o) => (
          <tr key={o.id} className="hover:bg-porcelain/50">
            <Td><AdminLink href={`/admin/bestellungen/${o.id}`}>{o.number}</AdminLink></Td>
            <Td className="text-ink-soft">{formatDateTime(o.createdAt)}</Td>
            <Td>{o.billingAddress.firstName} {o.billingAddress.lastName}<span className="block text-caption text-muted">{o.email}</span></Td>
            <Td><StatusPill tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</StatusPill></Td>
            <Td className="text-ink-soft">{o.fulfillmentType === "pickup" ? "Abholung" : "Versand"}</Td>
            <Td>{formatPrice(o.totalCents)}</Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
