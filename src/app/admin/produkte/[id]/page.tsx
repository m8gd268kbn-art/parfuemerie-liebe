import { asc, desc, eq, inArray } from "drizzle-orm";
import Image from "next/image";
import { notFound } from "next/navigation";
import { IMAGE_KINDS } from "@/config/catalog";
import { ACheck, ActionButton, AdminForm, AField, ASelect } from "@/features/admin/kit";
import { deleteImageAction, deleteProductAction, deleteVariantAction, saveProductAction, saveVariantAction, updateImageAction, uploadImageAction } from "@/features/admin/product-actions";
import { ProductForm } from "@/features/admin/product-form";
import { AdminLink, AdminPage, Panel, StatusPill } from "@/features/admin/ui";
import { centsToEuroInput, formatDate, formatPrice } from "@/lib/format";
import { lowestPriceBeforeReduction } from "@/services/catalog";
import { db } from "@/services/db";
import { brands, categories, productCategories, productImages, products, productVariants, variantPriceHistory } from "@/services/db/schema";

export const metadata = { title: "Produkt bearbeiten" };

type Variant = typeof productVariants.$inferSelect;

function VariantFields({ v }: { v?: Variant }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <AField name="sizeMl" label="Inhalt in ml" type="number" inputMode="numeric" required defaultValue={v?.sizeMl} />
      <AField name="displaySize" label="Anzeige" defaultValue={v?.displaySize} placeholder="z. B. 3 × 10 ml" />
      <AField name="sku" label="Artikelnummer" required defaultValue={v?.sku} />
      <AField name="ean" label="EAN" defaultValue={v?.ean} inputMode="numeric" />
      <AField name="price" label="Preis in €" required defaultValue={centsToEuroInput(v?.priceCents)} inputMode="decimal" placeholder="129,00" />
      <AField name="compareAtPrice" label="Vergleichspreis in €" defaultValue={centsToEuroInput(v?.compareAtPriceCents)} inputMode="decimal" hint="Nur bei echter Reduzierung (§ 11 PAngV)." />
      <AField name="stock" label="Bestand" type="number" inputMode="numeric" required defaultValue={v?.stock ?? 0} />
      <AField name="weightGrams" label="Versandgewicht in g" type="number" inputMode="numeric" defaultValue={v?.weightGrams} />
      <AField name="sortOrder" label="Reihenfolge" type="number" inputMode="numeric" defaultValue={v?.sortOrder ?? 0} />
      <div className="flex items-end pb-2.5">
        <ACheck name="active" label="Aktiv" defaultChecked={v?.active ?? true} />
      </div>
    </div>
  );
}

export default async function EditProduct({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ neu?: string }> }) {
  const { id } = await params;
  const { neu } = await searchParams;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const [product] = await db.select().from(products).where(eq(products.id, id)).limit(1);
  if (!product) notFound();

  const [brandRows, cats, linked, variants, images] = await Promise.all([
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ id: categories.id, name: categories.name, rule: categories.rule }).from(categories).orderBy(asc(categories.sortOrder)),
    db.select({ id: productCategories.categoryId }).from(productCategories).where(eq(productCategories.productId, id)),
    db.select().from(productVariants).where(eq(productVariants.productId, id)).orderBy(asc(productVariants.sortOrder), asc(productVariants.sizeMl)),
    db.select().from(productImages).where(eq(productImages.productId, id)).orderBy(asc(productImages.sortOrder), asc(productImages.createdAt)),
  ]);
  const history = variants.length
    ? await db.select().from(variantPriceHistory).where(inArray(variantPriceHistory.variantId, variants.map((v) => v.id))).orderBy(desc(variantPriceHistory.changedAt))
    : [];
  const brandName = brandRows.find((b) => b.id === product.brandId)?.name ?? "";
  const variantOptions = [{ value: "", label: "Alle Größen" }, ...variants.map((v) => ({ value: v.id, label: v.displaySize ?? `${v.sizeMl} ml` }))];
  const kindOptions = IMAGE_KINDS.map((k) => ({ value: k.key, label: k.label }));

  return (
    <AdminPage
      title={`${brandName} ${product.name}`}
      description={
        <>
          {neu ? "Produkt angelegt. Ergänzen Sie jetzt Größen, Preise und Bilder. " : null}
          {product.active && variants.some((v) => v.active) ? (
            <AdminLink href={`/produkt/${product.slug}`}>Im Shop ansehen</AdminLink>
          ) : (
            "Im Shop erst sichtbar, wenn das Produkt aktiv ist und mindestens eine aktive Größe hat."
          )}
        </>
      }
      actions={<AdminLink href="/admin/produkte">Zur Übersicht</AdminLink>}
    >
      <Panel title="Größen, Preise und Bestand">
        <div className="flex flex-col gap-8">
          {variants.length === 0 && <p className="text-small text-muted">Noch keine Größe angelegt.</p>}
          {variants.map((v) => {
            const rows = history.filter((h) => h.variantId === v.id);
            const lowest = v.compareAtPriceCents ? lowestPriceBeforeReduction(rows, v.priceCents) : null;
            return (
              <div key={v.id} className="border-b border-line pb-8">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <h3 className="text-small font-semibold">{v.displaySize ?? `${v.sizeMl} ml`}</h3>
                  {!v.active && <StatusPill tone="neutral">inaktiv</StatusPill>}
                  {v.stock <= 0 ? <StatusPill tone="danger">ausverkauft</StatusPill> : v.stock <= 3 ? <StatusPill tone="warning">wenig Bestand</StatusPill> : null}
                  <span className="text-caption text-muted">
                    Preisverlauf: {rows.slice(0, 3).map((h) => `${formatPrice(h.priceCents)} ab ${formatDate(h.changedAt)}`).join(", ") || "keine Einträge"}
                    {lowest != null && `. Niedrigster Preis 30 Tage vor Reduzierung: ${formatPrice(lowest)}`}
                  </span>
                </div>
                <AdminForm
                  key={`${v.id}-${v.updatedAt.getTime()}`}
                  action={saveVariantAction.bind(null, id, v.id)}
                  footer={<ActionButton action={deleteVariantAction.bind(null, id, v.id)} label="Größe löschen" variant="ghost" confirm="Diese Größe wirklich löschen?" />}
                >
                  <VariantFields v={v} />
                </AdminForm>
              </div>
            );
          })}
          <div>
            <h3 className="mb-4 text-small font-semibold">Neue Größe</h3>
            <AdminForm key={`new-${variants.length}`} action={saveVariantAction.bind(null, id, null)} submitLabel="Größe hinzufügen">
              <VariantFields />
            </AdminForm>
          </div>
        </div>
      </Panel>

      <Panel title="Bilder">
        <div className="flex flex-col gap-8">
          {images.length === 0 && <p className="text-small text-muted">Noch keine Bilder. Ohne Bild zeigt der Shop einen neutralen Platzhalter.</p>}
          {images.length > 0 && (
            <ul className="grid gap-6 lg:grid-cols-2">
              {images.map((img) => (
                <li key={img.id} className="grid grid-cols-[6rem_1fr] gap-4">
                  <Image src={img.url} alt={img.alt} width={96} height={120} className="h-30 w-24 bg-porcelain object-cover" />
                  <AdminForm
                    key={`${img.id}-${img.alt}-${img.kind}-${img.sortOrder}`}
                    action={updateImageAction.bind(null, id, img.id)}
                    className="gap-3"
                    footer={<ActionButton action={deleteImageAction.bind(null, id, img.id)} label="Entfernen" variant="ghost" confirm="Bild entfernen?" />}
                  >
                    <AField name="alt" label="Alternativtext" required defaultValue={img.alt} />
                    <div className="grid grid-cols-3 gap-3">
                      <ASelect name="kind" label="Ansicht" defaultValue={img.kind} options={kindOptions} />
                      <ASelect name="variantId" label="Größe" defaultValue={img.variantId ?? ""} options={variantOptions} />
                      <AField name="sortOrder" label="Position" type="number" defaultValue={img.sortOrder} required />
                    </div>
                  </AdminForm>
                </li>
              ))}
            </ul>
          )}
          <div className="border-t border-line pt-6">
            <h3 className="mb-4 text-small font-semibold">Bild hochladen</h3>
            <AdminForm key={`upload-${images.length}`} action={uploadImageAction.bind(null, id)} submitLabel="Hochladen">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex flex-col gap-1.5">
                  <label htmlFor="image-file" className="text-caption font-medium">Datei</label>
                  <input id="image-file" name="file" type="file" required accept="image/jpeg,image/png,image/webp,image/avif" className="text-small file:mr-3 file:h-9 file:cursor-pointer file:rounded-sm file:border file:border-line-strong file:bg-white file:px-3 file:text-small" />
                  <p className="text-[0.75rem] text-muted">JPG, PNG, WebP oder AVIF, höchstens 5 MB. Empfohlen: Hochformat 4:5, mindestens 1600 px hoch.</p>
                </div>
                <AField name="alt" label="Alternativtext" required placeholder={`${brandName} ${product.name}, Flakon von vorne`} />
                <ASelect name="kind" label="Ansicht" defaultValue="front" options={kindOptions} />
                <ASelect name="variantId" label="Größe" defaultValue="" options={variantOptions} />
                <AField name="sortOrder" label="Position" type="number" required defaultValue={images.length} />
              </div>
            </AdminForm>
          </div>
        </div>
      </Panel>

      <Panel title="Stammdaten">
        <ProductForm
          key={product.updatedAt.getTime()}
          action={saveProductAction.bind(null, id)}
          product={product}
          brands={brandRows}
          manualCategories={cats.filter((c) => c.rule.manual)}
          selectedCategoryIds={linked.map((l) => l.id)}
        />
      </Panel>

      <Panel title="Produkt löschen">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="max-w-xl text-small text-ink-soft">Löschen ist nur möglich, solange das Produkt in keiner Bestellung vorkommt. Andernfalls deaktivieren Sie es in den Stammdaten.</p>
          <ActionButton action={deleteProductAction.bind(null, id)} label="Produkt löschen" confirm="Produkt mit allen Größen und Bildern endgültig löschen?" />
        </div>
      </Panel>
    </AdminPage>
  );
}
