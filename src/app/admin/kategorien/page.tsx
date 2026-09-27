import { asc } from "drizzle-orm";
import { ButtonLink } from "@/components/ui/button";
import { AdminLink, AdminPage, StatusPill, Table, Td } from "@/features/admin/ui";
import { describeRule } from "@/lib/catalog/rules";
import { db } from "@/services/db";
import { categories } from "@/services/db/schema";

export const metadata = { title: "Kategorien" };

export default async function AdminCategories() {
  const rows = await db.select().from(categories).orderBy(asc(categories.sortOrder), asc(categories.name));
  return (
    <AdminPage
      title="Kategorien"
      description="Kategorien sind entweder Regeln (z. B. alle Nischendüfte) oder manuelle Auswahlen, denen Sie Produkte in den Stammdaten zuordnen."
      actions={<ButtonLink href="/admin/kategorien/neu" size="sm">Neue Kategorie</ButtonLink>}
    >
      <Table head={["Pos.", "Kategorie", "Inhalt", "Navigation", "Status"]}>
        {rows.map((c) => (
          <tr key={c.id} className="hover:bg-porcelain/50">
            <Td className="text-muted">{c.sortOrder}</Td>
            <Td><AdminLink href={`/admin/kategorien/${c.id}`}>{c.name}</AdminLink><span className="block text-caption text-muted">/{c.slug}</span></Td>
            <Td className="text-ink-soft">{describeRule(c.rule)}</Td>
            <Td>{c.showInNav ? "sichtbar" : <span className="text-muted">ausgeblendet</span>}</Td>
            <Td className="space-x-1"><StatusPill tone={c.active ? "accent" : "neutral"}>{c.active ? "aktiv" : "inaktiv"}</StatusPill>{c.system && <StatusPill tone="neutral">System</StatusPill>}</Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
