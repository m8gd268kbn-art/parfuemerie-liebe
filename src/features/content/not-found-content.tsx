import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";
import { SearchLauncher } from "./search-launcher";

export function NotFoundContent() {
  return (
    <div className="container-page grid grid-cols-1 gap-12 py-16 md:grid-cols-12 md:gap-6 md:py-24">
      <div className="flex flex-col justify-center gap-6 md:col-span-6">
        <p className="numeric text-small text-muted">Fehler 404</p>
        <h1 className="font-display text-display">Dieser Flakon ist leer.</h1>
        <p className="max-w-md text-body-lg text-ink-soft">Die Seite gibt es nicht oder nicht mehr. Vielleicht finden Sie über die Suche, was Sie gesucht haben.</p>
        <div className="flex flex-wrap gap-3 pt-2">
          <ButtonLink href="/">Zur Startseite</ButtonLink>
          <ButtonLink href="/parfum" variant="secondary">Düfte entdecken</ButtonLink>
          <SearchLauncher />
        </div>
      </div>
      <div className="relative aspect-[4/5] overflow-hidden bg-porcelain md:col-span-5 md:col-start-8">
        <Image src="/media/worlds/fresh.webp" alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
      </div>
    </div>
  );
}
