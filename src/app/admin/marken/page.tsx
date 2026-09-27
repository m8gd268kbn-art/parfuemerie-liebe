import { asc, eq, sql } from "drizzle-orm";
import { ButtonLink } from "@/components/ui/button";
import { AdminLink, AdminPage, StatusPill, Table, Td } from "@/features/admin/ui";
import { db } from "@/services/db";
import { brands, products } from "@/services/db/schema";

export const metadata = { title: "Marken" };

export default async function AdminBrands() {
  const rows = await db
    .select({ brand: brands, count: sql<number>`count(${products.id})::int` })
    .from(brands)
    .leftJoin(products, eq(products.brandId, brands.id))
    .groupBy(brands.id)
    .orderBy(asc(brands.name));
  return (
    <AdminPage title="Marken" actions={<ButtonLink href="/admin/marken/neu" size="sm">Neue Marke</ButtonLink>}>
      <Table head={["Marke", "Produkte", "Herkunft", "Kennzeichen", "Status"]} empty={rows.length ? undefined : "Noch keine Marken."}>
        {rows.map(({ brand: b, count }) => (
          <tr key={b.id} className="hover:bg-porcelain/50">
            <Td><AdminLink href={`/admin/marken/${b.id}`}>{b.name}</AdminLink><span className="block text-caption text-muted">/marken/{b.slug}</span></Td>
            <Td>{count > 0 ? <AdminLink href={`/admin/produkte?marke=${b.slug}`}>{count}</AdminLink> : <span className="text-muted">0</span>}</Td>
            <Td className="text-ink-soft">{b.country ?? "-"}</Td>
            <Td className="space-x-1">{b.niche && <StatusPill tone="neutral">Nische</StatusPill>}{b.featured && <StatusPill tone="neutral">Startseite</StatusPill>}</Td>
            <Td><StatusPill tone={b.active ? "accent" : "neutral"}>{b.active ? "aktiv" : "inaktiv"}</StatusPill></Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
