import { asc, eq } from "drizzle-orm";
import { deleteSampleAction, saveSampleAction } from "@/features/admin/catalog-actions";
import { ACheck, ActionButton, AdminForm, AField, AFile, ASelect } from "@/features/admin/kit";
import { AdminLink, AdminPage, Panel, StatusPill } from "@/features/admin/ui";
import { db } from "@/services/db";
import { brands, products, samples } from "@/services/db/schema";
import { getSettingsFresh } from "@/services/settings";

export const metadata = { title: "Duftproben" };

type Sample = typeof samples.$inferSelect;

function SampleFields({ s, productOptions }: { s?: Sample; productOptions: { value: string; label: string }[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AField name="brandName" label="Marke" required defaultValue={s?.brandName} />
      <AField name="name" label="Duft" required defaultValue={s?.name} />
      <AField name="sizeLabel" label="Inhalt" required defaultValue={s?.sizeLabel ?? "1,5 ml"} />
      <AField name="stock" label="Bestand" type="number" required defaultValue={s?.stock ?? 0} />
      <ASelect name="productId" label="Verknüpftes Produkt" defaultValue={s?.productId ?? ""} options={productOptions} className="sm:col-span-2" />
      <AField name="sortOrder" label="Reihenfolge" type="number" required defaultValue={s?.sortOrder ?? 0} />
      <div className="flex items-end pb-2.5"><ACheck name="active" label="Aktiv" defaultChecked={s?.active ?? true} /></div>
      <div className="sm:col-span-2"><AFile name="image" label="Bild" current={s?.imageUrl} /></div>
    </div>
  );
}

export default async function AdminSamples() {
  const [rows, productRows, settings] = await Promise.all([
    db.select().from(samples).orderBy(asc(samples.sortOrder), asc(samples.brandName)),
    db.select({ id: products.id, name: products.name, brand: brands.name }).from(products).innerJoin(brands, eq(brands.id, products.brandId)).orderBy(asc(brands.name), asc(products.name)),
    getSettingsFresh(),
  ]);
  const productOptions = [{ value: "", label: "Kein Produkt" }, ...productRows.map((p) => ({ value: p.id, label: `${p.brand} ${p.name}` }))];
  return (
    <AdminPage
      title="Duftproben"
      description={
        <>
          Kundinnen und Kunden wählen im Warenkorb bis zu {settings.samples.maxCount} Proben{settings.samples.enabled ? "" : " (derzeit ausgeschaltet)"}. Anzahl und Schalter unter{" "}
          <AdminLink href="/admin/einstellungen?tab=proben">Einstellungen</AdminLink>.
        </>
      }
    >
      <Panel title="Neue Probe">
        <AdminForm action={saveSampleAction.bind(null, null)} submitLabel="Probe anlegen">
          <SampleFields productOptions={productOptions} />
        </AdminForm>
      </Panel>
      {rows.map((s) => (
        <Panel
          key={s.id}
          title={`${s.brandName} ${s.name}`}
          actions={<span className="flex gap-1">{!s.active && <StatusPill tone="neutral">inaktiv</StatusPill>}{s.stock <= 0 && <StatusPill tone="danger">vergriffen</StatusPill>}</span>}
        >
          <AdminForm
            action={saveSampleAction.bind(null, s.id)}
            footer={<ActionButton action={deleteSampleAction.bind(null, s.id)} label="Löschen" variant="ghost" confirm="Probe löschen?" />}
          >
            <SampleFields s={s} productOptions={productOptions} />
          </AdminForm>
        </Panel>
      ))}
    </AdminPage>
  );
}
