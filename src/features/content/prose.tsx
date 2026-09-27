import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { breadcrumbJsonLd, JsonLd } from "@/lib/seo";

/** Ruhige Textseite (Service, Rechtliches): 65-75 Zeichen Zeilenlänge, klare Hierarchie. */
export function ProsePage({ title, intro, path, children }: { title: string; intro?: React.ReactNode; path: string; children: React.ReactNode }) {
  const crumbs = [{ label: "Startseite", href: "/" }, { label: title, href: path }];
  return (
    <div className="container-page pt-8 pb-24">
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <Breadcrumbs items={crumbs} />
      <div className="mt-8 max-w-[44rem] md:mt-10">
        <h1 className="font-display text-h1">{title}</h1>
        {intro && <div className="mt-4 text-body-lg text-ink-soft">{intro}</div>}
        <div className="prose-liebe mt-12">{children}</div>
      </div>
    </div>
  );
}

/**
 * Rendert gepflegten Klartext (aus den Einstellungen): Leerzeile = Absatz, „## “ = Zwischenüberschrift,
 * „- “ = Liste. Kein HTML, dadurch kein XSS-Risiko.
 */
export function PlainText({ text }: { text: string }) {
  const blocks = text.replace(/\r\n/g, "\n").split(/\n{2,}/).map((b) => b.trim()).filter(Boolean);
  return (
    <>
      {blocks.map((b, i) => {
        if (b.startsWith("## ")) return <h2 key={i}>{b.slice(3)}</h2>;
        if (b.startsWith("### ")) return <h3 key={i}>{b.slice(4)}</h3>;
        const lines = b.split("\n");
        if (lines.every((l) => l.startsWith("- "))) {
          return (
            <ul key={i}>
              {lines.map((l, j) => (
                <li key={j}>{l.slice(2)}</li>
              ))}
            </ul>
          );
        }
        return (
          <p key={i}>
            {lines.map((l, j) => (
              <span key={j}>
                {l}
                {j < lines.length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </>
  );
}

export function LegalPlaceholder({ title, sections }: { title: string; sections: string[] }) {
  return (
    <>
      <div className="not-prose mb-10 rounded-sm border border-dashed border-line-strong bg-porcelain px-5 py-4 text-small text-ink-soft">
        <p className="label mb-1 text-[0.625rem] text-muted">Platzhalter</p>
        <p>
          Der rechtsverbindliche Text „{title}“ der Parfümerie Liebe liegt noch nicht vor. Er muss vor dem Livegang professionell erstellt oder geprüft und im Admin unter
          „Einstellungen → Rechtstexte“ eingefügt werden. Die folgende Gliederung zeigt nur die üblichen Bestandteile.
        </p>
      </div>
      {sections.map((s) => (
        <section key={s}>
          <h2>{s}</h2>
          <p className="text-muted">Text folgt.</p>
        </section>
      ))}
    </>
  );
}
