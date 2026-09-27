import Link from "next/link";
import { cn } from "@/lib/utils";

/** Seitenverhältnis des Schriftzugs (public/media/brand/liebe-logo.svg, vektorisiert aus der Logo-Datei). */
const LOGO_RATIO = 1266 / 524;

/**
 * Wortmarke der Parfümerie Liebe: der rote Liebe-Schriftzug, darunter „Parfümerie“ in breiten
 * Versalien wie auf der Blende über dem Eingang in der Karmarschstraße.
 */
export function Wordmark({ className, compact, size }: { className?: string; compact?: boolean; size?: "md" | "lg" }) {
  const height = size === "lg" ? 52 : compact ? 32 : 40;
  return (
    <span className={cn("inline-flex flex-col items-center leading-none", className)} aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element -- statisches SVG, keine Optimierung nötig */}
      <img src="/media/brand/liebe-logo.svg" alt="" width={Math.round(height * LOGO_RATIO)} height={height} style={{ height, width: "auto" }} />
      <span
        className={cn(
          "font-sans font-medium tracking-[0.34em] text-ink uppercase [font-variation-settings:'wdth'_125]",
          size === "lg" ? "mt-2 pl-[0.34em] text-[0.6875rem]" : "mt-1 pl-[0.34em] text-[0.5625rem]",
        )}
      >
        Parfümerie
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
