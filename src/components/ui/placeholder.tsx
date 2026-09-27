import { cn } from "@/lib/utils";

/**
 * Klar markierter Platzhalter für fehlende echte Geschäftsdaten der Parfümerie Liebe
 * (Adresse, Telefon, Öffnungszeiten, Fotos, Rechtstexte). Wird im Admin unter „Einstellungen“ gepflegt.
 */
export function Placeholder({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex max-w-full flex-wrap items-baseline gap-x-2 rounded-sm border border-dashed border-line-strong px-2 py-0.5 text-caption text-muted",
        className,
      )}
      title="Platzhalter: echte Angabe folgt (im Admin unter Einstellungen pflegen)"
    >
      <span className="label text-[0.6875rem] tracking-[0.1em]">Platzhalter</span>
      <span>{children}</span>
    </span>
  );
}

/** Bildplatzhalter mit Hinweis, z. B. für Fotos der Parfümerie. */
export function ImagePlaceholder({ label, className }: { label: string; className?: string }) {
  return (
    <div
      className={cn(
        "relative flex items-end overflow-hidden bg-porcelain p-5",
        "bg-[repeating-linear-gradient(135deg,transparent_0_14px,rgb(27_30_31/0.035)_14px_15px)]",
        className,
      )}
      role="img"
      aria-label={`Platzhalter: ${label}`}
    >
      <span className="flex flex-col gap-1">
        <span className="label text-[0.6875rem] text-muted">Platzhalter</span>
        <span className="text-small text-ink-soft">{label}</span>
      </span>
    </div>
  );
}
