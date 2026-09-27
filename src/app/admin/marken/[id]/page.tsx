import { eq } from "drizzle-orm";
import { notFound } from "next/navigation";
import { deleteBrandAction, saveBrandAction } from "@/features/admin/catalog-actions";
import { ACheck, ActionButton, AdminForm, AField, AFile } from "@/features/admin/kit";
import { AdminLink, AdminPage, Panel } from "@/features/admin/ui";
import { db } from "@/services/db";
import { brands } from "@/services/db/schema";

export const metadata = { title: "Marke" };

export default async function EditBrand({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const isNew = id === "neu";
  if (!isNew && !/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const b = isNew ? undefined : (await db.select().from(brands).where(eq(brands.id, id)).limit(1))[0];
  if (!isNew && !b) notFound();
  return (
    <AdminPage
      title={b?.name ?? "Neue Marke"}
      description={b ? <AdminLink href={`/marken/${b.slug}`}>Markenseite im Shop</AdminLink> : "Markentexte bitte nur aus freigegebenen Quellen übernehmen (Hersteller, eigene Texte)."}
      actions={<AdminLink href="/admin/marken">Zur Übersicht</AdminLink>}
    >
      <Panel>
        <AdminForm action={saveBrandAction.bind(null, b?.id ?? null)} submitLabel={b ? "Änderungen speichern" : "Marke anlegen"}>
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            <AField name="name" label="Name" required defaultValue={b?.name} />
            <AField name="slug" label="URL-Pfad" defaultValue={b?.slug} hint="Leer lassen: wird aus dem Namen erzeugt." />
            <AField name="country" label="Herkunftsland" defaultValue={b?.country} />
            <div className="flex flex-col justify-end gap-2.5 pb-1">
              <ACheck name="active" label="Aktiv" defaultChecked={b?.active ?? true} />
              <ACheck name="niche" label="Nischenmarke" defaultChecked={b?.niche} />
              <ACheck name="featured" label="Auf der Startseite zeigen" defaultChecked={b?.featured} />
            </div>
            <AField name="description" label="Kurzbeschreibung" textarea rows={3} defaultValue={b?.description} className="md:col-span-2" />
            <AField name="story" label="Markengeschichte" textarea rows={6} defaultValue={b?.story} className="md:col-span-2" hint="Nur belegbare Angaben." />
            <AFile name="logo" label="Logo" current={b?.logoUrl} removeName="removeLogo" hint="Nur mit Nutzungsrecht, z. B. aus dem Pressebereich der Marke." />
            <AFile name="hero" label="Titelbild" current={b?.heroImageUrl} removeName="removeHero" />
            <AField name="seoTitle" label="SEO-Titel" defaultValue={b?.seoTitle} />
            <AField name="seoDescription" label="SEO-Beschreibung" defaultValue={b?.seoDescription} />
          </div>
        </AdminForm>
      </Panel>
      {b && (
        <Panel title="Marke löschen">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <p className="max-w-xl text-small text-ink-soft">Nur möglich, wenn keine Produkte mehr zugeordnet sind.</p>
            <ActionButton action={deleteBrandAction.bind(null, b.id)} label="Marke löschen" confirm="Marke endgültig löschen?" />
          </div>
        </Panel>
      )}
    </AdminPage>
  );
}
