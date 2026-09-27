import type { CategoryRule } from "@/services/db/schema";

const GENDER_LABEL = { women: "Damen", men: "Herren", unisex: "Unisex" } as const;

/** Lesbare Beschreibung einer Kategorieregel für den Admin. */
export function describeRule(rule: CategoryRule): string {
  if (rule.manual) return "Manuelle Auswahl";
  const parts = [
    rule.gender?.length ? rule.gender.map((g) => GENDER_LABEL[g]).join(" und ") : null,
    rule.niche ? "Nischendüfte" : null,
    rule.isNew ? "Neuheiten" : null,
    rule.bestseller ? "Bestseller" : null,
    rule.onSale ? "reduziert" : null,
  ].filter(Boolean);
  return parts.length ? parts.join(", ") : "Alle Produkte";
}
