import { cn } from "@/lib/utils";

type Tone = "neutral" | "accent" | "sale" | "muted";

/** Sehr zurückhaltendes Etikett: breite Versalien, Haarlinie, keine Füllfarbe außer Akzent. */
export function Badge({ children, tone = "neutral", className }: { children: React.ReactNode; tone?: Tone; className?: string }) {
  return (
    <span
      className={cn(
        "label inline-flex h-6 items-center rounded-sm px-2 text-[0.6875rem] tracking-[0.09em]",
        tone === "neutral" && "bg-white/85 text-ink",
        tone === "accent" && "bg-accent text-white",
        tone === "sale" && "bg-ink text-paper",
        tone === "muted" && "border border-line text-muted",
        className,
      )}
    >
      {children}
    </span>
  );
}
