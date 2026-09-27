import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { ActionButton } from "@/features/admin/kit";
import { deleteReviewAction, moderateReviewAction } from "@/features/admin/marketing-actions";
import { AdminLink, AdminPage, StatusPill } from "@/features/admin/ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { db } from "@/services/db";
import { brands, products, reviews } from "@/services/db/schema";

export const metadata = { title: "Bewertungen" };

const TABS = [
  { key: "pending", label: "Warten auf Freigabe" },
  { key: "approved", label: "Veröffentlicht" },
  { key: "rejected", label: "Abgelehnt" },
] as const;

export default async function AdminReviews({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const sp = await searchParams;
  const status = TABS.find((t) => t.key === sp.status)?.key ?? "pending";
  const rows = await db
    .select({ review: reviews, product: products.name, productId: products.id, slug: products.slug, brand: brands.name })
    .from(reviews)
    .innerJoin(products, eq(products.id, reviews.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(eq(reviews.status, status))
    .orderBy(desc(reviews.createdAt))
    .limit(200);
  return (
    <AdminPage title="Bewertungen" description="Nur echte Bewertungen veröffentlichen. Inhalte nicht verändern; bei Rechtsverstößen oder ohne Produktbezug ablehnen.">
      <nav aria-label="Status" className="flex flex-wrap gap-1">
        {TABS.map((t) => (
          <Link key={t.key} href={`/admin/bewertungen?status=${t.key}`} className={cn("rounded-sm px-3 py-1.5 text-caption", status === t.key ? "bg-ink text-paper" : "text-ink-soft hover:bg-porcelain")}>
            {t.label}
          </Link>
        ))}
      </nav>
      {rows.length === 0 ? (
        <p className="text-small text-muted">Keine Bewertungen in dieser Ansicht.</p>
      ) : (
        <ul className="flex flex-col gap-4">
          {rows.map(({ review: r, product, productId, slug, brand }) => (
            <li key={r.id} className="rounded-sm border border-line bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-caption text-muted">
                    <AdminLink href={`/admin/produkte/${productId}`}>{brand} {product}</AdminLink> · {formatDateTime(r.createdAt)}
                  </p>
                  <p className="mt-1 text-small">
                    <span className="tabular font-semibold">{r.rating} von 5</span>
                    {r.title && <span className="ml-2 font-medium">{r.title}</span>}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  {r.verifiedPurchase && <StatusPill tone="accent">verifizierter Kauf</StatusPill>}
                  {status !== "approved" && <ActionButton action={moderateReviewAction.bind(null, r.id, "approved")} label="Veröffentlichen" variant="primary" />}
                  {status !== "rejected" && <ActionButton action={moderateReviewAction.bind(null, r.id, "rejected")} label="Ablehnen" />}
                  <ActionButton action={deleteReviewAction.bind(null, r.id)} label="Löschen" variant="ghost" confirm="Bewertung endgültig löschen?" />
                </div>
              </div>
              <p className="mt-3 max-w-3xl text-small leading-relaxed whitespace-pre-line text-ink-soft">{r.body}</p>
              <p className="mt-3 text-caption text-muted">
                {r.authorName}
                {[r.longevity && `Haltbarkeit ${r.longevity}/5`, r.sillage && `Sillage ${r.sillage}/5`, r.value && `Preis-Leistung ${r.value}/5`].filter(Boolean).map((x) => ` · ${x}`)}
                {status === "approved" && <> · <AdminLink href={`/produkt/${slug}#bewertungen`}>im Shop</AdminLink></>}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AdminPage>
  );
}
