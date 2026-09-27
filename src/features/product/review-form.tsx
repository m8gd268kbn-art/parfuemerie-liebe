"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { useShop } from "@/features/shop/shop-provider";
import { cn } from "@/lib/utils";
import { submitReviewAction } from "./actions";

function RatingInput({ name, label, value, onChange, required }: { name: string; label: string; value: number; onChange: (v: number) => void; required?: boolean }) {
  return (
    <fieldset>
      <legend className="mb-2 text-small font-medium">
        {label}
        {!required && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
      </legend>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className="cursor-pointer">
            <input type="radio" name={name} value={n} checked={value === n} onChange={() => onChange(n)} className="peer sr-only" required={required} />
            <span
              className={cn(
                "numeric inline-flex size-10 items-center justify-center rounded-sm border text-small transition-colors peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent",
                n <= value ? "border-ink bg-ink text-paper" : "border-line-strong hover:border-ink",
              )}
            >
              {n}
            </span>
          </label>
        ))}
      </div>
    </fieldset>
  );
}

export function ReviewForm({ productId }: { productId: string }) {
  const { user, ready } = useShop();
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [longevity, setLongevity] = useState(0);
  const [sillage, setSillage] = useState(0);
  const [value, setValue] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (!ready) return null;
  if (!user) {
    return (
      <p className="text-small text-ink-soft">
        <Link href="/anmelden" className="text-ink link-underline">
          Melden Sie sich an
        </Link>
        , um eine Bewertung zu schreiben.
      </p>
    );
  }
  if (done) return <p className="text-small text-accent" role="status">{done}</p>;
  if (!open) {
    return (
      <Button variant="secondary" onClick={() => setOpen(true)}>
        Bewertung schreiben
      </Button>
    );
  }

  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const result = await submitReviewAction({
            productId,
            rating,
            longevity: longevity || null,
            sillage: sillage || null,
            value: value || null,
            title: String(fd.get("title") ?? ""),
            body: String(fd.get("body") ?? ""),
          });
          if (result.ok) setDone(result.message ?? "Danke für Ihre Bewertung.");
          else setErrors({ form: result.error, ...(result.fieldErrors ?? {}) });
        });
      }}
    >
      <RatingInput name="rating" label="Ihre Bewertung" value={rating} onChange={setRating} required />
      <Field label="Überschrift" optional error={errors.title}>
        {({ id, describedBy, invalid }) => <Input id={id} name="title" maxLength={120} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Ihr Eindruck" error={errors.body} hint="Mindestens 20 Zeichen. Bitte keine persönlichen Daten.">
        {({ id, describedBy, invalid }) => <Textarea id={id} name="body" required minLength={20} maxLength={2000} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-1">
        <RatingInput name="longevity" label="Haltbarkeit" value={longevity} onChange={setLongevity} />
        <RatingInput name="sillage" label="Sillage" value={sillage} onChange={setSillage} />
        <RatingInput name="value" label="Preis-Leistung" value={value} onChange={setValue} />
      </div>
      {errors.form && <p role="alert" className="text-small text-danger">{errors.form}</p>}
      <p className="text-caption text-muted">Bewertungen werden vor der Veröffentlichung geprüft.</p>
      <Button type="submit" loading={pending} disabled={rating === 0}>
        Bewertung senden
      </Button>
    </form>
  );
}
