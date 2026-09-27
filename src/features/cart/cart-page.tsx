"use client";

import { ShieldCheck, Truck } from "@phosphor-icons/react/dist/ssr";
import { ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useShop } from "@/features/shop/shop-provider";
import { CartLineItem, CartSummary, CouponForm, EmptyCart, FreeShippingNote, SamplePicker } from "./cart-parts";

export function CartPageView() {
  const { cart, ready } = useShop();
  if (!ready) {
    return (
      <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12" aria-label="Warenkorb wird geladen">
        <div className="flex flex-col gap-6 lg:col-span-7">
          {[0, 1].map((i) => (
            <div key={i} className="grid grid-cols-[6.5rem_1fr] gap-5">
              <Skeleton className="aspect-[4/5]" />
              <div className="flex flex-col gap-2 pt-1">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-5 w-48" />
              </div>
            </div>
          ))}
        </div>
        <Skeleton className="h-64 lg:col-span-4 lg:col-start-9" />
      </div>
    );
  }
  if (!cart || cart.lines.length === 0) return <EmptyCart className="px-0" />;
  return (
    <div className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
      <div className="flex flex-col gap-8 lg:col-span-7">
        <FreeShippingNote cart={cart} />
        <ul className="divide-y divide-line border-y border-line">
          {cart.lines.map((l) => (
            <CartLineItem key={l.variantId} line={l} />
          ))}
        </ul>
        <SamplePicker cart={cart} />
      </div>
      <aside className="lg:col-span-4 lg:col-start-9">
        <div className="flex flex-col gap-6 rounded-sm border border-line bg-white p-6 lg:sticky lg:top-[calc(var(--header-height)+1.5rem)]">
          <h2 className="font-display text-h3">Übersicht</h2>
          <CouponForm cart={cart} />
          <CartSummary cart={cart} />
          <ButtonLink href="/kasse" size="lg" className="w-full">
            Zur Kasse
          </ButtonLink>
          <ul className="flex flex-col gap-2 text-caption text-ink-soft">
            {cart.shipping?.deliveryTime && (
              <li className="flex items-center gap-2">
                <Icon icon={Truck} size={16} /> Lieferzeit: {cart.shipping.deliveryTime}
              </li>
            )}
            <li className="flex items-center gap-2">
              <Icon icon={ShieldCheck} size={16} /> Bestellung als Gast möglich, ohne Kundenkonto
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
