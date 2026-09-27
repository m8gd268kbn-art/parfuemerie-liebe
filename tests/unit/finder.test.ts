import { describe, expect, it } from "vitest";
import { scoreProducts, type FinderAnswers } from "@/lib/finder/score";
import { product, variant } from "./fixtures";

const answers = (over: Partial<FinderAnswers> = {}): FinderAnswers => ({ for: null, families: [], intensity: null, occasion: null, season: null, budget: null, ...over });

describe("Duftfinder", () => {
  it("filtert hart nach Zielgruppe, Budget und Verfügbarkeit", () => {
    const women = product({ gender: "women" });
    const men = product({ gender: "men" });
    const soldOut = product({ gender: "women", variants: [variant({ stock: 0 })] });
    const pricey = product({ gender: "women", variants: [variant({ priceCents: 30000 })] });
    const ids = (r: ReturnType<typeof scoreProducts>) => r.map((x) => x.product.id);
    expect(ids(scoreProducts([women, men, soldOut], answers({ for: "women" })))).toEqual([women.id]);
    expect(ids(scoreProducts([women, pricey], answers({ budget: "bis-80" })))).toEqual([]);
    expect(ids(scoreProducts([women, pricey], answers({ budget: "ab-250" })))).toEqual([pricey.id]);
  });

  it("gewichtet Hauptfamilie vor verwandter Familie und begründet die Empfehlung", () => {
    const main = product({ families: ["amber", "woody"] });
    const related = product({ families: ["woody", "amber"] });
    const other = product({ families: ["fresh"] });
    const r = scoreProducts([other, related, main], answers({ families: ["amber"] }));
    expect(r[0].product.id).toBe(main.id);
    expect(r[0].reasons).toContain("Ihre Duftwelt");
    expect(r[1].product.id).toBe(related.id);
    expect(r[1].reasons).toContain("Verwandte Duftwelt");
  });
});
