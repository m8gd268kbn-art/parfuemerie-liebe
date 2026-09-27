"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Price } from "@/components/ui/price";
import { Stars } from "@/components/ui/stars";
import { concentrationLabel } from "@/config/catalog";
import { useShop } from "@/features/shop/shop-provider";
import { formatPercentOff, formatSize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductCardDTO } from "@/types/catalog";
import { WishButton } from "./wish-button";

export const CARD_IMAGE_SIZES = "(min-width: 1280px) 22vw, (min-width: 768px) 31vw, 48vw";

function badgesFor(p: ProductCardDTO) {
  const out: { label: string; tone: "neutral" | "sale" | "accent" }[] = [];
  const sale = p.variants.find((v) => v.compareAtPriceCents);
  if (sale?.compareAtPriceCents) out.push({ label: formatPercentOff(sale.priceCents, sale.compareAtPriceCents), tone: "sale" });
  if (p.isNew) out.push({ label: "Neu", tone: "neutral" });
  else if (p.bestseller) out.push({ label: "Bestseller", tone: "neutral" });
  if (p.exclusive && out.length < 2) out.push({ label: "Exklusiv", tone: "accent" });
  return out.slice(0, 2);
}

/**
 * Produktkarte: Das Bild trägt die Karte. Hover (nur Maus) blendet die Seitenansicht ein und
 * öffnet die Schnellauswahl der Größen; per Tastatur über focus-within erreichbar.
 */
export function ProductCard({ product, priority, headingLevel = "h3" }: { product: ProductCardDTO; priority?: boolean; headingLevel?: "h2" | "h3" }) {
  const { addToCart } = useShop();
  const [adding, setAdding] = useState<string | null>(null);
  const primary = product.images[0];
  const secondary = product.images.find((i) => i.kind === "side") ?? product.images[1];
  const href = `/produkt/${product.slug}`;
  const multiple = product.variants.length > 1;
  const cheapest = product.variants.reduce((a, b) => (b.priceCents < a.priceCents ? b : a), product.variants[0]);
  const badges = badgesFor(product);
  const Heading = headingLevel;

  const quickAdd = async (variantId: string) => {
    setAdding(variantId);
    await addToCart(variantId, 1, { name: product.name });
    setAdding(null);
  };

  return (
    <article className="group/card relative flex flex-col">
      <div className="relative">
        <Link href={href} tabIndex={-1} aria-hidden="true" className="relative block aspect-[4/5] overflow-hidden bg-porcelain">
          {primary && (
            <Image
              src={primary.url}
              alt=""
              fill
              priority={priority}
              sizes={CARD_IMAGE_SIZES}
              className="object-cover transition-[transform,opacity] duration-700 ease-out group-hover/card:scale-[1.025]"
            />
          )}
          {secondary && (
            <Image
              src={secondary.url}
              alt=""
              fill
              sizes={CARD_IMAGE_SIZES}
              className="object-cover opacity-0 transition-opacity duration-500 ease-out [@media(hover:hover)]:group-hover/card:opacity-100"
            />
          )}
          {!product.inStock && (
            <span className="absolute inset-x-0 bottom-0 bg-paper/85 py-2 text-center text-caption text-ink-soft">Derzeit ausverkauft</span>
          )}
        </Link>

        {badges.length > 0 && (
          <div className="pointer-events-none absolute top-3 left-3 flex flex-col items-start gap-1.5">
            {badges.map((b) => (
              <Badge key={b.label} tone={b.tone}>
                {b.label}
              </Badge>
            ))}
          </div>
        )}

        <WishButton productId={product.id} name={product.name} className="absolute top-1.5 right-1.5" />

        {product.inStock && (
          <div
            className={cn(
              "absolute inset-x-3 bottom-3 z-10 hidden translate-y-2 flex-col gap-2 rounded-sm bg-paper p-3 opacity-0 shadow-popover",
              "transition-[opacity,transform] duration-200 ease-out",
              "[@media(hover:hover)_and_(pointer:fine)]:flex group-hover/card:translate-y-0 group-hover/card:opacity-100 focus-within:translate-y-0 focus-within:opacity-100",
            )}
          >
            <p className="label text-[0.6875rem] text-muted">{multiple ? "Größe wählen" : "Schnell hinzufügen"}</p>
            <div className="flex flex-wrap gap-1.5">
              {product.variants.map((v) => (
                <button
                  key={v.id}
                  type="button"
                  disabled={v.stock <= 0 || adding !== null}
                  onClick={() => quickAdd(v.id)}
                  aria-label={`${formatSize(v.sizeMl, v.displaySize)} in den Warenkorb${v.stock <= 0 ? ", ausverkauft" : ""}`}
                  className={cn(
                    "numeric h-9 min-w-14 rounded-sm border px-2.5 text-caption font-medium transition-[border-color,background-color,color] duration-150 press",
                    v.stock <= 0
                      ? "border-line text-muted line-through"
                      : "border-line-strong bg-white text-ink hover:border-accent hover:bg-accent hover:text-white",
                    adding === v.id && "border-accent bg-accent text-white",
                  )}
                >
                  {formatSize(v.sizeMl, v.displaySize)}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-1">
        <p className="label text-[0.6875rem] text-muted">{product.brand.name}</p>
        <Heading className="font-display text-[1.25rem] leading-[1.2] tracking-[-0.005em]">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none [&:focus-visible]:after:outline-2 [&:focus-visible]:after:outline-offset-4 [&:focus-visible]:after:outline-accent">
            {product.name}
          </Link>
        </Heading>
        <p className="text-caption text-ink-soft">
          {concentrationLabel(product.concentration)}
          {product.variants.length > 0 && (
            <span className="text-muted">
              {" "}
              · {product.variants.map((v) => formatSize(v.sizeMl, v.displaySize).replace(" ml", "")).join(", ")} ml
            </span>
          )}
        </p>
        {product.ratingCount > 0 && product.ratingAvg != null && (
          <p className="mt-1 flex items-center gap-2 text-caption text-ink-soft">
            <Stars value={product.ratingAvg} size={11} />
            <span className="numeric">({product.ratingCount})</span>
          </p>
        )}
        <Price className="mt-2" cents={cheapest.priceCents} compareAtCents={cheapest.compareAtPriceCents} from={multiple && product.minPriceCents !== product.maxPriceCents} />
      </div>
    </article>
  );
}
