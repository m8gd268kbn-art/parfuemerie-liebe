"use client";

import { ArrowLeft } from "@phosphor-icons/react/dist/ssr";
import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { FAMILIES, INTENSITY_LABELS, OCCASIONS, SEASONS } from "@/config/catalog";
import { ProductCard } from "@/features/catalog/product-card";
import { scoreProducts, type FinderAnswers } from "@/lib/finder/score";
import { cn } from "@/lib/utils";
import type { ProductCardDTO } from "@/types/catalog";

type Option = { value: string; label: string; hint?: string; swatch?: string };

const QUESTIONS: { key: keyof FinderAnswers; title: string; multi?: boolean; options: Option[] }[] = [
  { key: "for", title: "Für wen suchen Sie einen Duft?", options: [{ value: "women", label: "Für sie" }, { value: "men", label: "Für ihn" }, { value: "unisex", label: "Für alle (Unisex)" }, { value: "gift", label: "Als Geschenk, offen" }] },
  { key: "families", title: "Welche Duftwelt spricht Sie an?", multi: true, options: FAMILIES.filter((f) => f.key !== "leather").map((f) => ({ value: f.key, label: f.world, hint: f.description, swatch: f.liquid })) },
  { key: "intensity", title: "Wie intensiv darf er sein?", options: [1, 2, 3, 4, 5].map((n) => ({ value: String(n), label: INTENSITY_LABELS[n] })) },
  { key: "occasion", title: "Für welchen Anlass?", options: [...OCCASIONS.map((o) => ({ value: o, label: o })), { value: "", label: "Egal" }] },
  { key: "season", title: "Für welche Jahreszeit?", options: [...SEASONS.map((s) => ({ value: s, label: s })), { value: "", label: "Ganzjährig" }] },
  { key: "budget", title: "Welcher Preisrahmen?", options: [{ value: "bis-80", label: "Bis 80 €" }, { value: "80-150", label: "80 bis 150 €" }, { value: "150-250", label: "150 bis 250 €" }, { value: "ab-250", label: "Ab 250 €" }, { value: "egal", label: "Egal" }] },
];

const EMPTY: FinderAnswers = { for: null, families: [], intensity: null, occasion: null, season: null, budget: null };

/** Duftfinder: eine Frage pro Ansicht, Ergebnis datengetrieben aus dem Katalog. */
export function Finder({ products, initialFor }: { products: ProductCardDTO[]; initialFor?: string }) {
  const valid = ["women", "men", "unisex", "gift"].includes(initialFor ?? "");
  const [answers, setAnswers] = useState<FinderAnswers>({ ...EMPTY, for: valid ? (initialFor as FinderAnswers["for"]) : null });
  const [step, setStep] = useState(valid ? 1 : 0);
  const done = step >= QUESTIONS.length;
  const results = useMemo(() => (done ? scoreProducts(products, answers).slice(0, 6) : []), [done, products, answers]);
  const q = QUESTIONS[Math.min(step, QUESTIONS.length - 1)];

  const choose = (value: string) => {
    if (q.key === "families") {
      setAnswers((a) => ({ ...a, families: a.families.includes(value) ? a.families.filter((f) => f !== value) : [...a.families, value] }));
      return;
    }
    const v = q.key === "intensity" ? Number(value) : value || null;
    setAnswers((a) => ({ ...a, [q.key]: v }));
    setStep((s) => s + 1);
  };

  if (done) {
    return (
      <section aria-labelledby="results-title" aria-live="polite">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 id="results-title" className="font-display text-h2">
              {results.length ? "Diese Düfte passen zu Ihren Antworten" : "Keine passenden Düfte gefunden"}
            </h2>
            <p className="mt-2 text-body text-ink-soft">
              {results.length
                ? "Sortiert nach Übereinstimmung. Am besten testen Sie Ihre Favoriten als Duftprobe oder in der Parfümerie."
                : "Lockern Sie Preisrahmen oder Duftwelt, oder lassen Sie sich persönlich beraten."}
            </p>
          </div>
          <Button
            variant="secondary"
            onClick={() => {
              setAnswers(EMPTY);
              setStep(0);
            }}
          >
            Neu starten
          </Button>
        </div>
        {results.length > 0 ? (
          <ul className="grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6">
            {results.map((r) => (
              <li key={r.product.id} className="flex flex-col gap-3">
                <ProductCard product={r.product} headingLevel="h3" />
                {r.reasons.length > 0 && <p className="text-caption font-medium text-ink-soft">{r.reasons.slice(0, 3).join(", ")}</p>}
              </li>
            ))}
          </ul>
        ) : (
          <ButtonLink href="/parfuemerie#beratung">Beratung in der Parfümerie</ButtonLink>
        )}
      </section>
    );
  }

  const selected = (value: string) => {
    const v = answers[q.key];
    return Array.isArray(v) ? v.includes(value) : v !== null && String(v) === value;
  };

  return (
    <section aria-labelledby="q-title" className="max-w-3xl">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex flex-1 gap-1" aria-hidden="true">
          {QUESTIONS.map((_, i) => (
            <span key={i} className={cn("h-[3px] flex-1 transition-colors duration-300", i <= step ? "bg-ink" : "bg-line")} />
          ))}
        </div>
        <p className="numeric text-caption text-muted">
          Frage {step + 1} von {QUESTIONS.length}
        </p>
      </div>
      <h2 id="q-title" className="font-display text-h2">
        {q.title}
      </h2>
      {q.multi && <p className="mt-2 text-small text-ink-soft">Mehrfachauswahl möglich.</p>}
      <div className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3" role="group" aria-labelledby="q-title">
        {q.options.map((o) => (
          <button
            key={o.value || "any"}
            type="button"
            aria-pressed={selected(o.value)}
            onClick={() => choose(o.value)}
            className={cn(
              "flex min-h-16 items-center gap-3 rounded-sm border bg-white px-4 py-3 text-left text-body transition-[border-color,box-shadow] duration-150 press",
              selected(o.value) ? "border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-line hover:border-line-strong",
            )}
          >
            {o.swatch && <span aria-hidden="true" className="size-6 shrink-0 rounded-full border border-line" style={{ background: o.swatch }} />}
            <span>
              <span className="block">{o.label}</span>
              {o.hint && <span className="block text-caption text-ink-soft">{o.hint}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="mt-8 flex items-center gap-6">
        {step > 0 && (
          <button type="button" onClick={() => setStep((s) => s - 1)} className="inline-flex items-center gap-2 text-small text-ink-soft link-underline">
            <Icon icon={ArrowLeft} size={14} /> Zurück
          </button>
        )}
        {q.multi && <Button onClick={() => setStep((s) => s + 1)}>{answers.families.length ? "Weiter" : "Überspringen"}</Button>}
      </div>
    </section>
  );
}
