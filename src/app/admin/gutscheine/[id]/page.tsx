import { asc, eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { ACheck, ACheckGroup, ActionButton, AdminForm, AField, ASelect } from "@/features/admin/kit";
import { deleteCouponAction, saveCouponAction } from "@/features/admin/marketing-actions";
import { AdminLink, AdminPage, Panel } from "@/features/admin/ui";
import { toBerlinInput } from "@/lib/berlin-time";
import { centsToEuroInput } from "@/lib/format";
import { db } from "@/services/db";
import { brands, coupons, products } from "@/services/db/schema";

export const metadata = { title: "Gutschein" };

export default async function EditCoupon({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "neu";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const c = isNew ? undefined : (await db.select().from(coupons).where(eq(coupons.id, id)).limit(1))[0];
  if (!isNew && !c) notFound();
  const [brandRows, productRows] = await Promise.all([
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ id: products.id, name: products.name, brand: brands.name }).from(products).innerJoin(brands, eq(brands.id, products.brandId)).orderBy(asc(brands.name), asc(products.name)),
  ]);
  return (
    <AdminPage title={c?.code ?? "Neuer Gutschein"} description={c ? `Bisher ${c.usageCount}-mal eingelöst.` : undefined} actions={<AdminLink href="/admin/gutscheine">Zur Übersicht</AdminLink>}>
      <Panel>
        <AdminForm action={saveCouponAction.bind(null, c?.id ?? null)} submitLabel={c ? "Änderungen speichern" : "Gutschein anlegen"}>
          <div className="grid gap-5 md:grid-cols-2">
            <AField name="code" label="Code" required defaultValue={c?.code} hint="Wird in Großbuchstaben gespeichert, z. B. HERBST10." />
            <AField name="description" label="Interne Beschreibung" defaultValue={c?.description} />
            <ASelect name="type" label="Art" defaultValue={c?.type ?? "percent"} options={[{ value: "percent", label: "Prozent vom Warenwert" }, { value: "fixed", label: "Fester Betrag in €" }]} />
            <AField name="value" label="Wert" required defaultValue={c ? (c.type === "fixed" ? centsToEuroInput(c.value) : c.value) : ""} inputMode="decimal" hint="Prozent: 10 für 10 %. Betrag: 10,00 für 10 €." />
            <AField name="minSubtotal" label="Mindestbestellwert in €" defaultValue={centsToEuroInput(c?.minSubtotalCents)} inputMode="decimal" />
            <AField name="usageLimit" label="Maximale Einlösungen gesamt" type="number" defaultValue={c?.usageLimit} />
            <AField name="startsAt" label="Gültig ab" type="datetime-local" defaultValue={toBerlinInput(c?.startsAt)} />
            <AField name="expiresAt" label="Gültig bis" type="datetime-local" defaultValue={toBerlinInput(c?.expiresAt)} />
            <div className="flex flex-col gap-2.5 md:col-span-2">
              <ACheck name="active" label="Aktiv" defaultChecked={c?.active ?? true} />
              <ACheck name="oncePerCustomer" label="Nur einmal pro Kundin/Kunde (E-Mail oder Konto)" defaultChecked={c?.oncePerCustomer} />
            </div>
          </div>
          <details className="border-t border-line pt-6" open={Boolean(c?.brandIds.length || c?.productIds.length)}>
            <summary className="cursor-pointer text-small font-semibold">Auf Marken oder Produkte beschränken</summary>
            <p className="mt-2 text-caption text-muted">Ohne Auswahl gilt der Gutschein für den gesamten Warenkorb. Mit Auswahl wird nur der Wert passender Artikel rabattiert.</p>
            <div className="mt-4 flex flex-col gap-6">
              <ACheckGroup name="brandIds" label="Marken" options={brandRows.map((b) => ({ value: b.id, label: b.name }))} selected={c?.brandIds ?? []} />
              <ACheckGroup name="productIds" label="Produkte" options={productRows.map((p) => ({ value: p.id, label: `${p.brand} ${p.name}` }))} selected={c?.productIds ?? []} />
            </div>
          </details>
        </AdminForm>
      </Panel>
      {c && (
        <Panel title="Gutschein löschen">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-small text-ink-soft">Nur möglich, solange der Gutschein nie eingelöst wurde. Sonst deaktivieren.</p>
            <ActionButton action={deleteCouponAction.bind(null, c.id)} label="Gutschein löschen" confirm="Gutschein endgültig löschen?" />
          </div>
        </Panel>
      )}
    </AdminPage>
  );
}
