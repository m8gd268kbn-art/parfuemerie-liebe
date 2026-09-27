/**
 * Fachliche Stammdaten des Parfum-Katalogs (client- und serverseitig nutzbar).
 * Schlüssel sind stabil und landen in URLs (?family=woody) und in der Datenbank.
 */

export type Gender = "women" | "men" | "unisex";
export type Concentration = "edc" | "edt" | "edp" | "parfum" | "extrait";

export const GENDERS: { key: Gender; label: string; plural: string; slug: string }[] = [
  { key: "women", label: "Damen", plural: "Damendüfte", slug: "damen" },
  { key: "men", label: "Herren", plural: "Herrendüfte", slug: "herren" },
  { key: "unisex", label: "Unisex", plural: "Unisex-Düfte", slug: "unisex" },
];

export const CONCENTRATIONS: { key: Concentration; label: string; short: string; description: string }[] = [
  { key: "edc", label: "Eau de Cologne", short: "EdC", description: "Leicht und frisch, kurze Haltbarkeit." },
  { key: "edt", label: "Eau de Toilette", short: "EdT", description: "Frisch und alltagstauglich." },
  { key: "edp", label: "Eau de Parfum", short: "EdP", description: "Ausgewogen und langanhaltend." },
  { key: "parfum", label: "Parfum", short: "Parfum", description: "Sehr konzentriert und intensiv." },
  { key: "extrait", label: "Extrait de Parfum", short: "Extrait", description: "Höchste Konzentration." },
];

export type FamilyKey =
  | "floral"
  | "woody"
  | "fresh"
  | "citrus"
  | "aromatic"
  | "amber"
  | "gourmand"
  | "fruity"
  | "leather"
  | "musk";

/** Duftfamilien mit ihrer „Flüssigkeit“ (Farbe nur für Bildmaterial und Notenschichten). */
export const FAMILIES: {
  key: FamilyKey;
  label: string;
  world: string;
  description: string;
  liquid: string;
}[] = [
  { key: "fresh", label: "Frisch", world: "Frisch", description: "Klar, luftig, aquatisch.", liquid: "#bcd7d3" },
  { key: "woody", label: "Holzig", world: "Holzig", description: "Zeder, Sandelholz, Vetiver.", liquid: "#a9805f" },
  { key: "amber", label: "Amber", world: "Amber & Orient", description: "Warm, harzig, würzig.", liquid: "#c78a41" },
  { key: "floral", label: "Blumig", world: "Blumig", description: "Rose, Jasmin, Iris.", liquid: "#e6c3c6" },
  { key: "gourmand", label: "Gourmand", world: "Gourmand", description: "Vanille, Tonka, Kakao.", liquid: "#b67b58" },
  { key: "citrus", label: "Zitrisch", world: "Zitrisch", description: "Bergamotte, Zitrone, Neroli.", liquid: "#e8cf78" },
  { key: "aromatic", label: "Aromatisch", world: "Aromatisch", description: "Lavendel, Kräuter, Salbei.", liquid: "#9fb28b" },
  { key: "musk", label: "Moschus", world: "Moschus", description: "Sanft, pudrig, hautnah.", liquid: "#d8cec3" },
  { key: "fruity", label: "Fruchtig", world: "Fruchtig", description: "Beeren, Pfirsich, Birne.", liquid: "#dfa0a4" },
  { key: "leather", label: "Leder", world: "Leder", description: "Rauchig, dunkel, weich.", liquid: "#6f4d3c" },
];

export const CHARACTERS = [
  "frisch",
  "warm",
  "süß",
  "elegant",
  "holzig",
  "würzig",
  "cremig",
  "pudrig",
  "aquatisch",
  "dunkel",
] as const;

export const SEASONS = ["Frühling", "Sommer", "Herbst", "Winter"] as const;
export const OCCASIONS = ["Alltag", "Business", "Abend", "Date", "Event"] as const;

export const INTENSITY_LABELS: Record<number, string> = {
  1: "Leicht",
  2: "Dezent",
  3: "Ausgewogen",
  4: "Kräftig",
  5: "Intensiv",
};

export const IMAGE_KINDS = [
  { key: "front", label: "Vorderseite" },
  { key: "back", label: "Rückseite" },
  { key: "side", label: "Seitenansicht" },
  { key: "packaging", label: "Verpackung" },
  { key: "detail", label: "Detail" },
  { key: "lifestyle", label: "Stimmung" },
] as const;

export type SortKey = "popular" | "new" | "price-asc" | "price-desc" | "name" | "bestseller" | "rating";

export const SORTS: { key: SortKey; label: string }[] = [
  { key: "popular", label: "Beliebtheit" },
  { key: "new", label: "Neuheiten" },
  { key: "bestseller", label: "Bestseller" },
  { key: "price-asc", label: "Preis aufsteigend" },
  { key: "price-desc", label: "Preis absteigend" },
  { key: "name", label: "Name A-Z" },
  { key: "rating", label: "Kundenbewertung" },
];

export const PAYMENT_METHODS = [
  { id: "card", label: "Kredit- und Debitkarte", short: "Karte" },
  { id: "apple_pay", label: "Apple Pay", short: "Apple Pay" },
  { id: "google_pay", label: "Google Pay", short: "Google Pay" },
  { id: "paypal", label: "PayPal", short: "PayPal" },
  { id: "klarna", label: "Klarna", short: "Klarna" },
] as const;

export type PaymentMethodId = (typeof PAYMENT_METHODS)[number]["id"];

export function familyByKey(key: string) {
  return FAMILIES.find((f) => f.key === key);
}

export function concentrationLabel(key: string) {
  return CONCENTRATIONS.find((c) => c.key === key)?.label ?? key;
}

export function genderLabel(key: string) {
  return GENDERS.find((g) => g.key === key)?.label ?? key;
}
