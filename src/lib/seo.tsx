import type { ShopSettings } from "@/lib/settings-schema";
import type { ProductDetailDTO, ReviewDTO } from "@/types/catalog";
import { concentrationLabel } from "@/config/catalog";

export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export function absoluteUrl(path: string) {
  return path.startsWith("http") ? path : `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
}

/** Strukturierte Daten; `<` wird maskiert, damit kein Script-Breakout möglich ist. */
export function JsonLd({ data }: { data: unknown }) {
  if (!data) return null;
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }} />;
}

export function organizationJsonLd(settings: ShopSettings) {
  const sameAs = Object.values(settings.social).filter(Boolean);
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: settings.store.name,
    url: SITE_URL,
    ...(sameAs.length ? { sameAs } : {}),
    ...(settings.store.email ? { email: settings.store.email } : {}),
    ...(settings.store.phone ? { telephone: settings.store.phone } : {}),
  };
}

/** LocalBusiness nur mit echten Daten (Adresse vorhanden), sonst nichts ausgeben. */
export function localBusinessJsonLd(settings: ShopSettings) {
  const s = settings.store;
  if (!s.street || !s.postalCode) return null;
  const hours = s.openingHours.filter((o) => o.hours);
  return {
    "@context": "https://schema.org",
    "@type": "Store",
    name: s.name,
    url: absoluteUrl("/parfuemerie"),
    address: { "@type": "PostalAddress", streetAddress: s.street, postalCode: s.postalCode, addressLocality: s.city, addressCountry: "DE" },
    ...(s.phone ? { telephone: s.phone } : {}),
    ...(s.imageUrl ? { image: absoluteUrl(s.imageUrl) } : {}),
    ...(hours.length ? { openingHours: hours.map((o) => `${o.day} ${o.hours}`) } : {}),
  };
}

export function breadcrumbJsonLd(items: { label: string; href?: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.label,
      ...(item.href ? { item: absoluteUrl(item.href) } : {}),
    })),
  };
}

export function productJsonLd(p: ProductDetailDTO, reviews: ReviewDTO[]) {
  const offers = p.variants.map((v) => ({
    "@type": "Offer",
    sku: v.sku,
    ...(v.ean ? { gtin13: v.ean } : {}),
    name: `${p.name} ${v.displaySize ?? `${v.sizeMl} ml`}`,
    price: (v.priceCents / 100).toFixed(2),
    priceCurrency: "EUR",
    availability: v.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    url: absoluteUrl(`/produkt/${p.slug}`),
    itemCondition: "https://schema.org/NewCondition",
  }));
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    name: `${p.brand.name} ${p.name} ${concentrationLabel(p.concentration)}`,
    brand: { "@type": "Brand", name: p.brand.name },
    description: p.description ?? undefined,
    image: p.images.map((i) => absoluteUrl(i.url)),
    sku: p.variants[0]?.sku,
    offers:
      offers.length === 1
        ? offers[0]
        : {
            "@type": "AggregateOffer",
            priceCurrency: "EUR",
            lowPrice: (p.minPriceCents / 100).toFixed(2),
            highPrice: (p.maxPriceCents / 100).toFixed(2),
            offerCount: offers.length,
            offers,
          },
    ...(p.ratingCount > 0 && p.ratingAvg != null
      ? {
          aggregateRating: { "@type": "AggregateRating", ratingValue: p.ratingAvg, reviewCount: p.ratingCount },
          review: reviews.slice(0, 5).map((r) => ({
            "@type": "Review",
            author: { "@type": "Person", name: r.authorName },
            reviewRating: { "@type": "Rating", ratingValue: r.rating, bestRating: 5 },
            reviewBody: r.body,
            datePublished: r.createdAt.slice(0, 10),
          })),
        }
      : {}),
  };
}
