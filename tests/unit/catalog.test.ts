import { describe, expect, it } from "vitest";
import { applyFilters, filtersToQuery, matchesCategory, parseFilters, sortProducts } from "@/lib/catalog/filters";
import { lowestPriceBeforeReduction } from "@/lib/commerce/price-history";
import type { CategoryDTO } from "@/types/catalog";
import { product, variant } from "./fixtures";

describe("URL-Filter", () => {
  it("liest Filter robust aus der URL und verwirft Ungültiges", () => {
    const f = parseFilters({ brand: "Dior,chanel", gender: "women,alien", price: "50-150", size: "100,abc", sort: "hack", page: "-3", sale: "1" });
    expect(f).toMatchObject({ brands: ["dior", "chanel"], genders: ["women"], priceMin: 50, priceMax: 150, sizes: [100], sort: "popular", page: 1, sale: true });
  });

  it("serialisiert stabil (sortiert) und ist mit parseFilters umkehrbar", () => {
    const q = filtersToQuery({ brands: ["dior", "chanel"], families: ["woody"], priceMin: 50, priceMax: null, sort: "price-asc", page: 2 });
    expect(q).toBe("?brand=chanel%2Cdior&family=woody&price=50-&sort=price-asc&page=2");
    const back = parseFilters(Object.fromEntries(new URLSearchParams(q.slice(1))));
    expect(back).toMatchObject({ brands: ["chanel", "dior"], families: ["woody"], priceMin: 50, priceMax: null, sort: "price-asc", page: 2 });
  });

  it("filtert nach Marke, Duftfamilie, Preis und Verfügbarkeit", () => {
    const a = product({ brand: { id: "b1", name: "Dior", slug: "dior" }, families: ["fresh"], variants: [variant({ priceCents: 6000 })] });
    const b = product({ brand: { id: "b2", name: "Chanel", slug: "chanel" }, families: ["woody", "amber"], variants: [variant({ priceCents: 16000 })] });
    const c = product({ brand: { id: "b2", name: "Chanel", slug: "chanel" }, families: ["amber"], variants: [variant({ priceCents: 9000, stock: 0 })] });
    const all = [a, b, c];
    expect(applyFilters(all, parseFilters({ brand: "chanel" })).map((p) => p.id)).toEqual([b.id, c.id]);
    expect(applyFilters(all, parseFilters({ family: "amber" })).map((p) => p.id)).toEqual([b.id, c.id]);
    expect(applyFilters(all, parseFilters({ price: "50-100" })).map((p) => p.id)).toEqual([a.id, c.id]);
    expect(applyFilters(all, parseFilters({ available: "1" })).map((p) => p.id)).toEqual([a.id, b.id]);
  });

  it("sortiert nach Preis", () => {
    const cheap = product({ variants: [variant({ priceCents: 3000 })] });
    const pricey = product({ variants: [variant({ priceCents: 30000 })] });
    expect(sortProducts([pricey, cheap], "price-asc")[0].id).toBe(cheap.id);
    expect(sortProducts([cheap, pricey], "price-desc")[0].id).toBe(pricey.id);
  });

  it("wendet Kategorieregeln an (Zielgruppe, Nische, manuell)", () => {
    const cat = (rule: CategoryDTO["rule"], id = "c1") => ({ id, slug: "x", name: "X", description: null, heroImageUrl: null, rule, showInNav: true, sortOrder: 0, seoTitle: null, seoDescription: null }) as CategoryDTO;
    const men = product({ gender: "men" });
    const niche = product({ gender: "unisex", niche: true, categoryIds: ["c9"] });
    expect(matchesCategory(men, cat({ gender: ["women", "unisex"] }))).toBe(false);
    expect(matchesCategory(niche, cat({ gender: ["women", "unisex"] }))).toBe(true);
    expect(matchesCategory(men, cat({ niche: true }))).toBe(false);
    expect(matchesCategory(niche, cat({ manual: true }, "c9"))).toBe(true);
    expect(matchesCategory(men, cat({ manual: true }, "c9"))).toBe(false);
  });
});

describe("Niedrigster Preis der letzten 30 Tage (§ 11 PAngV)", () => {
  const d = (s: string) => new Date(`${s}T12:00:00Z`);
  const row = (priceCents: number, date: string) => ({ variantId: "v", priceCents, changedAt: d(date) });

  it("nimmt den vor dem Zeitraum gültigen Preis und alle Preise im Zeitraum", () => {
    // 129 € seit Juni, kurz 119 € im September, dann Reduzierung auf 99 €
    const history = [row(12900, "2026-06-01"), row(11900, "2026-09-05"), row(12900, "2026-09-10"), row(9900, "2026-09-20")];
    expect(lowestPriceBeforeReduction(history, 9900)).toBe(11900);
  });

  it("ignoriert Preise, die vor dem 30-Tage-Zeitraum abgelöst wurden", () => {
    const history = [row(7900, "2026-05-01"), row(12900, "2026-06-01"), row(9900, "2026-09-20")];
    expect(lowestPriceBeforeReduction(history, 9900)).toBe(12900);
  });

  it("liefert null ohne Vorgeschichte oder bei abweichendem aktuellem Preis", () => {
    expect(lowestPriceBeforeReduction([], 9900)).toBeNull();
    expect(lowestPriceBeforeReduction([row(9900, "2026-09-20")], 9900)).toBeNull();
    expect(lowestPriceBeforeReduction([row(12900, "2026-06-01"), row(9900, "2026-09-20")], 8900)).toBeNull();
  });
});
