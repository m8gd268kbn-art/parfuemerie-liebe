import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { deleteCategoryAction, saveCategoryAction } from "@/features/admin/catalog-actions";
import { ACheck, ACheckGroup, ActionButton, AdminForm, AField, AFile, ASelect } from "@/features/admin/kit";
import { AdminLink, AdminPage, Panel } from "@/features/admin/ui";
import { describeRule } from "@/lib/catalog/rules";
import { db } from "@/services/db";
import { categories } from "@/services/db/schema";

export const metadata = { title: "Kategorie" };

export default async function EditCategory({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "neu";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const c = isNew ? undefined : (await db.select().from(categories).where(eq(categories.id, id)).limit(1))[0];
  if (!isNew && !c) notFound();
  const r = c?.rule ?? {};
  return (
    <AdminPage
      title={c?.name ?? "Neue Kategorie"}
      description={c ? <AdminLink href={`/${c.slug}`}>Kategorie im Shop</AdminLink> : undefined}
      actions={<AdminLink href="/admin/kategorien">Zur Übersicht</AdminLink>}
    >
      <Panel>
        <AdminForm action={saveCategoryAction.bind(null, c?.id ?? null)} submitLabel={c ? "Änderungen speichern" : "Kategorie anlegen"}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <AField name="name" label="Name" required defaultValue={c?.name} />
            {c?.system ? (
              <p className="self-end pb-2 text-small text-ink-soft">URL /{c.slug} (Systemkategorie, fest)</p>
            ) : (
              <AField name="slug" label="URL-Pfad" defaultValue={c?.slug} hint="Leer lassen: wird aus dem Namen erzeugt." />
            )}
            <AField name="description" label="Beschreibung" textarea rows={3} defaultValue={c?.description} className="md:col-span-2" />
            <AField name="sortOrder" label="Reihenfolge" type="number" required defaultValue={c?.sortOrder ?? 10} />
            <div className="flex flex-col justify-end gap-2.5 pb-1">
              <ACheck name="showInNav" label="In der Navigation zeigen" defaultChecked={c?.showInNav ?? true} />
              {!c?.system && <ACheck name="active" label="Aktiv" defaultChecked={c?.active ?? true} />}
            </div>
          </div>
          {c?.system ? (
            <p className="text-small text-ink-soft">Inhalt: {describeRule(r)} (Regel der Systemkategorie, nicht änderbar).</p>
          ) : (
            <fieldset className="flex flex-col gap-4 border-t border-line pt-6">
              <legend className="mb-4 text-small font-semibold">Inhalt</legend>
              <ASelect
                name="mode"
                label="Art"
                defaultValue={r.manual ? "manual" : "rule"}
                options={[
                  { value: "rule", label: "Regel: Produkte automatisch nach Merkmalen" },
                  { value: "manual", label: "Manuell: Produkte in den Stammdaten zuordnen" },
                ]}
                className="max-w-md"
              />
              <p className="text-caption text-muted">Die folgenden Merkmale gelten nur für Regel-Kategorien. Ohne Merkmal enthält die Kategorie alle Produkte.</p>
              <ACheckGroup name="gender" label="Zielgruppe" options={[{ value: "women", label: "Damen" }, { value: "men", label: "Herren" }, { value: "unisex", label: "Unisex" }]} selected={r.gender ?? []} />
              <div className="flex flex-wrap gap-x-5 gap-y-2">
                <ACheck name="niche" label="nur Nischendüfte" defaultChecked={r.niche} />
                <ACheck name="isNew" label="nur Neuheiten" defaultChecked={r.isNew} />
                <ACheck name="bestseller" label="nur Bestseller" defaultChecked={r.bestseller} />
                <ACheck name="onSale" label="nur reduzierte" defaultChecked={r.onSale} />
              </div>
            </fieldset>
          )}
          <div className="grid grid-cols-1 gap-5 border-t border-line pt-6 md:grid-cols-2">
            <AFile name="hero" label="Titelbild" current={c?.heroImageUrl} removeName="removeHero" />
            <div />
            <AField name="seoTitle" label="SEO-Titel" defaultValue={c?.seoTitle} />
            <AField name="seoDescription" label="SEO-Beschreibung" defaultValue={c?.seoDescription} />
          </div>
        </AdminForm>
      </Panel>
      {c && !c.system && (
        <Panel title="Kategorie löschen">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-small text-ink-soft">Produkte bleiben erhalten, nur die Zuordnung entfällt.</p>
            <ActionButton action={deleteCategoryAction.bind(null, c.id)} label="Kategorie löschen" confirm="Kategorie endgültig löschen?" />
          </div>
        </Panel>
      )}
    </AdminPage>
  );
}
