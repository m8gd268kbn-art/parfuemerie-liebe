import { CHARACTERS, CONCENTRATIONS, FAMILIES, GENDERS, INTENSITY_LABELS, OCCASIONS, SEASONS } from "@/config/catalog";
import type { ActionResult } from "@/lib/action-result";
import type { products } from "@/services/db/schema";
import { ACheck, ACheckGroup, AdminForm, AField, ASelect } from "./kit";

type Product = typeof products.$inferSelect;
type S = ActionResult<unknown> | null;

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="border-t border-line pt-6 first:border-0 first:pt-0">
      <legend className="float-left mb-5 w-full text-small font-semibold">{title}</legend>
      <div className="clear-left grid grid-cols-1 gap-5 md:grid-cols-2">{children}</div>
    </fieldset>
  );
}

/** Stammdaten eines Produkts. Varianten und Bilder werden separat gepflegt (erst nach dem Anlegen). */
export function ProductForm({
  action,
  product,
  brands,
  manualCategories,
  selectedCategoryIds,
}: {
  action: (prev: S, fd: FormData) => Promise<S>;
  product?: Product;
  brands: { id: string; name: string }[];
  manualCategories: { id: string; name: string }[];
  selectedCategoryIds: string[];
}) {
  const p = product;
  return (
    <AdminForm action={action} submitLabel={p ? "Änderungen speichern" : "Produkt anlegen"}>
      <Group title="Grunddaten">
        <AField name="name" label="Produktname" required defaultValue={p?.name} placeholder="z. B. Bleu de Chanel" />
        <ASelect name="brandId" label="Marke" defaultValue={p?.brandId} options={[{ value: "", label: "Bitte wählen" }, ...brands.map((b) => ({ value: b.id, label: b.name }))]} />
        <ASelect name="concentration" label="Konzentration" defaultValue={p?.concentration ?? "edp"} options={CONCENTRATIONS.map((c) => ({ value: c.key, label: c.label }))} />
        <ASelect name="gender" label="Zielgruppe" defaultValue={p?.gender ?? "unisex"} options={GENDERS.map((g) => ({ value: g.key, label: g.label }))} />
        <AField name="slug" label="URL-Pfad" defaultValue={p?.slug} hint="Leer lassen: wird aus Marke und Name erzeugt. Änderungen brechen bestehende Links." />
        <AField name="liquidColor" label="Flüssigkeitsfarbe (Hex)" defaultValue={p?.liquidColor} placeholder="#c78a41" hint="Für Platzhalter-Visualisierungen, solange keine Fotos vorliegen." />
        <AField name="description" label="Beschreibung" textarea rows={6} defaultValue={p?.description} className="md:col-span-2" />
      </Group>

      <Group title="Duftprofil">
        <ASelect name="primaryFamily" label="Hauptfamilie" defaultValue={p?.families[0] ?? ""} options={[{ value: "", label: "Bitte wählen" }, ...FAMILIES.map((f) => ({ value: f.key, label: f.label }))]} />
        <ASelect
          name="intensity"
          label="Intensität"
          defaultValue={p?.intensity ? String(p.intensity) : ""}
          options={[{ value: "", label: "Nicht angegeben" }, ...[1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} · ${INTENSITY_LABELS[n]}` }))]}
        />
        <div className="md:col-span-2">
          <ACheckGroup name="families" label="Weitere Duftfamilien" options={FAMILIES.map((f) => ({ value: f.key, label: f.label }))} selected={p?.families.slice(1) ?? []} />
        </div>
        <AField name="topNotes" label="Kopfnoten" defaultValue={p?.topNotes.join(", ")} hint="Kommagetrennt, z. B. Bergamotte, Pink Pepper" />
        <AField name="heartNotes" label="Herznoten" defaultValue={p?.heartNotes.join(", ")} />
        <AField name="baseNotes" label="Basisnoten" defaultValue={p?.baseNotes.join(", ")} />
        <div />
        <div className="md:col-span-2">
          <ACheckGroup name="character" label="Charakter" options={CHARACTERS.map((c) => ({ value: c, label: c }))} selected={p?.character ?? []} />
        </div>
        <ACheckGroup name="seasons" label="Jahreszeiten" options={SEASONS.map((s) => ({ value: s, label: s }))} selected={p?.seasons ?? []} />
        <ACheckGroup name="occasions" label="Anlässe" options={OCCASIONS.map((o) => ({ value: o, label: o }))} selected={p?.occasions ?? []} />
      </Group>

      <Group title="Pflichtangaben und Hinweise">
        <AField name="ingredients" label="Inhaltsstoffe (INCI)" textarea rows={4} defaultValue={p?.ingredients} hint="Vom Hersteller bzw. der Verpackung übernehmen." className="md:col-span-2" />
        <AField name="usage" label="Anwendung" textarea rows={3} defaultValue={p?.usage} />
        <AField name="manufacturerInfo" label="Herstellerangaben" textarea rows={3} defaultValue={p?.manufacturerInfo} hint="Name und Anschrift des verantwortlichen Herstellers." />
      </Group>

      <Group title="Sichtbarkeit und Kennzeichnung">
        <div className="flex flex-col gap-2.5 md:col-span-2">
          <ACheck name="active" label="Aktiv (im Shop sichtbar)" defaultChecked={p?.active ?? true} />
          <ACheck name="featured" label="Auf der Startseite hervorheben" defaultChecked={p?.featured} />
          <ACheck name="bestseller" label="Als Bestseller kennzeichnen" defaultChecked={p?.bestseller} />
          <ACheck name="isNew" label="Als Neuheit kennzeichnen" defaultChecked={p?.isNew} />
          <ACheck name="niche" label="Nischenduft" defaultChecked={p?.niche} />
          <ACheck name="exclusive" label="Exklusiv in der Parfümerie Liebe" defaultChecked={p?.exclusive} />
          <ACheck name="isDemo" label="Demo-Datensatz (vor dem Livegang löschen)" defaultChecked={p?.isDemo ?? false} />
        </div>
        {manualCategories.length > 0 && (
          <div className="md:col-span-2">
            <ACheckGroup name="categoryIds" label="Manuelle Kategorien" options={manualCategories.map((c) => ({ value: c.id, label: c.name }))} selected={selectedCategoryIds} />
          </div>
        )}
      </Group>

      <Group title="Suchmaschinen">
        <AField name="seoTitle" label="SEO-Titel" defaultValue={p?.seoTitle} hint="Höchstens 70 Zeichen. Leer: Marke, Name und Konzentration." />
        <AField name="seoDescription" label="SEO-Beschreibung" defaultValue={p?.seoDescription} hint="Höchstens 170 Zeichen." />
      </Group>
    </AdminForm>
  );
}
