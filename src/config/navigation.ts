export type NavItem = { label: string; href: string };

/** Hauptnavigation (Desktop). Reihenfolge laut Briefing. */
export const MAIN_NAV: NavItem[] = [
  { label: "Neuheiten", href: "/neuheiten" },
  { label: "Parfum", href: "/parfum" },
  { label: "Damen", href: "/damen" },
  { label: "Herren", href: "/herren" },
  { label: "Unisex", href: "/unisex" },
  { label: "Nischendüfte", href: "/nischenduefte" },
  { label: "Marken", href: "/marken" },
  { label: "Angebote", href: "/angebote" },
];

/**
 * Kopfzeile (Desktop, links vom zentrierten Logo). Kürzer als MAIN_NAV, damit Logo mittig bleibt;
 * alles Weitere im Menü (Hamburger). `wide`: erst ab 1536 px.
 */
export const HEADER_NAV: (NavItem & { wide?: boolean })[] = [
  { label: "Damen", href: "/damen" },
  { label: "Herren", href: "/herren" },
  { label: "Unisex", href: "/unisex" },
  { label: "Nischendüfte", href: "/nischenduefte", wide: true },
  { label: "Marken", href: "/marken" },
  { label: "Angebote", href: "/angebote" },
];

/** Mobile Navigation: eigene Struktur statt zusammengedrückter Desktop-Navigation. */
export const MOBILE_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Parfum",
    items: [
      { label: "Alle Düfte", href: "/parfum" },
      { label: "Damen", href: "/damen" },
      { label: "Herren", href: "/herren" },
      { label: "Unisex", href: "/unisex" },
    ],
  },
  {
    title: "Entdecken",
    items: [
      { label: "Neuheiten", href: "/neuheiten" },
      { label: "Bestseller", href: "/bestseller" },
      { label: "Nischendüfte", href: "/nischenduefte" },
      { label: "Angebote", href: "/angebote" },
      { label: "Duftfinder", href: "/duftfinder" },
    ],
  },
];

export const SERVICE_NAV: NavItem[] = [
  { label: "Unsere Parfümerie", href: "/parfuemerie" },
  { label: "Kontakt", href: "/kontakt" },
  { label: "Versand", href: "/versand" },
  { label: "FAQ", href: "/faq" },
];

export const FOOTER_NAV: { title: string; items: NavItem[] }[] = [
  {
    title: "Kundenservice",
    items: [
      { label: "Kontakt", href: "/kontakt" },
      { label: "FAQ", href: "/faq" },
      { label: "Versand", href: "/versand" },
      { label: "Rückgabe", href: "/rueckgabe" },
      { label: "Zahlungsarten", href: "/zahlungsarten" },
      { label: "Bestellung verfolgen", href: "/bestellung-verfolgen" },
    ],
  },
  {
    title: "Parfümerie Liebe",
    items: [
      { label: "Unsere Parfümerie", href: "/parfuemerie" },
      { label: "Beratung", href: "/parfuemerie#beratung" },
      { label: "Duftfinder", href: "/duftfinder" },
      { label: "Kontakt", href: "/kontakt" },
    ],
  },
  {
    title: "Entdecken",
    items: [
      { label: "Marken", href: "/marken" },
      { label: "Neuheiten", href: "/neuheiten" },
      { label: "Bestseller", href: "/bestseller" },
      { label: "Nischendüfte", href: "/nischenduefte" },
    ],
  },
  {
    title: "Rechtliches",
    items: [
      { label: "Impressum", href: "/impressum" },
      { label: "Datenschutz", href: "/datenschutz" },
      { label: "AGB", href: "/agb" },
      { label: "Widerrufsbelehrung", href: "/widerruf" },
    ],
  },
];
