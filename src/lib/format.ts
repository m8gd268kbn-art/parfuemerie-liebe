const priceFormatter = new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" });
const dateFormatter = new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" });
const dateTimeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});
const longDateFormatter = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long", year: "numeric" });

/** 12900 → „129,00 €“ (deutsches Format, geschütztes Leerzeichen vor dem Euro-Zeichen). */
export function formatPrice(cents: number): string {
  return priceFormatter.format(cents / 100);
}

/** Grundpreis nach PAngV: Preis je 100 ml. */
export function formatUnitPrice(priceCents: number, sizeMl: number): string | null {
  if (!sizeMl || sizeMl <= 0) return null;
  const per100 = Math.round((priceCents / sizeMl) * 100);
  return `${formatPrice(per100)} / 100 ml`;
}

export function formatSize(sizeMl: number, displaySize?: string | null): string {
  return displaySize?.trim() || `${sizeMl} ml`;
}

export function formatDate(value: Date | string): string {
  return dateFormatter.format(new Date(value));
}

export function formatDateTime(value: Date | string): string {
  return dateTimeFormatter.format(new Date(value));
}

export function formatLongDate(value: Date | string): string {
  return longDateFormatter.format(new Date(value));
}

/** „-20 %“ für Rabatt-Kennzeichnung. */
export function formatPercentOff(priceCents: number, compareAtCents: number): string {
  const pct = Math.round((1 - priceCents / compareAtCents) * 100);
  return `-${pct} %`;
}

/** Euro-Eingabe („49,90“ oder „49.90“) in Cent. Gibt null bei ungültiger Eingabe zurück. */
export function parseEuroToCents(input: string): number | null {
  const normalized = input.trim().replace(/\s|€/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) return null;
  return Math.round(Number(normalized) * 100);
}

export function centsToEuroInput(cents: number | null | undefined): string {
  if (cents == null) return "";
  return (cents / 100).toFixed(2).replace(".", ",");
}
