import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { AdminLink, AdminPage, StatusPill, Table, Td } from "@/features/admin/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { REVENUE_STATUSES } from "@/lib/commerce/order-status";
import { db } from "@/services/db";
import { orders, users } from "@/services/db/schema";

export const metadata = { title: "Kunden" };

export default async function AdminCustomers({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw } = await searchParams;
  const q = raw?.trim().slice(0, 80);
  const revenue = sql.join(REVENUE_STATUSES.map((s) => sql`${s}`), sql`, `);
  const rows = await db
    .select({
      user: users,
      orderCount: sql<number>`count(${orders.id})::int`,
      total: sql<number>`coalesce(sum(${orders.totalCents}) filter (where ${orders.status} in (${revenue})), 0)::int`,
      lastOrder: sql<Date | null>`max(${orders.createdAt})`,
    })
    .from(users)
    .leftJoin(orders, eq(orders.userId, users.id))
    .where(q ? or(ilike(users.email, `%${q}%`), ilike(users.lastName, `%${q}%`), ilike(users.firstName, `%${q}%`)) : undefined)
    .groupBy(users.id)
    .orderBy(desc(users.createdAt))
    .limit(300);
  return (
    <AdminPage title="Kunden" description="Registrierte Kundenkonten. Gastbestellungen finden Sie unter Bestellungen.">
      <form><input name="q" defaultValue={q} placeholder="Name oder E-Mail" aria-label="Kunden suchen" className="h-9 w-64 rounded-sm border border-line-strong bg-white px-3 text-small" /></form>
      <Table head={["Name", "Registriert", "Bestellungen", "Umsatz", "Letzte Bestellung", "Status"]} empty={rows.length ? undefined : "Keine Konten gefunden."}>
        {rows.map(({ user: u, orderCount, total, lastOrder }) => (
          <tr key={u.id} className="hover:bg-porcelain/50">
            <Td><AdminLink href={`/admin/kunden/${u.id}`}>{`${u.firstName} ${u.lastName}`.trim() || u.email}</AdminLink><span className="block text-caption text-muted">{u.email}</span></Td>
            <Td className="text-ink-soft">{formatDate(u.createdAt)}</Td>
            <Td>{orderCount}</Td>
            <Td>{formatPrice(total)}</Td>
            <Td className="text-ink-soft">{lastOrder ? formatDate(lastOrder) : "-"}</Td>
            <Td className="space-x-1">
              {u.role === "admin" && <StatusPill tone="accent">Admin</StatusPill>}
              {u.disabledAt ? <StatusPill tone="danger">gesperrt</StatusPill> : !u.emailVerifiedAt ? <StatusPill tone="warning">E-Mail unbestätigt</StatusPill> : null}
            </Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
