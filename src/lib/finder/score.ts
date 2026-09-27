import type { ProductCardDTO } from "@/types/catalog";

export type FinderAnswers = {
  for: "women" | "men" | "unisex" | "gift" | null;
  families: string[];
  intensity: number | null;
  occasion: string | null;
  season: string | null;
  budget: "bis-80" | "80-150" | "150-250" | "ab-250" | "egal" | null;
};

const BUDGETS: Record<string, [number, number]> = {
  "bis-80": [0, 8000],
  "80-150": [8000, 15000],
  "150-250": [15000, 25000],
  "ab-250": [25000, Number.MAX_SAFE_INTEGER],
};

/**
 * Datengetriebene Duftempfehlung ohne KI-Modell: harte Kriterien (Für wen, Budget, verfügbar)
 * filtern, weiche Kriterien (Duftwelt, Intensität, Anlass, Jahreszeit) gewichten.
 */
export function scoreProducts(products: ProductCardDTO[], a: FinderAnswers) {
  const results: { product: ProductCardDTO; score: number; reasons: string[] }[] = [];
  for (const p of products) {
    if (!p.inStock) continue;
    if (a.for === "women" && p.gender === "men") continue;
    if (a.for === "men" && p.gender === "women") continue;
    if (a.for === "unisex" && p.gender !== "unisex") continue;
    if (a.budget && a.budget !== "egal") {
      const [min, max] = BUDGETS[a.budget];
      if (!p.variants.some((v) => v.stock > 0 && v.priceCents >= min && v.priceCents < max)) continue;
    }
    let score = 0;
    const reasons: string[] = [];
    if (a.families.length) {
      if (a.families.includes(p.families[0])) {
        score += 4;
        reasons.push("Ihre Duftwelt");
      } else if (p.families.some((f) => a.families.includes(f))) {
        score += 2;
        reasons.push("Verwandte Duftwelt");
      }
    }
    if (a.intensity != null && p.intensity != null) {
      const diff = Math.abs(p.intensity - a.intensity);
      score += Math.max(0, 2.5 - diff * 1.2);
      if (diff === 0) reasons.push("Passende Intensität");
    }
    if (a.occasion && p.occasions.includes(a.occasion)) {
      score += 1.5;
      reasons.push(a.occasion);
    }
    if (a.season && p.seasons.includes(a.season)) {
      score += 1.5;
      reasons.push(a.season);
    }
    score += Math.min(1, p.popularity / 50) * 0.5 + (p.bestseller ? 0.3 : 0);
    results.push({ product: p, score, reasons });
  }
  return results.sort((x, y) => y.score - x.score);
}
