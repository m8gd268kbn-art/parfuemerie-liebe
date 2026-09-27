import { and, asc, eq, ilike, or, sql, type SQL } from "drizzle-orm";
import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { concentrationLabel } from "@/config/catalog";
import { AdminLink, AdminPage, StatusPill, Table, Td } from "@/features/admin/ui";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { db } from "@/services/db";
import { brands, productImages, products, productVariants } from "@/services/db/schema";

export const metadata = { title: "Produkte" };

const FILTERS = [
  { key: "", label: "Alle" },
  { key: "aktiv", label: "Aktiv" },
  { key: "inaktiv", label: "Inaktiv" },
  { key: "bestand", label: "Wenig Bestand" },
  { key: "demo", label: "Demo-Daten" },
] as const;

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string; filter?: string; marke?: string }> }) {
  const sp = await searchParams;
  const q = sp.q?.trim().slice(0, 80);
  const filter = FILTERS.some((f) => f.key === sp.filter) ? sp.filter! : "";
  const conds: SQL[] = [];
  if (q) conds.push(or(ilike(products.name, `%${q}%`), ilike(brands.name, `%${q}%`), sql`exists (select 1 from product_variants v where v.product_id = ${products.id} and v.sku ilike ${`%${q}%`})`)!);
  if (filter === "aktiv") conds.push(eq(products.active, true));
  if (filter === "inaktiv") conds.push(eq(products.active, false));
  if (filter === "demo") conds.push(eq(products.isDemo, true));
  if (sp.marke) conds.push(eq(brands.slug, sp.marke));

  const rows = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      active: products.active,
      isDemo: products.isDemo,
      concentration: products.concentration,
      brand: brands.name,
      variants: sql<number>`(select count(*)::int from ${productVariants} v where v.product_id = ${products.id})`,
      minPrice: sql<number | null>`(select min(v.price_cents)::int from ${productVariants} v where v.product_id = ${products.id} and v.active)`,
      maxPrice: sql<number | null>`(select max(v.price_cents)::int from ${productVariants} v where v.product_id = ${products.id} and v.active)`,
      minStock: sql<number | null>`(select min(v.stock)::int from ${productVariants} v where v.product_id = ${products.id} and v.active)`,
      stock: sql<number>`(select coalesce(sum(v.stock), 0)::int from ${productVariants} v where v.product_id = ${products.id} and v.active)`,
      image: sql<string | null>`(select i.url from ${productImages} i where i.product_id = ${products.id} order by i.sort_order, i.created_at limit 1)`,
    })
    .from(products)
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(conds.length ? and(...conds) : undefined)
    .orderBy(asc(brands.name), asc(products.name));
  const list = filter === "bestand" ? rows.filter((r) => (r.minStock ?? 0) <= 3) : rows;

  return (
    <AdminPage title="Produkte" description={`${list.length} von ${rows.length} Produkten.`} actions={<ButtonLink href="/admin/produkte/neu" size="sm">Neues Produkt</ButtonLink>}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Filter" className="flex flex-wrap gap-1">
          {FILTERS.map((f) => (
            <Link key={f.key} href={f.key ? `/admin/produkte?filter=${f.key}` : "/admin/produkte"} className={cn("rounded-sm px-3 py-1.5 text-caption", filter === f.key ? "bg-ink text-paper" : "text-ink-soft hover:bg-porcelain")}>
              {f.label}
            </Link>
          ))}
        </nav>
        <form className="flex gap-2">
          {filter && <input type="hidden" name="filter" value={filter} />}
          <input name="q" defaultValue={q} placeholder="Name, Marke oder Artikelnummer" aria-label="Produkte suchen" className="h-9 w-64 rounded-sm border border-line-strong bg-white px-3 text-small" />
        </form>
      </div>
      <Table head={["", "Produkt", "Größen", "Preis", "Bestand", "Status"]} empty={list.length ? undefined : "Keine Produkte gefunden."}>
        {list.map((p) => (
          <tr key={p.id} className="hover:bg-porcelain/50">
            <Td className="w-14">
              {p.image ? <Image src={p.image} alt="" width={40} height={50} className="h-[50px] w-10 bg-porcelain object-cover" /> : <span className="block h-[50px] w-10 bg-porcelain" />}
            </Td>
            <Td>
              <span className="block text-caption text-muted">{p.brand}</span>
              <AdminLink href={`/admin/produkte/${p.id}`}>{p.name}</AdminLink>
              <span className="ml-2 text-caption text-muted">{concentrationLabel(p.concentration)}</span>
            </Td>
            <Td className="text-ink-soft">{p.variants}</Td>
            <Td>{p.minPrice == null ? <span className="text-muted">-</span> : p.minPrice === p.maxPrice ? formatPrice(p.minPrice) : `${formatPrice(p.minPrice)} bis ${formatPrice(p.maxPrice!)}`}</Td>
            <Td>
              {p.minStock == null ? <span className="text-muted">-</span> : p.minStock <= 0 ? <StatusPill tone="danger">{p.stock} (Größe leer)</StatusPill> : p.minStock <= 3 ? <StatusPill tone="warning">{p.stock}</StatusPill> : p.stock}
            </Td>
            <Td className="space-x-1">
              <StatusPill tone={p.active ? "accent" : "neutral"}>{p.active ? "aktiv" : "inaktiv"}</StatusPill>
              {p.isDemo && <StatusPill tone="neutral">Demo</StatusPill>}
            </Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
