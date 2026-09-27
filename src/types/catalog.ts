import type { Concentration, Gender } from "@/config/catalog";

export type BrandRef = { id: string; name: string; slug: string };

export type ImageDTO = {
  id: string;
  url: string;
  alt: string;
  kind: "front" | "back" | "side" | "packaging" | "detail" | "lifestyle";
  width: number | null;
  height: number | null;
  variantId: string | null;
};

export type VariantDTO = {
  id: string;
  sizeMl: number;
  displaySize: string | null;
  sku: string;
  ean: string | null;
  priceCents: number;
  compareAtPriceCents: number | null;
  /** Niedrigster Preis der letzten 30 Tage vor der aktuellen Reduzierung (§ 11 PAngV). */
  lowestPrice30dCents: number | null;
  stock: number;
};

/** Kompakte Produktdarstellung für Listen, Suche und Filter (JSON-serialisierbar für den Cache). */
export type ProductCardDTO = {
  id: string;
  slug: string;
  name: string;
  brand: BrandRef;
  brandNiche: boolean;
  concentration: Concentration;
  gender: Gender;
  families: string[];
  notes: string[];
  character: string[];
  seasons: string[];
  occasions: string[];
  intensity: number | null;
  niche: boolean;
  isNew: boolean;
  bestseller: boolean;
  exclusive: boolean;
  featured: boolean;
  liquidColor: string | null;
  images: ImageDTO[];
  variants: VariantDTO[];
  minPriceCents: number;
  maxPriceCents: number;
  onSale: boolean;
  inStock: boolean;
  popularity: number;
  ratingAvg: number | null;
  ratingCount: number;
  createdAt: string;
  categoryIds: string[];
};

export type ProductDetailDTO = ProductCardDTO & {
  description: string | null;
  topNotes: string[];
  heartNotes: string[];
  baseNotes: string[];
  ingredients: string | null;
  usage: string | null;
  manufacturerInfo: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
  updatedAt: string;
  isDemo: boolean;
};

export type BrandDTO = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  story: string | null;
  logoUrl: string | null;
  heroImageUrl: string | null;
  country: string | null;
  featured: boolean;
  niche: boolean;
  productCount: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type CategoryDTO = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  heroImageUrl: string | null;
  rule: {
    gender?: Gender[];
    niche?: boolean;
    isNew?: boolean;
    bestseller?: boolean;
    onSale?: boolean;
    manual?: boolean;
  };
  showInNav: boolean;
  sortOrder: number;
  seoTitle: string | null;
  seoDescription: string | null;
};

export type SampleDTO = {
  id: string;
  brandName: string;
  name: string;
  imageUrl: string | null;
  sizeLabel: string;
  available: boolean;
  productSlug: string | null;
};

export type ReviewDTO = {
  id: string;
  authorName: string;
  rating: number;
  title: string | null;
  body: string;
  longevity: number | null;
  sillage: number | null;
  value: number | null;
  verifiedPurchase: boolean;
  createdAt: string;
};
