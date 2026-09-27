import { formatPrice, formatUnitPrice } from "@/lib/format";
import { cn } from "@/lib/utils";

type PriceProps = {
  cents: number;
  compareAtCents?: number | null;
  from?: boolean;
  size?: "md" | "lg";
  unit?: { sizeMl: number } | null;
  lowest30dCents?: number | null;
  className?: string;
};

/** Preisangabe in deutschem Format; Reduzierungen mit Streichpreis und § 11 PAngV-Hinweis. */
export function Price({ cents, compareAtCents, from, size = "md", unit, lowest30dCents, className }: PriceProps) {
  const onSale = compareAtCents != null && compareAtCents > cents;
  const unitPrice = unit ? formatUnitPrice(cents, unit.sizeMl) : null;
  return (
    <div className={cn("flex flex-col gap-1", className)}>
      <p className={cn("numeric flex flex-wrap items-baseline gap-x-2", size === "lg" ? "text-price-lg" : "text-price")}>
        {from && <span className="text-small font-normal text-ink-soft">ab</span>}
        <span className="font-medium text-ink">{formatPrice(cents)}</span>
        {onSale && (
          <span className={cn("text-muted line-through decoration-1", size === "lg" ? "text-body" : "text-small")}>
            <span className="sr-only">statt </span>
            {formatPrice(compareAtCents!)}
          </span>
        )}
      </p>
      {(unitPrice || (onSale && lowest30dCents != null)) && (
        <p className="numeric text-caption text-muted">
          {unitPrice}
          {onSale && lowest30dCents != null && (
            <span className="block">Niedrigster Preis der letzten 30 Tage: {formatPrice(lowest30dCents)}</span>
          )}
        </p>
      )}
    </div>
  );
}
