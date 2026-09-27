import { AdminLink, AdminPage, Panel, Stat, StatusPill, Table, Td } from "@/features/admin/ui";
import { ORDER_STATUS } from "@/lib/commerce/order-status";
import { formatDateTime, formatPrice } from "@/lib/format";
import { dashboardData } from "@/services/admin/dashboard";
import { releaseExpiredReservations } from "@/services/orders";

export const metadata = { title: "Dashboard" };

export default async function AdminDashboard() {
  await releaseExpiredReservations();
  const d = await dashboardData();
  return (
    <AdminPage title="Dashboard" description="Kennzahlen der letzten 30 Tage aus bezahlten Bestellungen.">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Umsatz (30 Tage, brutto)" value={formatPrice(d.revenueCents)} />
        <Stat label="Bestellungen (30 Tage)" value={d.orderCount} />
        <Stat label="Durchschnittlicher Bestellwert" value={d.orderCount ? formatPrice(d.avgCents) : "-"} />
        <Stat label="Offen zu versenden" value={d.openOrders} hint={d.pendingReviews ? `${d.pendingReviews} Bewertungen warten auf Freigabe` : undefined} />
      </div>
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <Panel title="Aktuelle Bestellungen" actions={<AdminLink href="/admin/bestellungen">Alle</AdminLink>}>
          {d.recent.length === 0 ? <p className="text-small text-muted">Noch keine Bestellungen.</p> : (
            <ul className="divide-y divide-line">
              {d.recent.map((o) => (
                <li key={o.id} className="flex items-center justify-between gap-4 py-2.5 text-small">
                  <span><AdminLink href={`/admin/bestellungen/${o.id}`}>{o.number}</AdminLink><span className="ml-3 text-muted">{formatDateTime(o.createdAt)}</span></span>
                  <span className="flex items-center gap-3"><StatusPill tone={ORDER_STATUS[o.status].tone}>{ORDER_STATUS[o.status].label}</StatusPill><span className="tabular">{formatPrice(o.totalCents)}</span></span>
                </li>
              ))}
            </ul>
          )}
        </Panel>
        <Panel title="Wenig Bestand (≤ 3)">
          {d.lowStock.length === 0 ? <p className="text-small text-muted">Alle Varianten ausreichend auf Lager.</p> : (
            <ul className="divide-y divide-line">
              {d.lowStock.map((v) => (
                <li key={v.variantId} className="flex items-center justify-between gap-4 py-2.5 text-small">
                  <span><AdminLink href={`/admin/produkte/${v.productId}`}>{v.brand} {v.name}</AdminLink><span className="ml-2 text-muted">{v.sizeMl} ml</span></span>
                  <StatusPill tone={v.stock <= 0 ? "danger" : "warning"}>{v.stock <= 0 ? "ausverkauft" : `${v.stock} Stück`}</StatusPill>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
      <Panel title="Top-Produkte (30 Tage)">
        {d.top.length === 0 ? <p className="text-small text-muted">Noch keine Verkäufe im Zeitraum.</p> : (
          <Table head={["Produkt", "Stück", "Umsatz"]}>
            {d.top.map((t) => (
              <tr key={`${t.productId}-${t.name}`}>
                <Td>{t.brand} {t.name}</Td>
                <Td>{t.qty}</Td>
                <Td>{formatPrice(t.revenue)}</Td>
              </tr>
            ))}
          </Table>
        )}
      </Panel>
    </AdminPage>
  );
}
