import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Finder } from "@/features/finder/finder";
import { getCatalog } from "@/services/catalog";

export const metadata: Metadata = {
  title: "Duftfinder: Welcher Duft passt zu mir?",
  description: "Sechs Fragen zu Duftwelt, Intensität, Anlass und Budget, danach passende Düfte aus dem Sortiment der Parfümerie Liebe.",
  alternates: { canonical: "/duftfinder" },
};

export default async function FinderPage({ searchParams }: { searchParams: Promise<{ fuer?: string }> }) {
  const [catalog, sp] = await Promise.all([getCatalog(), searchParams]);
  return (
    <div className="container-page pt-8 pb-24">
      <Breadcrumbs items={[{ label: "Startseite", href: "/" }, { label: "Duftfinder" }]} />
      <header className="mt-8 mb-12 max-w-3xl">
        <h1 className="font-display text-h1">Welcher Duft passt zu mir?</h1>
        <p className="mt-4 text-body-lg text-ink-soft">Sechs kurze Fragen. Die Empfehlung beruht auf Duftfamilien, Duftnoten und Angaben zu unseren Düften, nicht auf Werbung.</p>
      </header>
      <Finder products={catalog} initialFor={sp.fuer} />
    </div>
  );
}
