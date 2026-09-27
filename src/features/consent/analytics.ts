import { readConsent } from "./consent";

/**
 * Datenschutzfreundliche Analytics-Abstraktion. Ereignisse werden nur gesendet, wenn
 * (1) ein Anbieter konfiguriert ist und (2) eine Statistik-Einwilligung vorliegt.
 * Ohne Einwilligung wird kein Tracking-Skript geladen (siehe AnalyticsLoader).
 */
export type AnalyticsEvent =
  | "page_view"
  | "product_view"
  | "add_to_cart"
  | "begin_checkout"
  | "purchase"
  | "search"
  | "add_to_wishlist";

type Plausible = (event: string, options?: { props?: Record<string, unknown> }) => void;

export function analyticsProvider(): "plausible" | null {
  return process.env.NEXT_PUBLIC_ANALYTICS_PROVIDER === "plausible" && process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ? "plausible" : null;
}

export function track(event: AnalyticsEvent, props: Record<string, unknown> = {}) {
  if (typeof window === "undefined") return;
  if (!analyticsProvider() || !readConsent()?.analytics) return;
  const plausible = (window as unknown as { plausible?: Plausible }).plausible;
  // Nur skalare Werte, keine personenbezogenen Daten.
  const safe = Object.fromEntries(Object.entries(props).filter(([, v]) => ["string", "number", "boolean"].includes(typeof v)));
  plausible?.(event, { props: safe });
}
