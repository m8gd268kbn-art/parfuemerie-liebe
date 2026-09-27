import Link from "next/link";
import { FAMILIES, INTENSITY_LABELS } from "@/config/catalog";
import type { ProductDetailDTO } from "@/types/catalog";

/**
 * Duftpyramide als Flüssigkeitsschichten: Kopf hell und flüchtig oben, Basis dicht unten.
 * Die Farbe ist die Flüssigkeit des Dufts; nur vorhandene Daten werden gezeigt.
 */
export function NoteLayers({ product }: { product: ProductDetailDTO }) {
  const color = product.liquidColor ?? "#d8cec3";
  const layers = [
    { title: "Kopfnote", hint: "die ersten Minuten", notes: product.topNotes, alpha: 0.28 },
    { title: "Herznote", hint: "nach etwa einer halben Stunde", notes: product.heartNotes, alpha: 0.52 },
    { title: "Basisnote", hint: "bleibt über Stunden", notes: product.baseNotes, alpha: 0.85 },
  ].filter((l) => l.notes.length > 0);
  if (!layers.length) return null;
  return (
    <div className="overflow-hidden rounded-sm border border-line">
      {layers.map((l) => (
        <div
          key={l.title}
          className="grid grid-cols-1 gap-2 border-b border-white/40 px-5 py-5 last:border-b-0 sm:grid-cols-[10rem_1fr] sm:gap-6 sm:px-6"
          style={{ backgroundColor: `color-mix(in srgb, ${color} ${Math.round(l.alpha * 100)}%, var(--color-white))` }}
        >
          <div>
            <h3 className="text-small font-semibold">{l.title}</h3>
            <p className="text-caption text-ink-soft">{l.hint}</p>
          </div>
          <ul className="flex flex-wrap gap-x-1 gap-y-1">
            {l.notes.map((n, i) => (
              <li key={n}>
                <Link href={`/parfum?note=${encodeURIComponent(n)}`} className="font-display text-[1.25rem] leading-snug hover:underline hover:decoration-1 hover:underline-offset-4">
                  {n}
                  {i < l.notes.length - 1 && <span aria-hidden="true">,</span>}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}

export function Intensity({ value }: { value: number }) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-1" role="img" aria-label={`Intensität: ${INTENSITY_LABELS[value]} (${value} von 5)`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <span key={i} className={`h-[3px] flex-1 ${i <= value ? "bg-ink" : "bg-line"}`} />
        ))}
      </div>
      <div className="flex justify-between text-caption text-muted" aria-hidden="true">
        <span>Leicht</span>
        <span className="text-ink">{INTENSITY_LABELS[value]}</span>
        <span>Intensiv</span>
      </div>
    </div>
  );
}

export function ScentFacts({ product }: { product: ProductDetailDTO }) {
  const families = product.families.map((f) => FAMILIES.find((x) => x.key === f)).filter(Boolean);
  const rows: { label: string; value: React.ReactNode }[] = [];
  if (families.length)
    rows.push({
      label: "Duftfamilie",
      value: families.map((f, i) => (
        <span key={f!.key}>
          <Link href={`/parfum?family=${f!.key}`} className="link-underline">
            {f!.label}
          </Link>
          {i < families.length - 1 ? ", " : ""}
        </span>
      )),
    });
  if (product.character.length) rows.push({ label: "Charakter", value: product.character.join(", ") });
  if (product.occasions.length) rows.push({ label: "Anlass", value: product.occasions.join(", ") });
  if (product.seasons.length) rows.push({ label: "Jahreszeit", value: product.seasons.join(", ") });
  if (!rows.length && product.intensity == null) return null;
  return (
    <div className="flex flex-col gap-8">
      {product.intensity != null && (
        <div>
          <h3 className="mb-3 text-small font-semibold">Intensität</h3>
          <Intensity value={product.intensity} />
        </div>
      )}
      <dl className="grid grid-cols-[7.5rem_1fr] gap-x-4 gap-y-3 text-small">
        {rows.map((r) => (
          <div key={r.label} className="contents">
            <dt className="text-muted">{r.label}</dt>
            <dd className="text-ink">{r.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
