"use client";

import { ShieldCheck, Truck } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { useShop } from "@/features/shop/shop-provider";
import { CartLineItem, CartSummary, CouponForm, EmptyCart, FreeShippingNote, SamplePicker } from "./cart-parts";

export function CartDrawer() {
  const { cart, cartOpen, setCartOpen, ready } = useShop();
  const pathname = usePathname();

  useEffect(() => {
    setCartOpen(false);
  }, [pathname, setCartOpen]);

  const count = cart?.itemCount ?? 0;
  const close = () => setCartOpen(false);

  return (
    <Drawer
      open={cartOpen}
      onOpenChange={setCartOpen}
      width="min(30rem, 100vw)"
      title={
        <span className="flex items-baseline gap-3">
          Warenkorb
          {count > 0 && <span className="numeric font-sans text-small text-muted">{count} Artikel</span>}
        </span>
      }
      description="Ihr Warenkorb"
      footer={
        cart && cart.lines.length > 0 ? (
          <div className="flex flex-col gap-4 px-6 pt-5 pb-6">
            <CartSummary cart={cart} />
            {cart.hasIssues && <p className="text-caption text-warning">Bitte prüfen Sie die markierten Artikel.</p>}
            <ButtonLink href="/kasse" size="lg" className="w-full" onClick={close} aria-disabled={cart.hasIssues || undefined}>
              Zur Kasse
            </ButtonLink>
            <Link href="/warenkorb" onClick={close} className="self-center text-small text-ink-soft link-underline">
              Warenkorb ansehen
            </Link>
          </div>
        ) : undefined
      }
    >
      {!ready ? (
        <div className="flex flex-col gap-6 p-6" aria-label="Warenkorb wird geladen">
          {[0, 1].map((i) => (
            <div key={i} className="grid grid-cols-[5.5rem_1fr] gap-4">
              <Skeleton className="aspect-[4/5]" />
              <div className="flex flex-col gap-2 pt-1">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-5 w-40" />
                <Skeleton className="h-3 w-28" />
              </div>
            </div>
          ))}
        </div>
      ) : !cart || cart.lines.length === 0 ? (
        <EmptyCart onNavigate={close} />
      ) : (
        <div className="flex flex-col gap-7 px-6 pt-5 pb-8">
          <FreeShippingNote cart={cart} />
          <ul className="-my-5 divide-y divide-line">
            {cart.lines.map((line) => (
              <CartLineItem key={line.variantId} line={line} compact />
            ))}
          </ul>
          <div className="border-t border-line pt-6">
            <SamplePicker cart={cart} />
          </div>
          <CouponForm cart={cart} />
          <ul className="flex flex-col gap-2 text-caption text-ink-soft">
            {cart.shipping?.deliveryTime && (
              <li className="flex items-center gap-2">
                <Icon icon={Truck} size={16} />
                Lieferzeit: {cart.shipping.deliveryTime}
              </li>
            )}
            <li className="flex items-center gap-2">
              <Icon icon={ShieldCheck} size={16} />
              Sichere Zahlung über unseren Zahlungsdienstleister
            </li>
          </ul>
        </div>
      )}
    </Drawer>
  );
}
