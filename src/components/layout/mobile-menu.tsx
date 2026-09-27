"use client";

import { ArrowRight, Heart, ShoppingBag, User } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { Drawer } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { MOBILE_NAV, SERVICE_NAV } from "@/config/navigation";
import { useShop } from "@/features/shop/shop-provider";
import { Wordmark } from "./logo";

/** Eigenständiges Mobile-Menü (Drawer): große Bodoni-Links, darunter Service und Konto. */
export function MobileMenu() {
  const { menuOpen, setMenuOpen, user, wishlist, cart, setCartOpen } = useShop();
  const pathname = usePathname();

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname, setMenuOpen]);

  return (
    <Drawer
      open={menuOpen}
      onOpenChange={setMenuOpen}
      side="left"
      width="min(26rem, 100vw)"
      title={<Wordmark compact />}
      description="Navigation der Parfümerie Liebe"
    >
      <nav aria-label="Mobile Navigation" className="flex flex-col gap-10 px-6 pt-8 pb-10">
        {MOBILE_NAV.map((section) => (
          <div key={section.title}>
            <p className="label mb-3 text-muted">{section.title}</p>
            <ul className="flex flex-col">
              {section.items.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    aria-current={pathname === item.href ? "page" : undefined}
                    className="flex items-center justify-between py-2 font-display text-[1.75rem] leading-tight text-ink aria-[current=page]:text-accent"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <Link href="/marken" className="flex items-center justify-between border-y border-line py-4 font-display text-[1.75rem] leading-tight">
            Marken
            <Icon icon={ArrowRight} size={20} />
          </Link>
        </div>

        <div>
          <p className="label mb-3 text-muted">Service</p>
          <ul className="grid grid-cols-2 gap-x-4">
            {SERVICE_NAV.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="block py-2 text-body text-ink-soft">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <ul className="flex flex-col border-t border-line">
          <li>
            <Link href={user ? "/konto" : "/anmelden"} className="flex items-center gap-3 border-b border-line py-4 text-body">
              <Icon icon={User} />
              {user ? `Kundenkonto (${user.firstName})` : "Anmelden oder registrieren"}
            </Link>
          </li>
          <li>
            <Link href="/wunschliste" className="flex items-center gap-3 border-b border-line py-4 text-body">
              <Icon icon={Heart} />
              Wunschliste
              {wishlist.length > 0 && <span className="numeric ml-auto text-small text-muted">{wishlist.length}</span>}
            </Link>
          </li>
          <li>
            <button
              type="button"
              onClick={() => {
                setMenuOpen(false);
                setCartOpen(true);
              }}
              className="flex w-full items-center gap-3 border-b border-line py-4 text-left text-body"
            >
              <Icon icon={ShoppingBag} />
              Warenkorb
              {(cart?.itemCount ?? 0) > 0 && <span className="numeric ml-auto text-small text-muted">{cart?.itemCount}</span>}
            </button>
          </li>
        </ul>
      </nav>
    </Drawer>
  );
}
