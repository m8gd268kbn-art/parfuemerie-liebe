import Link from "next/link";
import { cn } from "@/lib/utils";

/**
 * Typografische Wortmarke „Parfümerie Liebe“ (Platzhalter, solange kein Original-Logo vorliegt).
 * Aufbau wie ein graviertes Flakon-Etikett: breite Versalien über dem Namen in Bodoni.
 */
export function Wordmark({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex flex-col items-start leading-none text-ink", className)} aria-hidden="true">
      <span className="font-sans text-[0.5625rem] font-medium tracking-[0.34em] uppercase [font-variation-settings:'wdth'_125]">
        Parfümerie
      </span>
      <span className={cn("font-display tracking-[-0.01em]", compact ? "mt-0.5 text-[1.5rem]" : "mt-1 text-[1.75rem]")}>
        Liebe
      </span>
    </span>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <Link href="/" className={cn("inline-flex rounded-sm", className)} aria-label="Parfümerie Liebe, zur Startseite">
      <Wordmark compact={compact} />
    </Link>
  );
}
