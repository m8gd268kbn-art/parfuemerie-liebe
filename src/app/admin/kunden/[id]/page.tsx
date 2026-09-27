import { desc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ActionButton } from "@/features/admin/kit";
import { setCustomerDisabledAction } from "@/features/admin/marketing-actions";
import { AdminLink, AdminPage, Panel, StatusPill, Table, Td } from "@/features/admin/ui";
import { ORDER_STATUS } from "@/lib/commerce/order-status";
import { COUNTRY_NAMES } from "@/lib/commerce/shipping";
import { formatDate, formatDateTime, formatPrice } from "@/lib/format";
import { db } from "@/services/db";
import { addresses, newsletterSubscribers, orders, users } from "@/services/db/schema";

export const metadata = { title: "Kunde" };

export default async function AdminCustomer({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [u] = await db.select().from(users).where(eq(users.id, id)).limit(1);
  if (!u) notFound();
  const [orderRows, addressRows, [newsletter]] = await Promise.all([
    db.select().from(orders).where(eq(orders.userId, id)).orderBy(desc(orders.createdAt)),
    db.select().from(addresses).where(eq(addresses.userId, id)),
    db.select({ status: newsletterSubscribers.status }).from(newsletterSubscribers).where(eq(newsletterSubscribers.email, u.email)).limit(1),
  ]);
  const name = `${u.firstName} ${u.lastName}`.trim() || u.email;
  return (
    <AdminPage title={name} description={u.email} actions={<AdminLink href="/admin/kunden">Zur Übersicht</AdminLink>}>
      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Konto">
          <dl className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2 text-small">
            <dt className="text-ink-soft">Registriert</dt><dd>{formatDateTime(u.createdAt)}</dd>
            <dt className="text-ink-soft">Letzte Anmeldung</dt><dd>{u.lastLoginAt ? formatDateTime(u.lastLoginAt) : "-"}</dd>
            <dt className="text-ink-soft">E-Mail bestätigt</dt><dd>{u.emailVerifiedAt ? formatDate(u.emailVerifiedAt) : "nein"}</dd>
            <dt className="text-ink-soft">Newsletter</dt><dd>{newsletter ? { pending: "unbestätigt", confirmed: "bestätigt", unsubscribed: "abgemeldet" }[newsletter.status] : "nicht angemeldet"}</dd>
            <dt className="text-ink-soft">Rolle</dt><dd>{u.role === "admin" ? "Admin" : "Kunde"}</dd>
            <dt className="text-ink-soft">Status</dt><dd>{u.disabledAt ? <StatusPill tone="danger">gesperrt seit {formatDate(u.disabledAt)}</StatusPill> : "aktiv"}</dd>
          </dl>
          {u.role !== "admin" && (
            <div className="mt-5 border-t border-line pt-4">
              {u.disabledAt ? (
                <ActionButton action={setCustomerDisabledAction.bind(null, u.id, false)} label="Konto entsperren" />
              ) : (
                <ActionButton action={setCustomerDisabledAction.bind(null, u.id, true)} label="Konto sperren" confirm="Konto sperren? Die Person wird sofort abgemeldet und kann sich nicht mehr anmelden." />
              )}
            </div>
          )}
        </Panel>
        <Panel title="Adressen" className="xl:col-span-2">
          {addressRows.length === 0 ? <p className="text-small text-muted">Keine gespeicherten Adressen.</p> : (
            <ul className="grid gap-4 sm:grid-cols-2">
              {addressRows.map((a) => (
                <li key={a.id} className="text-small leading-relaxed">
                  {a.isDefaultShipping && <span className="mb-1 block text-caption text-muted">Standard-Lieferadresse</span>}
                  {a.firstName} {a.lastName}<br />
                  {a.company && <>{a.company}<br /></>}
                  {a.street} {a.houseNumber}<br />
                  {a.addressLine2 && <>{a.addressLine2}<br /></>}
                  {a.postalCode} {a.city}, {COUNTRY_NAMES[a.country] ?? a.country}
                  {a.phone && <><br />{a.phone}</>}
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Table head={["Bestellung", "Datum", "Status", "Summe"]} empty={orderRows.length ? undefined : "Noch keine Bestellungen mit diesem Konto."}>
        {orderRows.map((o) => (
          <tr key={o.id}>
            <Td><AdminLink href={`/admin/bestellungen/${o.id}`}>{o.number}</AdminLink></Td>
            <Td className="text-ink-soft">{formatDateTime(o.createdAt)}</Td>
            <Td><StatusPill tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</StatusPill></Td>
            <Td>{formatPrice(o.totalCents)}</Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
