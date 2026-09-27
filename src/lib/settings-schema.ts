import { z } from "zod";

/**
 * Shop-Einstellungen. Alle Geschäftsregeln (Versand, Proben, Service-Bar, Zahlarten,
 * Kontakt, Öffnungszeiten, Click & Collect, Startseite, Rechtstexte) sind hier konfigurierbar
 * und im Admin unter „Einstellungen“ editierbar. Leere Felder gelten als Platzhalter.
 */

const shippingMethod = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  carrier: z.string().default(""),
  priceCents: z.number().int().min(0),
  /** Versandkostenfrei ab diesem Warenwert (null = nie). */
  freeFromCents: z.number().int().min(0).nullable().default(null),
  deliveryTime: z.string().default(""),
  active: z.boolean().default(true),
});

const shippingZone = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  countries: z.array(z.string().length(2)).min(1),
  active: z.boolean().default(true),
  methods: z.array(shippingMethod).default([]),
});

const openingHour = z.object({ day: z.string(), hours: z.string().default("") });

export const settingsSchema = z.object({
  store: z
    .object({
      name: z.string().default("Parfümerie Liebe"),
      city: z.string().default("Hannover"),
      street: z.string().default(""),
      postalCode: z.string().default(""),
      phone: z.string().default(""),
      email: z.string().default(""),
      supportEmail: z.string().default(""),
      legalName: z.string().default(""),
      vatId: z.string().default(""),
      openingHours: z.array(openingHour).default([
        { day: "Montag", hours: "" },
        { day: "Dienstag", hours: "" },
        { day: "Mittwoch", hours: "" },
        { day: "Donnerstag", hours: "" },
        { day: "Freitag", hours: "" },
        { day: "Samstag", hours: "" },
        { day: "Sonntag", hours: "" },
      ]),
      mapUrl: z.string().default(""),
      imageUrl: z.string().default(""),
      imageAlt: z.string().default(""),
      about: z.string().default(""),
      history: z.string().default(""),
      services: z.array(z.string()).default([]),
      directions: z.string().default(""),
    })
    .prefault({}),
  social: z
    .object({
      instagram: z.string().default(""),
      facebook: z.string().default(""),
      tiktok: z.string().default(""),
      pinterest: z.string().default(""),
    })
    .prefault({}),
  serviceBar: z
    .object({
      enabled: z.boolean().default(true),
      /** Platzhalter: {freeShippingFrom}, {shippingPrice}, {samplesCount}, {city} */
      items: z
        .array(z.string())
        .default([
          "Versandkostenfrei ab {freeShippingFrom}",
          "{samplesCount} Duftproben gratis zu jeder Bestellung",
          "Persönliche Beratung in unserer Parfümerie in {city}",
        ]),
    })
    .prefault({}),
  shipping: z
    .object({
      taxRatePercent: z.number().int().min(0).max(100).default(19),
      zones: z.array(shippingZone).default([
        {
          id: "de",
          name: "Deutschland",
          countries: ["DE"],
          active: true,
          methods: [
            {
              id: "standard",
              name: "Standardversand",
              carrier: "DHL",
              priceCents: 495,
              freeFromCents: 4900,
              deliveryTime: "2-4 Werktage",
              active: true,
            },
          ],
        },
      ]),
    })
    .prefault({}),
  samples: z
    .object({
      enabled: z.boolean().default(true),
      maxCount: z.number().int().min(0).max(10).default(2),
      minSubtotalCents: z.number().int().min(0).default(0),
    })
    .prefault({}),
  payments: z
    .object({
      /** Nur aktivierte Zahlarten werden angezeigt. Aktivieren erst, wenn im Stripe-Konto freigeschaltet. */
      methods: z
        .array(z.object({ id: z.string(), enabled: z.boolean() }))
        .default([
          { id: "card", enabled: true },
          { id: "apple_pay", enabled: false },
          { id: "google_pay", enabled: false },
          { id: "paypal", enabled: false },
          { id: "klarna", enabled: false },
        ]),
    })
    .prefault({}),
  pickup: z
    .object({
      enabled: z.boolean().default(false),
      label: z.string().default("Abholung in der Parfümerie Liebe, Hannover"),
      readyTime: z.string().default(""),
      instructions: z.string().default(""),
    })
    .prefault({}),
  returns: z
    .object({
      withdrawalDays: z.number().int().min(14).default(14),
      summary: z.string().default("14 Tage Widerrufsrecht. Details in der Widerrufsbelehrung."),
    })
    .prefault({}),
  home: z
    .object({
      heroHeadline: z.string().default("Der Duft, der bleibt."),
      heroSubline: z
        .string()
        .default("Parfums und Nischendüfte, ausgewählt in unserer Parfümerie in Hannover. Jetzt auch online."),
      heroPrimaryLabel: z.string().default("Düfte entdecken"),
      heroPrimaryHref: z.string().default("/parfum"),
      heroSecondaryLabel: z.string().default("Neuheiten"),
      heroSecondaryHref: z.string().default("/neuheiten"),
      heroImageUrl: z.string().default("/media/hero/hero.webp"),
      heroImageAlt: z.string().default("Glasflakons im Streiflicht auf hellem Stein"),
    })
    .prefault({}),
  legal: z
    .object({
      impressum: z.string().default(""),
      datenschutz: z.string().default(""),
      agb: z.string().default(""),
      widerruf: z.string().default(""),
    })
    .prefault({}),
});

export type ShopSettings = z.infer<typeof settingsSchema>;
export type ShippingZone = z.infer<typeof shippingZone>;
export type ShippingMethod = z.infer<typeof shippingMethod>;

export function parseSettings(data: unknown): ShopSettings {
  const result = settingsSchema.safeParse(data ?? {});
  return result.success ? result.data : settingsSchema.parse({});
}

export const defaultSettings = (): ShopSettings => settingsSchema.parse({});
