import { describe, expect, it } from "vitest";
import { fromBerlinInput, toBerlinInput } from "@/lib/berlin-time";
import { interpolateServiceText } from "@/lib/commerce/shipping";
import { formatPrice, parseEuroToCents } from "@/lib/format";
import { defaultSettings } from "@/lib/settings-schema";
import { slugify } from "@/lib/utils";

describe("Formatierung", () => {
  it("zeigt Preise im deutschen Format", () => {
    expect(formatPrice(12900).replace(/ /g, " ")).toBe("129,00 €");
    expect(formatPrice(123456).replace(/ /g, " ")).toBe("1.234,56 €");
  });

  it("liest Euro-Eingaben im Admin", () => {
    expect(parseEuroToCents("129,00")).toBe(12900);
    expect(parseEuroToCents("1.234,5")).toBe(123450);
    expect(parseEuroToCents("49")).toBe(4900);
    expect(parseEuroToCents("12,345")).toBeNull();
    expect(parseEuroToCents("abc")).toBeNull();
  });

  it("erzeugt URL-Pfade mit Umlauten", () => {
    expect(slugify("Parfümerie Liebe & Söhne")).toBe("parfuemerie-liebe-und-soehne");
  });

  it("rechnet Admin-Datumsangaben in Berliner Zeit (Sommer- und Winterzeit)", () => {
    expect(fromBerlinInput("2026-07-01T00:00").toISOString()).toBe("2026-06-30T22:00:00.000Z");
    expect(fromBerlinInput("2026-12-01T00:00").toISOString()).toBe("2026-11-30T23:00:00.000Z");
    expect(toBerlinInput(new Date("2026-06-30T22:00:00Z"))).toBe("2026-07-01T00:00");
  });
});

describe("Service-Leiste", () => {
  it("setzt Werte aus den Einstellungen ein und blendet unerfüllbare Aussagen aus", () => {
    const s = defaultSettings();
    expect(interpolateServiceText("Versandkostenfrei ab {freeShippingFrom}", s)?.replace(/ /g, " ")).toBe("Versandkostenfrei ab 49,00 €");
    const noSamples = { ...s, samples: { ...s.samples, enabled: false } };
    expect(interpolateServiceText("{samplesCount} Duftproben gratis", noSamples)).toBeNull();
  });
});
