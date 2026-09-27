"use client";

import Link from "next/link";
import { useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const OPTIONS = [
  { key: "women", label: "Für sie" },
  { key: "men", label: "Für ihn" },
  { key: "unisex", label: "Für alle" },
  { key: "gift", label: "Als Geschenk" },
];

/** Einstieg in den Duftfinder: die erste Frage direkt auf der Startseite. */
export function FinderTeaser() {
  const [choice, setChoice] = useState<string | null>(null);
  return (
    <section aria-labelledby="finder-title" className="container-page section-space">
      <div className="grid gap-10 border-y border-line py-14 md:grid-cols-12 md:gap-6 md:py-20">
        <div className="md:col-span-5">
          <h2 id="finder-title" className="font-display text-h1">
            Welcher Duft passt zu mir?
          </h2>
          <p className="mt-4 max-w-md text-body-lg text-ink-soft">
            Sechs kurze Fragen zu Duftwelt, Intensität, Anlass und Budget. Danach zeigen wir passende Düfte aus unserem Sortiment.
          </p>
        </div>
        <fieldset className="flex flex-col gap-5 md:col-span-6 md:col-start-7">
          <legend className="mb-5 text-small font-medium">Für wen suchen Sie einen Duft?</legend>
          <div className="grid grid-cols-2 gap-2">
            {OPTIONS.map((o) => (
              <label
                key={o.key}
                className={cn(
                  "flex h-16 cursor-pointer items-center justify-center rounded-sm border text-body transition-[border-color,background-color,color] duration-150 press",
                  choice === o.key ? "border-accent bg-accent text-white" : "border-line-strong hover:border-ink",
                )}
              >
                <input type="radio" name="finder-for" value={o.key} className="sr-only" checked={choice === o.key} onChange={() => setChoice(o.key)} />
                {o.label}
              </label>
            ))}
          </div>
          <div className="flex items-center gap-6 pt-2">
            <ButtonLink href={choice ? `/duftfinder?fuer=${choice}` : "/duftfinder"} size="lg">
              Weiter zum Duftfinder
            </ButtonLink>
            <Link href="/parfuemerie#beratung" className="text-small text-ink-soft link-underline">
              Lieber persönlich beraten lassen
            </Link>
          </div>
        </fieldset>
      </div>
    </section>
  );
}
