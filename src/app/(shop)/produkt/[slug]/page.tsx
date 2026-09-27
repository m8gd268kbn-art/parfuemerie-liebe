import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Accordion, AccordionItem } from "@/components/ui/accordion";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { Placeholder } from "@/components/ui/placeholder";
import { Stars } from "@/components/ui/stars";
import { concentrationLabel, GENDERS } from "@/config/catalog";
import { ProductRow } from "@/features/home/sections";
import { BuyBox } from "@/features/product/buy-box";
import { ProductGallery } from "@/features/product/gallery";
import { Reviews } from "@/features/product/reviews";
import { NoteLayers, ScentFacts } from "@/features/product/scent-profile";
import { RecentlyViewedRow } from "@/features/product/recently-viewed-row";
import { defaultMethod } from "@/lib/commerce/shipping";
import { breadcrumbJsonLd, JsonLd, productJsonLd } from "@/lib/seo";
import { getApprovedReviews, getProductDetail, getRecommendations } from "@/services/catalog";
import { availablePaymentMethods } from "@/services/payments";
import { getSettings } from "@/services/settings";

type Props = { params: Promise<{ slug: string }> };

export const revalidate = 3600;
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProductDetail((await params).slug);
  if (!product) return {};
  const title = product.seoTitle ?? `${product.brand.name} ${product.name} ${concentrationLabel(product.concentration)}`;
  const description =
    product.seoDescription ?? `${product.brand.name} ${product.name}: ${product.description ?? "jetzt online bei der Parfümerie Liebe in Hannover."}`.slice(0, 158);
  return {
    title,
    description,
    alternates: { canonical: `/produkt/${product.slug}` },
    openGraph: { title, description, images: product.images.slice(0, 1).map((i) => ({ url: i.url, alt: i.alt })) },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  const product = await getProductDetail(slug);
  if (!product) notFound();
  const [settings, reviews, recs] = await Promise.all([getSettings(), getApprovedReviews(product.id), getRecommendations(product)]);
  const method = defaultMethod(settings);
  const gender = GENDERS.find((g) => g.key === product.gender)!;
  const crumbs = [
    { label: "Startseite", href: "/" },
    { label: gender.label, href: `/${gender.slug}` },
    { label: product.brand.name, href: `/marken/${product.brand.slug}` },
    { label: product.name, href: `/produkt/${product.slug}` },
  ];

  return (
    <>
      <JsonLd data={productJsonLd(product, reviews)} />
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <div className="container-page pt-6 pb-10 md:pt-8">
        <Breadcrumbs items={crumbs} className="mb-6" />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          <div className="md:col-span-7">
            <ProductGallery images={product.images} name={`${product.brand.name} ${product.name}`} />
          </div>
          <div className="md:col-span-5">
            <div className="md:sticky md:top-[calc(var(--header-height)+1.5rem)]">
              <Link href={`/marken/${product.brand.slug}`} className="label text-muted transition-colors hover:text-ink">
                {product.brand.name}
              </Link>
              <h1 className="mt-3 font-display text-h1">{product.name}</h1>
              <p className="mt-2 text-body text-ink-soft">
                {concentrationLabel(product.concentration)}, {gender.label}
                {product.niche && <span className="text-muted"> · Nischenduft</span>}
              </p>
              {product.ratingCount > 0 && product.ratingAvg != null && (
                <a href="#bewertungen" className="mt-3 inline-flex items-center gap-2 text-caption text-ink-soft">
                  <Stars value={product.ratingAvg} />
                  <span className="numeric link-underline">{product.ratingCount} Bewertungen</span>
                </a>
              )}
              <div className="mt-8">
                <BuyBox
                  product={product}
                  info={{
                    deliveryTime: method?.deliveryTime ?? null,
                    shippingPriceCents: method?.priceCents ?? null,
                    freeFromCents: method?.freeFromCents ?? null,
                    returnsSummary: settings.returns.summary,
                    paymentLabels: availablePaymentMethods(settings).map((m) => m.short),
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <section aria-labelledby="notes-title" className="container-page section-space">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12 md:gap-8 lg:gap-12">
          <div className="md:col-span-7">
            <h2 id="notes-title" className="mb-8 font-display text-h2">
              Duftnoten
            </h2>
            <NoteLayers product={product} />
          </div>
          <div className="md:col-span-5 md:pt-[4.5rem]">
            <ScentFacts product={product} />
          </div>
        </div>
      </section>

      <section aria-label="Produktinformationen" className="container-page pb-[var(--section-space)]">
        <div className="max-w-3xl">
          <Accordion defaultValue={["duft"]}>
            <AccordionItem value="duft" title="Der Duft">
              <p className="max-w-[65ch]">{product.description ?? "Eine Beschreibung folgt."}</p>
            </AccordionItem>
            <AccordionItem value="anwendung" title="Anwendung">
              <p className="max-w-[65ch]">{product.usage ?? "Auf Puls- und Halspartien sprühen."}</p>
            </AccordionItem>
            <AccordionItem value="inhaltsstoffe" title="Inhaltsstoffe">
              {product.ingredients ? <p className="max-w-[65ch] text-small">{product.ingredients}</p> : <Placeholder>Liste der Inhaltsstoffe (INCI)</Placeholder>}
            </AccordionItem>
            <AccordionItem value="hersteller" title="Herstellerinformationen">
              {product.manufacturerInfo ? <p className="max-w-[65ch] whitespace-pre-line">{product.manufacturerInfo}</p> : <Placeholder>Name und Anschrift des Herstellers</Placeholder>}
            </AccordionItem>
            <AccordionItem value="versand" title="Versand und Rückgabe">
              <p className="max-w-[65ch]">
                {method ? `${method.name}${method.carrier ? ` mit ${method.carrier}` : ""}, Lieferzeit ${method.deliveryTime}. ` : ""}
                {settings.returns.summary}{" "}
                <Link href="/versand" className="link-underline">
                  Versandinformationen
                </Link>
              </p>
            </AccordionItem>
          </Accordion>
        </div>
      </section>

      <div className="container-page pb-[var(--section-space)]">
        <Reviews productId={product.id} productName={product.name} reviews={reviews} avg={product.ratingAvg} />
      </div>

      <div className="border-t border-line">
        <ProductRow id="also-title" title="Das könnte Ihnen auch gefallen" href={`/${gender.slug}`} linkLabel={`Mehr ${gender.plural}`} products={recs.alsoLike} />
        <ProductRow id="similar-title" title="Ähnliche Düfte" href={`/parfum?family=${product.families[0] ?? ""}`} linkLabel="Gleiche Duftfamilie" products={recs.similar} />
        <ProductRow id="brand-title" title={`Mehr von ${product.brand.name}`} href={`/marken/${product.brand.slug}`} linkLabel={`Alle Düfte von ${product.brand.name}`} products={recs.sameBrand} />
        <RecentlyViewedRow excludeId={product.id} />
      </div>
    </>
  );
}
