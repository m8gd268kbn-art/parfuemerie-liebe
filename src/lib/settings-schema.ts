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

/** Weitere Häuser der Parfümerie Liebe (Anzeige auf der Filialseite, im strukturierten Daten-Markup). */
const branch = z.object({
  name: z.string().min(1),
  street: z.string().default(""),
  postalCode: z.string().default(""),
  city: z.string().min(1),
  phone: z.string().default(""),
});

/*
 * Vorbelegung mit öffentlich belegten Angaben zur Parfümerie Liebe (Stand 27.09.2026, Quellen in
 * PRODUCT.md unter „Quellen der Geschäftsdaten“). Widersprüchliche Angaben (Öffnungszeiten, Anschrift
 * Göttingen) bleiben leer und erscheinen als Platzhalter. Alles ist im Admin änderbar.
 */

export const settingsSchema = z.object({
  store: z
    .object({
      name: z.string().default("Parfümerie Liebe"),
      city: z.string().default("Hannover"),
      street: z.string().default("Karmarschstraße 25"),
      postalCode: z.string().default("30159"),
      phone: z.string().default("0511 304711"),
      email: z.string().default("info@liebe-hannover.de"),
      supportEmail: z.string().default(""),
      legalName: z.string().default("W. Liebe GmbH & Co. KG"),
      foundedYear: z.string().default("1871"),
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
      // Vom Auftraggeber bereitgestellt (27.09.2026), Nutzungsrecht siehe docs/MEDIA.md
      imageUrl: z.string().default("/media/store/eingang-karmarschstrasse.webp"),
      imageAlt: z
        .string()
        .default("Eingang der Parfümerie Liebe in der Karmarschstraße: weiße Fassade mit Rundbogenfenstern, Markise mit dem Liebe-Schriftzug und rote Pflanzkübel"),
      about: z
        .string()
        .default(
          "Seit 1871 in Hannover und seit 1907 im eigenen Haus in der Karmarschstraße. Dort beraten wir Sie persönlich, und Sie können Düfte in Ruhe testen.",
        ),
      history: z
        .string()
        .default(
          "Am 1. Oktober 1871 eröffnete der Kaufmann Wilhelm Liebe sein Geschäft in der Georgstraße in Hannover, damals mit englischen Seifen und Veilchenparfum. 1907 zog das Haus in das eigene Gebäude in der Karmarschstraße 25, bis heute das Stammhaus.\n\nDie Parfümerie Liebe ist ein Familienunternehmen und wird heute in der fünften Generation geführt. Weitere Häuser gibt es in Celle und Göttingen.",
        ),
      branches: z.array(branch).default([
        { name: "Parfümerie Liebe Celle", street: "Poststraße 1", postalCode: "29221", city: "Celle", phone: "" },
        { name: "Parfümerie Liebe Göttingen", street: "", postalCode: "", city: "Göttingen", phone: "" },
      ]),
      services: z.array(z.string()).default([]),
      directions: z.string().default(""),
    })
    .prefault({}),
  social: z
    .object({
      instagram: z.string().default("https://www.instagram.com/liebe.hannover/"),
      facebook: z.string().default("https://www.facebook.com/liebe.hannover/"),
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
      /** Großes Wort über die ganze Breite der Startseite (kurz halten, 4 bis 7 Buchstaben). */
      heroWord: z.string().default("Liebe"),
      heroHeadline: z.string().default("Der Duft, der bleibt."),
      heroSubline: z
        .string()
        .default("Parfums und Nischendüfte, ausgewählt in unserer Parfümerie in Hannover. Jetzt auch online."),
      heroPrimaryLabel: z.string().default("Düfte entdecken"),
      heroPrimaryHref: z.string().default("/parfum"),
      heroSecondaryLabel: z.string().default("Neuheiten"),
      heroSecondaryHref: z.string().default("/neuheiten"),
      /** Freigestelltes Motiv mit transparentem Hintergrund (steht vor dem großen Wort). */
      heroImageUrl: z.string().default("/media/cutouts/hero.webp"),
      heroImageAlt: z.string().default("Parfumflakon mit roséfarbener Flüssigkeit und goldener Kappe (Platzhalterbild)"),
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
export type Branch = z.infer<typeof branch>;
export type ShippingMethod = z.infer<typeof shippingMethod>;

export function parseSettings(data: unknown): ShopSettings {
  const result = settingsSchema.safeParse(data ?? {});
  return result.success ? result.data : settingsSchema.parse({});
}

export const defaultSettings = (): ShopSettings => settingsSchema.parse({});
