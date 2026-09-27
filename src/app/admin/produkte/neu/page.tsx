import { asc } from "drizzle-orm";
import { saveProductAction } from "@/features/admin/product-actions";
import { ProductForm } from "@/features/admin/product-form";
import { AdminPage, Panel } from "@/features/admin/ui";
import { db } from "@/services/db";
import { brands, categories } from "@/services/db/schema";

export const metadata = { title: "Neues Produkt" };

export default async function NewProduct() {
  const [brandRows, cats] = await Promise.all([
    db.select({ id: brands.id, name: brands.name }).from(brands).orderBy(asc(brands.name)),
    db.select({ id: categories.id, name: categories.name, rule: categories.rule }).from(categories).orderBy(asc(categories.sortOrder)),
  ]);
  return (
    <AdminPage title="Neues Produkt" description="Größen, Preise und Bilder pflegen Sie nach dem Anlegen. Ohne aktive Größe erscheint das Produkt nicht im Shop.">
      <Panel>
        <ProductForm action={saveProductAction.bind(null, null)} brands={brandRows} manualCategories={cats.filter((c) => c.rule.manual)} selectedCategoryIds={[]} />
      </Panel>
    </AdminPage>
  );
}
