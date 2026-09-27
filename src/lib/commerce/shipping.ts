import type { ShippingMethod, ShippingZone, ShopSettings } from "@/lib/settings-schema";
import { formatPrice } from "@/lib/format";

export function zoneForCountry(settings: ShopSettings, country: string): ShippingZone | null {
  const c = country.toUpperCase();
  return settings.shipping.zones.find((z) => z.active && z.countries.includes(c)) ?? null;
}

export function methodsForCountry(settings: ShopSettings, country: string): ShippingMethod[] {
  return zoneForCountry(settings, country)?.methods.filter((m) => m.active) ?? [];
}

export function shippingCountries(settings: ShopSettings): string[] {
  return settings.shipping.zones.filter((z) => z.active).flatMap((z) => z.countries);
}

/** Standardmethode für Deutschland (Anzeige von Versandkosten vor dem Checkout). */
export function defaultMethod(settings: ShopSettings): ShippingMethod | null {
  return methodsForCountry(settings, "DE")[0] ?? null;
}

/** Ersetzt Platzhalter in Service-Bar-Texten durch aktuelle Einstellungen. */
export function interpolateServiceText(text: string, settings: ShopSettings): string | null {
  const method = defaultMethod(settings);
  const tokens: Record<string, string | null> = {
    freeShippingFrom: method?.freeFromCents != null ? formatPrice(method.freeFromCents) : null,
    shippingPrice: method ? formatPrice(method.priceCents) : null,
    samplesCount:
      settings.samples.enabled && settings.samples.maxCount > 0 ? String(settings.samples.maxCount) : null,
    city: settings.store.city || null,
  };
  let missing = false;
  const out = text.replace(/\{(\w+)\}/g, (_, key: string) => {
    const value = tokens[key];
    if (value == null) missing = true;
    return value ?? "";
  });
  // Ein Text mit nicht erfüllbarem Platzhalter (z. B. Proben deaktiviert) wird ausgeblendet.
  return missing ? null : out;
}

export const COUNTRY_NAMES: Record<string, string> = {
  DE: "Deutschland",
  AT: "Österreich",
  CH: "Schweiz",
  NL: "Niederlande",
  BE: "Belgien",
  LU: "Luxemburg",
  FR: "Frankreich",
  DK: "Dänemark",
  PL: "Polen",
  CZ: "Tschechien",
  IT: "Italien",
  ES: "Spanien",
};
