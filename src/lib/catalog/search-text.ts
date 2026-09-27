import { CONCENTRATIONS, FAMILIES, GENDERS } from "@/config/catalog";
import { normalizeText } from "@/lib/utils";

/** Normalisierter Suchtext eines Produkts (wird beim Speichern in products.search_text abgelegt). */
export function buildSearchText(input: {
  brandName: string;
  name: string;
  concentration: string;
  gender: string;
  families: string[];
  notes: string[];
  character: string[];
}) {
  const conc = CONCENTRATIONS.find((c) => c.key === input.concentration);
  const gender = GENDERS.find((g) => g.key === input.gender);
  const families = input.families.map((f) => FAMILIES.find((x) => x.key === f)).filter(Boolean);
  return normalizeText(
    [
      input.brandName,
      input.name,
      conc?.label,
      conc?.short,
      gender?.label,
      gender?.plural,
      ...families.flatMap((f) => [f!.label, f!.world, f!.key]),
      ...input.notes,
      ...input.character,
    ]
      .filter(Boolean)
      .join(" "),
  );
}

