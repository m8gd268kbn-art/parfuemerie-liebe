import type { Icon as PhosphorIcon } from "@phosphor-icons/react";

/**
 * Einheitliche Icons: Phosphor, Gewicht „light“, 20 px. Dekorativ (aria-hidden), die Bedeutung
 * trägt immer ein sichtbares oder verstecktes Label am Bedienelement.
 */
export function Icon({ icon: Glyph, size = 20, className, weight = "light" }: { icon: PhosphorIcon; size?: number; className?: string; weight?: "light" | "regular" | "fill" }) {
  return <Glyph size={size} weight={weight} className={className} aria-hidden="true" focusable="false" />;
}
