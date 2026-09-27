/**
 * DEMO-KATALOG – nur für Entwicklung und Präsentation.
 *
 * - Marken und Düfte sind real, Duftnoten entsprechen öffentlich verbreiteten Angaben.
 * - Preise, Bestände, Angebote sind frei gewählte Demo-Werte, keine Preise der Parfümerie Liebe.
 * - Produktbilder sind neutrale, lokal gerenderte Flakon-Platzhalter (scripts/render-bottles.ts),
 *   keine Abbildungen der Originalflakons.
 * - Inhaltsstoffe (INCI) und Herstellerangaben bleiben leer und müssen vor Livegang ergänzt werden.
 * Alle Produkte werden mit `is_demo = true` angelegt.
 */

export type DemoBrand = { name: string; slug: string; country: string; niche: boolean; featured: boolean; description: string };

export type BottleShape = "tall-rect" | "square" | "cylinder" | "flask" | "round" | "stepped";
export type CapStyle = "gold" | "silver" | "black" | "wood" | "glass" | "white";

export type DemoVariant = { ml: number; price: number; stock: number; compareAt?: number; displaySize?: string };

export type DemoProduct = {
  brand: string;
  name: string;
  slug: string;
  gender: "women" | "men" | "unisex";
  concentration: "edc" | "edt" | "edp" | "parfum" | "extrait";
  families: string[];
  top: string[];
  heart: string[];
  base: string[];
  character?: string[];
  seasons?: string[];
  occasions?: string[];
  intensity?: number;
  description: string;
  usage?: string;
  variants: DemoVariant[];
  niche?: boolean;
  isNew?: boolean;
  bestseller?: boolean;
  featured?: boolean;
  liquid: string;
  bottle: { shape: BottleShape; cap: CapStyle; glass?: string };
  createdDaysAgo: number;
};

export const DEMO_BRANDS: DemoBrand[] = [
  { name: "Dior", slug: "dior", country: "Frankreich", niche: false, featured: true, description: "Französisches Modehaus, 1946 in Paris gegründet. Die Düfte erscheinen unter Parfums Christian Dior." },
  { name: "Chanel", slug: "chanel", country: "Frankreich", niche: false, featured: true, description: "Pariser Modehaus, gegründet von Gabrielle Chanel. Chanel N°5 erschien 1921." },
  { name: "Yves Saint Laurent", slug: "yves-saint-laurent", country: "Frankreich", niche: false, featured: false, description: "Französisches Modehaus, 1961 von Yves Saint Laurent und Pierre Bergé gegründet." },
  { name: "Giorgio Armani", slug: "giorgio-armani", country: "Italien", niche: false, featured: false, description: "Italienisches Modehaus aus Mailand, gegründet 1975." },
  { name: "Lancôme", slug: "lancome", country: "Frankreich", niche: false, featured: false, description: "Französisches Beauty-Haus, gegründet 1935." },
  { name: "Hugo Boss", slug: "hugo-boss", country: "Deutschland", niche: false, featured: false, description: "Modeunternehmen aus Metzingen." },
  { name: "Prada", slug: "prada", country: "Italien", niche: false, featured: false, description: "Italienisches Modehaus aus Mailand, gegründet 1913." },
  { name: "Jean Paul Gaultier", slug: "jean-paul-gaultier", country: "Frankreich", niche: false, featured: false, description: "Französischer Modedesigner. Le Male erschien 1995." },
  { name: "Guerlain", slug: "guerlain", country: "Frankreich", niche: false, featured: true, description: "Pariser Parfumhaus, gegründet 1828. Shalimar erschien 1925." },
  { name: "Narciso Rodriguez", slug: "narciso-rodriguez", country: "USA", niche: false, featured: false, description: "Amerikanischer Modedesigner. For Her erschien 2003." },
  { name: "Hermès", slug: "hermes", country: "Frankreich", niche: false, featured: false, description: "Pariser Maison, gegründet 1837. Terre d'Hermès erschien 2006." },
  { name: "Maison Francis Kurkdjian", slug: "maison-francis-kurkdjian", country: "Frankreich", niche: true, featured: true, description: "Pariser Parfumhaus, 2009 von Francis Kurkdjian und Marc Chaix gegründet." },
  { name: "Le Labo", slug: "le-labo", country: "USA", niche: true, featured: true, description: "Parfummanufaktur aus New York, gegründet 2006." },
  { name: "Byredo", slug: "byredo", country: "Schweden", niche: true, featured: true, description: "Parfumhaus aus Stockholm, 2006 von Ben Gorham gegründet." },
  { name: "Diptyque", slug: "diptyque", country: "Frankreich", niche: true, featured: false, description: "Pariser Maison, 1961 am Boulevard Saint-Germain gegründet." },
  { name: "Creed", slug: "creed", country: "Frankreich", niche: true, featured: false, description: "Parfumhaus mit Sitz in Paris." },
  { name: "Tom Ford", slug: "tom-ford", country: "USA", niche: true, featured: false, description: "Amerikanisches Modehaus. Zur Private-Blend-Kollektion gehören Oud Wood und Tobacco Vanille." },
  { name: "Frédéric Malle", slug: "frederic-malle", country: "Frankreich", niche: true, featured: false, description: "Éditions de Parfums Frédéric Malle, 2000 in Paris gegründet. Jeder Duft trägt den Namen seiner Parfümeurin oder seines Parfümeurs." },
  { name: "Juliette Has A Gun", slug: "juliette-has-a-gun", country: "Frankreich", niche: true, featured: false, description: "Pariser Parfumhaus, 2006 von Romano Ricci gegründet." },
  { name: "Acqua di Parma", slug: "acqua-di-parma", country: "Italien", niche: true, featured: false, description: "Italienisches Haus aus Parma. Die Colonia erschien 1916." },
  { name: "Parfums de Marly", slug: "parfums-de-marly", country: "Frankreich", niche: true, featured: false, description: "Parfumhaus aus Paris, gegründet 2009." },
];

export const DEMO_PRODUCTS: DemoProduct[] = [
  {
    brand: "dior", name: "Sauvage", slug: "dior-sauvage-eau-de-toilette", gender: "men", concentration: "edt",
    families: ["aromatic", "fresh"], top: ["Kalabrische Bergamotte", "Pfeffer"], heart: ["Sichuan-Pfeffer", "Lavendel", "Rosa Pfeffer", "Vetiver", "Geranie"], base: ["Ambroxan", "Zeder", "Labdanum"],
    character: ["frisch", "würzig"], seasons: ["Frühling", "Sommer"], occasions: ["Alltag", "Business"], intensity: 4,
    description: "Ein aromatisch-frischer Duft: kalabrische Bergamotte und Pfeffer über einer mineralischen Basis aus Ambroxan.",
    variants: [{ ml: 60, price: 8900, stock: 4 }, { ml: 100, price: 11900, stock: 0 }, { ml: 200, price: 16900, stock: 7 }],
    bestseller: true, featured: true, liquid: "#c9d7df", bottle: { shape: "tall-rect", cap: "black", glass: "#b9c8d4" }, createdDaysAgo: 400,
  },
  {
    brand: "dior", name: "J'adore", slug: "dior-jadore-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["floral", "fruity"], top: ["Birne", "Melone", "Bergamotte"], heart: ["Jasmin", "Rose", "Tuberose"], base: ["Moschus", "Vanille", "Zeder"],
    character: ["elegant", "pudrig"], seasons: ["Frühling", "Sommer"], occasions: ["Alltag", "Abend"], intensity: 3,
    description: "Ein weiches Blumenbouquet aus Jasmin, Rose und Tuberose mit fruchtigem Auftakt.",
    variants: [{ ml: 30, price: 7400, stock: 12 }, { ml: 50, price: 10500, stock: 9 }, { ml: 100, price: 15200, stock: 5 }],
    bestseller: true, liquid: "#ecd38b", bottle: { shape: "flask", cap: "gold" }, createdDaysAgo: 380,
  },
  {
    brand: "chanel", name: "Coco Mademoiselle", slug: "chanel-coco-mademoiselle-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["floral", "amber"], top: ["Orange", "Bergamotte", "Grapefruit"], heart: ["Rose", "Jasmin", "Litschi"], base: ["Patchouli", "Vetiver", "Vanille", "Moschus"],
    character: ["elegant", "frisch"], occasions: ["Business", "Abend"], intensity: 4,
    description: "Zitrischer Auftakt, ein Herz aus Rose und Jasmin, getragen von Patchouli und Vetiver.",
    variants: [{ ml: 35, price: 8900, stock: 6 }, { ml: 50, price: 11500, stock: 8 }, { ml: 100, price: 15900, stock: 3 }],
    bestseller: true, liquid: "#f0c6b6", bottle: { shape: "square", cap: "glass" }, createdDaysAgo: 370,
  },
  {
    brand: "chanel", name: "Bleu de Chanel", slug: "chanel-bleu-de-chanel-eau-de-parfum", gender: "men", concentration: "edp",
    families: ["woody", "aromatic"], top: ["Grapefruit", "Zitrone", "Minze", "Rosa Pfeffer"], heart: ["Ingwer", "Muskatnuss", "Jasmin"], base: ["Weihrauch", "Vetiver", "Zeder", "Sandelholz"],
    character: ["holzig", "frisch"], occasions: ["Business", "Alltag"], intensity: 4,
    description: "Holzig-aromatisch: Zitrusfrüchte und Minze öffnen, Zeder und Sandelholz tragen.",
    variants: [{ ml: 50, price: 10500, stock: 7 }, { ml: 100, price: 14500, stock: 6 }, { ml: 150, price: 18500, stock: 2 }],
    bestseller: true, liquid: "#8aa4c2", bottle: { shape: "tall-rect", cap: "black", glass: "#3f5a7a" }, createdDaysAgo: 360,
  },
  {
    brand: "yves-saint-laurent", name: "Libre", slug: "yves-saint-laurent-libre-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["floral", "amber"], top: ["Lavendel", "Mandarine", "Schwarze Johannisbeere"], heart: ["Orangenblüte", "Jasmin", "Lavendel"], base: ["Vanille", "Moschus", "Zeder", "Ambra"],
    character: ["warm", "elegant"], seasons: ["Herbst", "Winter"], occasions: ["Abend"], intensity: 4,
    description: "Lavendel und Orangenblüte auf warmer Vanille und Ambra.",
    variants: [{ ml: 30, price: 7200, stock: 10 }, { ml: 50, price: 9900, stock: 8 }, { ml: 90, price: 13900, stock: 4 }],
    isNew: false, liquid: "#e9c27a", bottle: { shape: "stepped", cap: "gold" }, createdDaysAgo: 300,
  },
  {
    brand: "giorgio-armani", name: "Acqua di Giò", slug: "giorgio-armani-acqua-di-gio-eau-de-toilette", gender: "men", concentration: "edt",
    families: ["fresh", "citrus"], top: ["Limette", "Zitrone", "Bergamotte", "Neroli"], heart: ["Meeresnoten", "Rosmarin", "Jasmin"], base: ["Weißer Moschus", "Zeder", "Patchouli"],
    character: ["aquatisch", "frisch"], seasons: ["Sommer"], occasions: ["Alltag"], intensity: 2,
    description: "Aquatisch und zitrisch, mit Meeresnoten und Rosmarin.",
    variants: [{ ml: 50, price: 6200, stock: 9 }, { ml: 100, price: 7900, compareAt: 9900, stock: 11 }, { ml: 200, price: 11900, stock: 0 }],
    liquid: "#d9e6e8", bottle: { shape: "round", cap: "silver", glass: "#dfe9ea" }, createdDaysAgo: 420,
  },
  {
    brand: "lancome", name: "La Vie Est Belle", slug: "lancome-la-vie-est-belle-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["gourmand", "floral"], top: ["Schwarze Johannisbeere", "Birne"], heart: ["Iris", "Jasmin", "Orangenblüte"], base: ["Praliné", "Vanille", "Patchouli", "Tonkabohne"],
    character: ["süß", "warm"], seasons: ["Herbst", "Winter"], occasions: ["Abend", "Date"], intensity: 4,
    description: "Iris und Jasmin, umhüllt von Praliné, Vanille und Tonkabohne.",
    variants: [{ ml: 30, price: 6400, stock: 8 }, { ml: 50, price: 8400, compareAt: 10500, stock: 6 }, { ml: 100, price: 13200, stock: 5 }],
    bestseller: true, liquid: "#f1c1c8", bottle: { shape: "square", cap: "black" }, createdDaysAgo: 390,
  },
  {
    brand: "hugo-boss", name: "Boss Bottled", slug: "hugo-boss-boss-bottled-eau-de-toilette", gender: "men", concentration: "edt",
    families: ["woody", "aromatic"], top: ["Apfel", "Pflaume", "Bergamotte", "Zitrone"], heart: ["Geranie", "Nelke", "Zimt"], base: ["Vanille", "Sandelholz", "Zeder", "Vetiver"],
    character: ["holzig", "würzig"], occasions: ["Business", "Alltag"], intensity: 3,
    description: "Apfel und Zimt über einer holzigen Basis aus Sandelholz und Vetiver.",
    variants: [{ ml: 50, price: 5400, stock: 14 }, { ml: 100, price: 6900, compareAt: 8900, stock: 9 }, { ml: 200, price: 9900, stock: 3 }],
    liquid: "#d6b98e", bottle: { shape: "cylinder", cap: "silver" }, createdDaysAgo: 450,
  },
  {
    brand: "prada", name: "Paradoxe", slug: "prada-paradoxe-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["floral", "amber"], top: ["Birne", "Bergamotte", "Mandarine"], heart: ["Neroli", "Jasmin"], base: ["Ambra", "Moschus", "Vanille"],
    character: ["warm", "cremig"], occasions: ["Alltag", "Abend"], intensity: 3,
    description: "Neroli und Jasmin, gerahmt von Ambra, Moschus und Vanille.",
    variants: [{ ml: 30, price: 7900, stock: 7 }, { ml: 50, price: 10900, stock: 5 }, { ml: 90, price: 14900, stock: 4 }],
    isNew: true, liquid: "#f3d5c3", bottle: { shape: "round", cap: "glass" }, createdDaysAgo: 20,
  },
  {
    brand: "jean-paul-gaultier", name: "Le Male", slug: "jean-paul-gaultier-le-male-eau-de-toilette", gender: "men", concentration: "edt",
    families: ["aromatic", "amber"], top: ["Lavendel", "Minze", "Kardamom", "Bergamotte"], heart: ["Zimt", "Orangenblüte", "Kümmel"], base: ["Vanille", "Tonkabohne", "Sandelholz", "Zeder"],
    character: ["süß", "würzig"], seasons: ["Herbst", "Winter"], intensity: 4,
    description: "Lavendel und Minze auf einer warmen Basis aus Vanille und Tonkabohne.",
    variants: [{ ml: 75, price: 7200, stock: 6 }, { ml: 125, price: 9400, stock: 5 }, { ml: 200, price: 11900, stock: 0 }],
    liquid: "#a8c4d6", bottle: { shape: "flask", cap: "silver", glass: "#9fb8cc" }, createdDaysAgo: 330,
  },
  {
    brand: "guerlain", name: "Shalimar", slug: "guerlain-shalimar-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["amber", "gourmand"], top: ["Bergamotte", "Zitrone", "Mandarine"], heart: ["Iris", "Jasmin", "Rose"], base: ["Vanille", "Tonkabohne", "Weihrauch", "Leder"],
    character: ["warm", "pudrig"], seasons: ["Herbst", "Winter"], occasions: ["Abend"], intensity: 5,
    description: "Bergamotte und Iris über einer Basis aus Vanille, Tonkabohne und Weihrauch.",
    variants: [{ ml: 30, price: 6900, stock: 5 }, { ml: 50, price: 9500, stock: 4 }, { ml: 90, price: 13500, stock: 2 }],
    featured: true, liquid: "#d9a860", bottle: { shape: "round", cap: "glass", glass: "#e8eef2" }, createdDaysAgo: 500,
  },
  {
    brand: "narciso-rodriguez", name: "For Her", slug: "narciso-rodriguez-for-her-eau-de-toilette", gender: "women", concentration: "edt",
    families: ["musk", "floral"], top: ["Osmanthus", "Orangenblüte", "Bergamotte"], heart: ["Moschus", "Ambra"], base: ["Vanille", "Vetiver", "Patchouli"],
    character: ["pudrig", "cremig"], occasions: ["Alltag", "Date"], intensity: 2,
    description: "Ein hautnaher Moschusduft mit Osmanthus und Orangenblüte.",
    variants: [{ ml: 30, price: 5200, stock: 10 }, { ml: 50, price: 6900, stock: 8 }, { ml: 100, price: 9600, stock: 6 }],
    liquid: "#ead8d2", bottle: { shape: "square", cap: "black", glass: "#2a2a2c" }, createdDaysAgo: 410,
  },
  {
    brand: "hermes", name: "Terre d'Hermès", slug: "hermes-terre-dhermes-eau-de-toilette", gender: "men", concentration: "edt",
    families: ["woody", "citrus"], top: ["Orange", "Grapefruit"], heart: ["Pfeffer", "Pelargonie", "Feuerstein"], base: ["Vetiver", "Zeder", "Benzoe", "Patchouli"],
    character: ["holzig", "frisch"], occasions: ["Business", "Alltag"], intensity: 3,
    description: "Orange und Grapefruit über mineralischem Vetiver und Zeder.",
    variants: [{ ml: 50, price: 7600, stock: 6 }, { ml: 100, price: 10400, stock: 7 }, { ml: 200, price: 14900, stock: 1 }],
    liquid: "#d99a55", bottle: { shape: "stepped", cap: "wood" }, createdDaysAgo: 440,
  },
  {
    brand: "maison-francis-kurkdjian", name: "Baccarat Rouge 540", slug: "maison-francis-kurkdjian-baccarat-rouge-540-eau-de-parfum", gender: "unisex", concentration: "edp",
    families: ["amber", "woody"], top: ["Safran", "Jasmin"], heart: ["Amberholz", "Ambergris"], base: ["Tannenharz", "Zeder"],
    character: ["warm", "süß"], seasons: ["Herbst", "Winter"], occasions: ["Abend", "Event"], intensity: 5,
    description: "Safran und Jasmin, getragen von Amberholz und Tannenharz. Leuchtend und lang anhaltend.",
    variants: [{ ml: 35, price: 18500, stock: 4 }, { ml: 70, price: 27500, stock: 3 }, { ml: 200, price: 58500, stock: 1 }],
    niche: true, bestseller: true, featured: true, liquid: "#e7b39a", bottle: { shape: "tall-rect", cap: "gold", glass: "#f3e7df" }, createdDaysAgo: 250,
  },
  {
    brand: "maison-francis-kurkdjian", name: "Aqua Universalis", slug: "maison-francis-kurkdjian-aqua-universalis-eau-de-toilette", gender: "unisex", concentration: "edt",
    families: ["fresh", "citrus"], top: ["Bergamotte", "Zitrone"], heart: ["Maiglöckchen", "Weiße Blüten"], base: ["Moschus", "Hölzer"],
    character: ["frisch"], seasons: ["Frühling", "Sommer"], occasions: ["Alltag"], intensity: 2,
    description: "Klar und sauber: Zitrusfrüchte, weiße Blüten und Moschus.",
    variants: [{ ml: 35, price: 11500, stock: 5 }, { ml: 70, price: 17500, stock: 4 }, { ml: 200, price: 32500, stock: 0 }],
    niche: true, isNew: true, liquid: "#e9eef0", bottle: { shape: "tall-rect", cap: "silver" }, createdDaysAgo: 14,
  },
  {
    brand: "le-labo", name: "Santal 33", slug: "le-labo-santal-33-eau-de-parfum", gender: "unisex", concentration: "edp",
    families: ["woody", "leather"], top: ["Veilchen", "Kardamom"], heart: ["Iris", "Ambrox"], base: ["Sandelholz", "Zeder", "Leder", "Papyrus"],
    character: ["holzig", "cremig"], occasions: ["Alltag", "Abend"], intensity: 4,
    description: "Australisches Sandelholz, Kardamom und Veilchen mit ledriger Tiefe.",
    variants: [{ ml: 50, price: 23500, stock: 5 }, { ml: 100, price: 32500, stock: 3 }],
    niche: true, bestseller: true, featured: true, liquid: "#e6d6b8", bottle: { shape: "cylinder", cap: "black", glass: "#eef1f0" }, createdDaysAgo: 260,
  },
  {
    brand: "byredo", name: "Gypsy Water", slug: "byredo-gypsy-water-eau-de-parfum", gender: "unisex", concentration: "edp",
    families: ["woody", "aromatic"], top: ["Bergamotte", "Zitrone", "Pfeffer", "Wacholder"], heart: ["Weihrauch", "Kiefernnadeln", "Iris"], base: ["Amber", "Vanille", "Sandelholz"],
    character: ["holzig", "frisch"], occasions: ["Alltag"], intensity: 3,
    description: "Kiefernnadeln, Weihrauch und Wacholder über sanfter Vanille.",
    variants: [{ ml: 50, price: 15900, stock: 6 }, { ml: 100, price: 22900, stock: 4 }],
    niche: true, featured: true, liquid: "#f0ecdf", bottle: { shape: "cylinder", cap: "black" }, createdDaysAgo: 230,
  },
  {
    brand: "byredo", name: "Bal d'Afrique", slug: "byredo-bal-dafrique-eau-de-parfum", gender: "unisex", concentration: "edp",
    families: ["floral", "woody"], top: ["Bergamotte", "Zitrone", "Neroli", "Tagetes"], heart: ["Veilchen", "Jasmin", "Alpenveilchen"], base: ["Vetiver", "Moschus", "Zeder", "Amber"],
    character: ["warm", "elegant"], intensity: 3,
    description: "Tagetes und Neroli, dann Veilchen und Jasmin auf Vetiver und Moschus.",
    variants: [{ ml: 50, price: 15900, stock: 3 }, { ml: 100, price: 22900, stock: 0 }],
    niche: true, isNew: true, liquid: "#f1e2b0", bottle: { shape: "cylinder", cap: "black" }, createdDaysAgo: 25,
  },
  {
    brand: "diptyque", name: "Philosykos", slug: "diptyque-philosykos-eau-de-toilette", gender: "unisex", concentration: "edt",
    families: ["fresh", "woody"], top: ["Feigenblatt", "Feige"], heart: ["Grüne Noten", "Kokos"], base: ["Zeder", "Feigenholz"],
    character: ["frisch", "cremig"], seasons: ["Frühling", "Sommer"], intensity: 2,
    description: "Das Grün eines Feigenbaums: Blatt, Frucht und Holz.",
    variants: [{ ml: 50, price: 9800, stock: 6 }, { ml: 100, price: 14200, stock: 5 }],
    niche: true, liquid: "#dfe4c8", bottle: { shape: "flask", cap: "black" }, createdDaysAgo: 280,
  },
  {
    brand: "creed", name: "Aventus", slug: "creed-aventus-eau-de-parfum", gender: "men", concentration: "edp",
    families: ["fruity", "woody"], top: ["Ananas", "Bergamotte", "Schwarze Johannisbeere", "Apfel"], heart: ["Birke", "Patchouli", "Jasmin", "Rose"], base: ["Moschus", "Eichenmoos", "Ambra", "Vanille"],
    character: ["frisch", "holzig"], occasions: ["Business", "Event"], intensity: 4,
    description: "Ananas und Bergamotte über rauchiger Birke und Eichenmoos.",
    variants: [{ ml: 50, price: 23500, stock: 4 }, { ml: 100, price: 33500, stock: 2 }],
    niche: true, featured: true, liquid: "#e8e2d4", bottle: { shape: "cylinder", cap: "silver", glass: "#2d3a33" }, createdDaysAgo: 270,
  },
  {
    brand: "tom-ford", name: "Oud Wood", slug: "tom-ford-oud-wood-eau-de-parfum", gender: "unisex", concentration: "edp",
    families: ["woody", "amber"], top: ["Palisander", "Kardamom", "Sichuan-Pfeffer"], heart: ["Oud", "Sandelholz", "Vetiver"], base: ["Tonkabohne", "Vanille", "Ambra"],
    character: ["holzig", "dunkel"], seasons: ["Herbst", "Winter"], occasions: ["Abend"], intensity: 4,
    description: "Oud und Sandelholz mit Kardamom, abgerundet von Tonkabohne und Ambra.",
    variants: [{ ml: 30, price: 16900, stock: 4 }, { ml: 50, price: 24900, stock: 3 }, { ml: 100, price: 35900, stock: 2 }],
    niche: true, liquid: "#b98b55", bottle: { shape: "square", cap: "black", glass: "#3a2b22" }, createdDaysAgo: 310,
  },
  {
    brand: "tom-ford", name: "Tobacco Vanille", slug: "tom-ford-tobacco-vanille-eau-de-parfum", gender: "unisex", concentration: "edp",
    families: ["amber", "gourmand"], top: ["Tabakblatt", "Gewürze"], heart: ["Tonkabohne", "Tabakblüte", "Vanille", "Kakao"], base: ["Trockenfrüchte", "Hölzer"],
    character: ["warm", "süß", "würzig"], seasons: ["Winter"], occasions: ["Abend"], intensity: 5,
    description: "Tabakblatt und Gewürze, dann Vanille, Kakao und Tonkabohne.",
    variants: [{ ml: 30, price: 16900, stock: 3 }, { ml: 50, price: 24900, stock: 0 }, { ml: 100, price: 35900, stock: 2 }],
    niche: true, liquid: "#a8672f", bottle: { shape: "square", cap: "black", glass: "#4a2e1c" }, createdDaysAgo: 320,
  },
  {
    brand: "frederic-malle", name: "Portrait of a Lady", slug: "frederic-malle-portrait-of-a-lady-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["floral", "amber"], top: ["Rose", "Himbeere", "Schwarze Johannisbeere", "Nelke"], heart: ["Patchouli", "Weihrauch"], base: ["Sandelholz", "Moschus", "Benzoe"],
    character: ["dunkel", "würzig", "elegant"], seasons: ["Herbst", "Winter"], occasions: ["Abend", "Event"], intensity: 5,
    description: "Türkische Rose und Himbeere, vertieft durch Patchouli und Weihrauch.",
    variants: [{ ml: 50, price: 26500, stock: 3 }, { ml: 100, price: 38500, stock: 2 }],
    niche: true, featured: true, liquid: "#b2454f", bottle: { shape: "tall-rect", cap: "black" }, createdDaysAgo: 340,
  },
  {
    brand: "juliette-has-a-gun", name: "Not a Perfume", slug: "juliette-has-a-gun-not-a-perfume-eau-de-parfum", gender: "unisex", concentration: "edp",
    families: ["musk"], top: [], heart: [], base: ["Ambroxan"],
    character: ["pudrig"], occasions: ["Alltag"], intensity: 1,
    description: "Ein Duft aus einer einzigen Note: Ambroxan. Hautnah und transparent.",
    variants: [{ ml: 50, price: 7900, stock: 9 }, { ml: 100, price: 11500, stock: 6 }],
    niche: true, liquid: "#f4efe6", bottle: { shape: "square", cap: "silver" }, createdDaysAgo: 200,
  },
  {
    brand: "acqua-di-parma", name: "Colonia", slug: "acqua-di-parma-colonia-eau-de-cologne", gender: "unisex", concentration: "edc",
    families: ["citrus", "aromatic"], top: ["Zitrone", "Orange", "Bergamotte", "Lavendel", "Rosmarin"], heart: ["Rose", "Verbene", "Lavendel"], base: ["Vetiver", "Sandelholz", "Patchouli"],
    character: ["frisch"], seasons: ["Frühling", "Sommer"], occasions: ["Alltag", "Business"], intensity: 2,
    description: "Sizilianische Zitrusfrüchte, Lavendel und Rosmarin: die klassische italienische Colonia.",
    variants: [{ ml: 50, price: 7800, stock: 7 }, { ml: 100, price: 11200, compareAt: 12900, stock: 5 }, { ml: 180, price: 15900, stock: 3 }],
    niche: true, liquid: "#f1dc8f", bottle: { shape: "stepped", cap: "black" }, createdDaysAgo: 460,
  },
  {
    brand: "parfums-de-marly", name: "Delina", slug: "parfums-de-marly-delina-eau-de-parfum", gender: "women", concentration: "edp",
    families: ["floral", "fruity"], top: ["Litschi", "Rhabarber", "Bergamotte", "Muskatnuss"], heart: ["Türkische Rose", "Pfingstrose", "Vanille"], base: ["Kaschmirholz", "Weihrauch", "Vetiver"],
    character: ["süß", "elegant"], seasons: ["Frühling"], occasions: ["Date", "Event"], intensity: 4,
    description: "Türkische Rose und Pfingstrose mit Litschi und Rhabarber.",
    variants: [{ ml: 30, price: 13500, stock: 5 }, { ml: 75, price: 25500, stock: 4 }],
    niche: true, isNew: true, liquid: "#f2c3cf", bottle: { shape: "flask", cap: "gold" }, createdDaysAgo: 9,
  },
];

export const DEMO_SAMPLES = [
  { product: "maison-francis-kurkdjian-baccarat-rouge-540-eau-de-parfum", stock: 60 },
  { product: "le-labo-santal-33-eau-de-parfum", stock: 40 },
  { product: "byredo-gypsy-water-eau-de-parfum", stock: 35 },
  { product: "parfums-de-marly-delina-eau-de-parfum", stock: 30 },
  { product: "tom-ford-oud-wood-eau-de-parfum", stock: 0 },
  { product: "frederic-malle-portrait-of-a-lady-eau-de-parfum", stock: 25 },
];

export const DEMO_COUPONS = [
  { code: "WILLKOMMEN10", description: "Demo-Gutschein: 10 % ab 50 € Warenwert", type: "percent" as const, value: 10, minSubtotalCents: 5000 },
  { code: "NISCHE20", description: "Demo-Gutschein: 20 € auf Nischendüfte ab 150 €", type: "fixed" as const, value: 2000, minSubtotalCents: 15000, niche: true },
];
