"use client";

import { ArrowCounterClockwise, CreditCard, Storefront, Truck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Price } from "@/components/ui/price";
import { QuantityStepper } from "@/components/ui/quantity";
import { WishButton } from "@/features/catalog/wish-button";
import { rememberViewed } from "@/features/search/recently-viewed";
import { track } from "@/features/consent/analytics";
import { useShop } from "@/features/shop/shop-provider";
import { formatPrice, formatSize } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ProductDetailDTO, VariantDTO } from "@/types/catalog";

export type BuyBoxInfo = {
  deliveryTime: string | null;
  shippingPriceCents: number | null;
  freeFromCents: number | null;
  returnsSummary: string;
  paymentLabels: string[];
};

/** Flakon-Silhouette: Höhe nach Volumen, Füllstand in der Farbe des Dufts. */
function FlaconGlyph({ ml, maxMl, color, selected, soldOut }: { ml: number; maxMl: number; color: string; selected: boolean; soldOut: boolean }) {
  const h = 22 + 22 * Math.cbrt(ml / maxMl);
  const w = 16 + 8 * Math.cbrt(ml / maxMl);
  return (
    <svg width="34" height="48" viewBox="0 0 34 48" aria-hidden="true" className="overflow-visible">
      <g transform={`translate(${(34 - w) / 2} ${48 - h})`}>
        <rect x={w / 2 - 3} y={0} width={6} height={5} rx={1} className={selected ? "fill-ink" : "fill-line-strong"} />
        <rect x={0.5} y={6} width={w - 1} height={h - 6.5} rx={2.5} fill="none" stroke="currentColor" strokeWidth="1" strokeDasharray={soldOut ? "2 2" : undefined} className={selected ? "text-ink" : "text-line-strong"} />
        <rect
          x={2.5}
          y={10}
          width={w - 5}
          height={h - 12.5}
          rx={1.5}
          fill={color}
          className="origin-bottom transition-transform duration-500 ease-out [transform-box:fill-box]"
          style={{ transform: `scaleY(${selected ? 1 : soldOut ? 0 : 0.18})` }}
        />
      </g>
    </svg>
  );
}

function stockText(v: VariantDTO) {
  if (v.stock <= 0) return { text: "Diese Größe ist derzeit ausverkauft.", tone: "text-danger" };
  if (v.stock <= 3) return { text: `Auf Lager, nur noch ${v.stock} Stück.`, tone: "text-ink" };
  return { text: "Auf Lager.", tone: "text-accent" };
}

export function BuyBox({ product, info }: { product: ProductDetailDTO; info: BuyBoxInfo }) {
  const { addToCart } = useShop();
  const firstAvailable = product.variants.find((v) => v.stock > 0) ?? product.variants[0];
  const [variantId, setVariantId] = useState(firstAvailable.id);
  const [qty, setQty] = useState(1);
  const [state, setState] = useState<"idle" | "adding" | "added">("idle");
  const buttonRef = useRef<HTMLDivElement>(null);
  const [showSticky, setShowSticky] = useState(false);
  const variant = product.variants.find((v) => v.id === variantId) ?? firstAvailable;
  const maxMl = Math.max(...product.variants.map((v) => v.sizeMl));
  const color = product.liquidColor ?? "#d8cec3";
  const stock = stockText(variant);

  useEffect(() => {
    rememberViewed({ id: product.id, slug: product.slug, name: product.name, brand: product.brand.name, image: product.images[0]?.url ?? null });
    track("product_view", { product: product.slug });
  }, [product]);

  useEffect(() => {
    const el = buttonRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => setShowSticky(!e.isIntersecting && e.boundingClientRect.top < 0));
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const add = async () => {
    setState("adding");
    const ok = await addToCart(variant.id, qty, { name: product.name });
    setState(ok ? "added" : "idle");
    if (ok) setTimeout(() => setState("idle"), 1800);
  };

  const label = state === "added" ? "Im Warenkorb" : variant.stock > 0 ? "In den Warenkorb" : "Ausverkauft";

  return (
    <div className="flex flex-col gap-7">
      <Price
        size="lg"
        cents={variant.priceCents}
        compareAtCents={variant.compareAtPriceCents}
        lowest30dCents={variant.lowestPrice30dCents}
        unit={{ sizeMl: variant.sizeMl }}
      />

      <fieldset>
        <legend className="mb-3 flex w-full items-baseline justify-between text-small">
          <span className="font-semibold">Größe</span>
          <span className="text-ink-soft">{formatSize(variant.sizeMl, variant.displaySize)}</span>
        </legend>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
          {product.variants.map((v) => {
            const selected = v.id === variant.id;
            const soldOut = v.stock <= 0;
            return (
              <label
                key={v.id}
                className={cn(
                  "group relative flex cursor-pointer flex-col items-center gap-2 rounded-sm border bg-white px-2 pt-3 pb-2.5 text-center transition-[border-color,box-shadow] duration-150 press",
                  selected ? "border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-line hover:border-line-strong",
                )}
              >
                <input
                  type="radio"
                  name="variant"
                  value={v.id}
                  checked={selected}
                  onChange={() => {
                    setVariantId(v.id);
                    setQty(1);
                  }}
                  className="peer sr-only"
                />
                <FlaconGlyph ml={v.sizeMl} maxMl={maxMl} color={color} selected={selected} soldOut={soldOut} />
                <span className={cn("numeric text-small font-medium", soldOut && "text-muted line-through")}>{formatSize(v.sizeMl, v.displaySize)}</span>
                <span className="numeric text-caption text-ink-soft">{soldOut ? "ausverkauft" : formatPrice(v.priceCents)}</span>
                <span className="pointer-events-none absolute inset-0 rounded-sm peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-accent" />
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="flex flex-col gap-3">
        <p className={cn("text-small", stock.tone)} aria-live="polite">
          {stock.text}
          {variant.stock > 0 && info.deliveryTime && <span className="text-ink-soft"> Lieferzeit: {info.deliveryTime}.</span>}
        </p>
        {/* Container-Query: In schmalen Spalten (Tablet) steht der Knopf in eigener Zeile, nie abgeschnitten. */}
        <div ref={buttonRef} className="@container">
          <div className="flex flex-wrap gap-2">
            {variant.stock > 1 && (
              <QuantityStepper value={qty} max={Math.min(variant.stock, 10)} onChange={(n) => setQty(Math.max(1, n))} label="Menge" />
            )}
            <Button
              size="lg"
              className="order-last w-full px-4! @[22rem]:order-none @[22rem]:w-auto @[22rem]:flex-1 @[28rem]:px-8!"
              onClick={add}
              loading={state === "adding"}
              loadingLabel="Wird hinzugefügt"
              disabled={variant.stock <= 0}
            >
              {label}
            </Button>
            <WishButton productId={product.id} name={product.name} size="lg" className="ml-auto h-14 w-14 shrink-0 @[22rem]:ml-0" />
          </div>
        </div>
      </div>

      <ul className="flex flex-col divide-y divide-line border-y border-line text-small">
        <li className="flex items-start gap-3 py-3.5">
          <Icon icon={Truck} size={18} className="mt-0.5 shrink-0 text-ink-soft" />
          <span>
            {info.shippingPriceCents != null ? <>Versand {formatPrice(info.shippingPriceCents)}</> : "Versand nach Deutschland"}
            {info.freeFromCents != null && <>, kostenlos ab {formatPrice(info.freeFromCents)}</>}
            {info.deliveryTime && <span className="block text-ink-soft">Lieferzeit {info.deliveryTime}</span>}
          </span>
        </li>
        <li className="flex items-start gap-3 py-3.5">
          <Icon icon={ArrowCounterClockwise} size={18} className="mt-0.5 shrink-0 text-ink-soft" />
          <span>
            {info.returnsSummary}{" "}
            <Link href="/rueckgabe" className="text-ink-soft link-underline">
              Rückgabe
            </Link>
          </span>
        </li>
        {info.paymentLabels.length > 0 && (
          <li className="flex items-start gap-3 py-3.5">
            <Icon icon={CreditCard} size={18} className="mt-0.5 shrink-0 text-ink-soft" />
            <span>Bezahlen mit {info.paymentLabels.join(", ")}</span>
          </li>
        )}
        <li className="flex items-start gap-3 py-3.5">
          <Icon icon={Storefront} size={18} className="mt-0.5 shrink-0 text-ink-soft" />
          <span>
            Lieber vorher riechen?{" "}
            <Link href="/parfuemerie#beratung" className="link-underline">
              Beratung in unserer Parfümerie
            </Link>
          </span>
        </li>
      </ul>

      {/* Mobile: fixierte Kaufleiste, sobald der Button aus dem Blick ist */}
      <div
        aria-hidden={!showSticky}
        className={cn(
          "fixed inset-x-0 bottom-0 z-30 border-t border-line bg-paper px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] transition-transform duration-300 ease-out md:hidden",
          showSticky ? "translate-y-0" : "translate-y-full",
        )}
      >
        <div className="flex items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="truncate text-small font-medium">{product.name}</p>
            <p className="numeric text-caption text-ink-soft">
              {formatSize(variant.sizeMl, variant.displaySize)} · {formatPrice(variant.priceCents)}
            </p>
          </div>
          <Button onClick={add} loading={state === "adding"} disabled={variant.stock <= 0} tabIndex={showSticky ? 0 : -1}>
            {state === "added" ? "Im Warenkorb" : variant.stock > 0 ? "Hinzufügen" : "Ausverkauft"}
          </Button>
        </div>
      </div>
    </div>
  );
}
