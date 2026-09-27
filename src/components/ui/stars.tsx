import { cn } from "@/lib/utils";

/** Bewertungssterne (nur Anzeige echter, freigegebener Bewertungen). */
export function Stars({ value, size = 14, className, label }: { value: number; size?: number; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / 5) * 100));
  return (
    <span
      className={cn("relative inline-flex", className)}
      role="img"
      aria-label={label ?? `${value.toFixed(1).replace(".", ",")} von 5 Sternen`}
    >
      <StarRow size={size} className="text-line-strong/60" />
      <span className="absolute inset-0 overflow-hidden" style={{ width: `${pct}%` }}>
        <StarRow size={size} className="text-ink" />
      </span>
    </span>
  );
}

function StarRow({ size, className }: { size: number; className?: string }) {
  return (
    <span className={cn("flex gap-0.5", className)} aria-hidden="true">
      {Array.from({ length: 5 }, (_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1.2l1.95 4.24 4.63.5-3.46 3.13.96 4.56L8 11.3l-4.08 2.33.96-4.56L1.42 5.94l4.63-.5z" />
        </svg>
      ))}
    </span>
  );
}
