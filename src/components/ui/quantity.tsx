"use client";

import { Minus, Plus } from "@phosphor-icons/react/dist/ssr";
import { cn } from "@/lib/utils";
import { Icon } from "./icon";

export function QuantityStepper({
  value,
  max,
  onChange,
  disabled,
  label,
  size = "md",
}: {
  value: number;
  max: number;
  onChange: (next: number) => void;
  disabled?: boolean;
  label: string;
  size?: "sm" | "md";
}) {
  const h = size === "sm" ? "h-9" : "h-11";
  const w = size === "sm" ? "w-9" : "w-11";
  return (
    <div role="group" aria-label={label} className={cn("inline-flex items-center rounded-sm border border-line-strong bg-white", h)}>
      <button
        type="button"
        onClick={() => onChange(value - 1)}
        disabled={disabled}
        aria-label={value <= 1 ? "Entfernen" : "Menge verringern"}
        className={cn("inline-flex h-full items-center justify-center text-ink transition-colors hover:bg-porcelain disabled:text-muted press", w)}
      >
        <Icon icon={Minus} size={14} />
      </button>
      <output aria-live="polite" className="numeric min-w-7 text-center text-small font-medium">
        {value}
      </output>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        disabled={disabled || value >= max}
        aria-label="Menge erhöhen"
        className={cn("inline-flex h-full items-center justify-center text-ink transition-colors hover:bg-porcelain disabled:text-muted press", w)}
      >
        <Icon icon={Plus} size={14} />
      </button>
    </div>
  );
}
