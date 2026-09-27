/** Hinweis im Entwicklungs-/Demo-Modus: Produkte, Preise und Bilder sind Beispieldaten. */
export function DemoBanner() {
  if (process.env.NEXT_PUBLIC_DEMO_MODE !== "true") return null;
  return (
    <div className="bg-ink text-center text-[0.75rem] text-white/85">
      <p className="container-page py-1.5">
        Vorschau mit Demo-Daten: Sortiment, Preise und Produktbilder sind Beispiele und keine Angebote der Parfümerie Liebe.
      </p>
    </div>
  );
}
