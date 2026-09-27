import { Stars } from "@/components/ui/stars";
import { formatLongDate } from "@/lib/format";
import type { ReviewDTO } from "@/types/catalog";
import { ReviewForm } from "./review-form";

/** Nur echte, moderierte Bewertungen. Ohne Bewertungen: ehrlicher leerer Zustand. */
export function Reviews({ productId, productName, reviews, avg }: { productId: string; productName: string; reviews: ReviewDTO[]; avg: number | null }) {
  return (
    <section aria-labelledby="reviews-title" id="bewertungen" className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-4">
        <h2 id="reviews-title" className="font-display text-h2">
          Bewertungen
        </h2>
        {reviews.length > 0 && avg != null ? (
          <div className="mt-5 flex items-center gap-4">
            <p className="numeric font-display text-[3rem] leading-none">{avg.toFixed(1).replace(".", ",")}</p>
            <div>
              <Stars value={avg} />
              <p className="mt-1 text-caption text-muted">
                {reviews.length} {reviews.length === 1 ? "Bewertung" : "Bewertungen"}
              </p>
            </div>
          </div>
        ) : (
          <p className="mt-4 max-w-sm text-body text-ink-soft">Zu {productName} gibt es noch keine Bewertungen. Teilen Sie als Erste oder Erster Ihren Eindruck.</p>
        )}
        <div className="mt-8">
          <ReviewForm productId={productId} />
        </div>
      </div>
      {reviews.length > 0 && (
        <ul className="flex flex-col divide-y divide-line border-y border-line lg:col-span-7 lg:col-start-6">
          {reviews.map((r) => (
            <li key={r.id} className="py-7">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <Stars value={r.rating} />
                <p className="text-caption text-muted">
                  {r.authorName}, {formatLongDate(r.createdAt)}
                  {r.verifiedPurchase && <span className="ml-2 text-accent">Verifizierter Kauf</span>}
                </p>
              </div>
              {r.title && <h3 className="mt-3 text-body font-semibold">{r.title}</h3>}
              <p className="mt-2 max-w-[65ch] text-body text-ink-soft">{r.body}</p>
              {(r.longevity || r.sillage || r.value) && (
                <dl className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-caption text-muted">
                  {r.longevity && (
                    <div className="flex gap-1.5">
                      <dt>Haltbarkeit</dt>
                      <dd className="numeric text-ink">{r.longevity}/5</dd>
                    </div>
                  )}
                  {r.sillage && (
                    <div className="flex gap-1.5">
                      <dt>Sillage</dt>
                      <dd className="numeric text-ink">{r.sillage}/5</dd>
                    </div>
                  )}
                  {r.value && (
                    <div className="flex gap-1.5">
                      <dt>Preis-Leistung</dt>
                      <dd className="numeric text-ink">{r.value}/5</dd>
                    </div>
                  )}
                </dl>
              )}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
