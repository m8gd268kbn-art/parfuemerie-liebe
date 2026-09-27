import { desc } from "drizzle-orm";
import { ButtonLink } from "@/components/ui/button";
import { AdminLink, AdminPage, StatusPill, Table, Td } from "@/features/admin/ui";
import { formatDate, formatPrice } from "@/lib/format";
import { db } from "@/services/db";
import { coupons } from "@/services/db/schema";

export const metadata = { title: "Gutscheine" };

export default async function AdminCoupons() {
  const rows = await db.select().from(coupons).orderBy(desc(coupons.createdAt));
  const now = new Date();
  return (
    <AdminPage title="Gutscheine" description="Rabattcodes für den Warenkorb. Bedingungen werden bei jeder Bestellung serverseitig erneut geprüft." actions={<ButtonLink href="/admin/gutscheine/neu" size="sm">Neuer Gutschein</ButtonLink>}>
      <Table head={["Code", "Rabatt", "Bedingungen", "Laufzeit", "Einlösungen", "Status"]} empty={rows.length ? undefined : "Noch keine Gutscheine."}>
        {rows.map((c) => {
          const expired = c.expiresAt && c.expiresAt < now;
          const exhausted = c.usageLimit != null && c.usageCount >= c.usageLimit;
          return (
            <tr key={c.id} className="hover:bg-porcelain/50">
              <Td><AdminLink href={`/admin/gutscheine/${c.id}`}>{c.code}</AdminLink>{c.description && <span className="block text-caption text-muted">{c.description}</span>}</Td>
              <Td>{c.type === "percent" ? `${c.value} %` : formatPrice(c.value)}</Td>
              <Td className="text-caption text-ink-soft">
                {[
                  c.minSubtotalCents ? `ab ${formatPrice(c.minSubtotalCents)}` : null,
                  c.oncePerCustomer ? "einmal pro Person" : null,
                  c.productIds.length ? `${c.productIds.length} Produkte` : null,
                  c.brandIds.length ? `${c.brandIds.length} Marken` : null,
                ].filter(Boolean).join(", ") || "keine"}
              </Td>
              <Td className="text-caption text-ink-soft">{c.startsAt ? formatDate(c.startsAt) : "sofort"} bis {c.expiresAt ? formatDate(c.expiresAt) : "unbegrenzt"}</Td>
              <Td>{c.usageCount}{c.usageLimit != null && ` von ${c.usageLimit}`}</Td>
              <Td>
                {!c.active ? <StatusPill tone="neutral">inaktiv</StatusPill> : expired ? <StatusPill tone="neutral">abgelaufen</StatusPill> : exhausted ? <StatusPill tone="warning">aufgebraucht</StatusPill> : <StatusPill tone="accent">aktiv</StatusPill>}
              </Td>
            </tr>
          );
        })}
      </Table>
    </AdminPage>
  );
}
