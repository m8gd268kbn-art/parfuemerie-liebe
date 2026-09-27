"use client";

import { Heart, List, MagnifyingGlass, ShoppingBag, Storefront, User } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { IconButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { HEADER_NAV } from "@/config/navigation";
import { useShop } from "@/features/shop/shop-provider";
import { cn } from "@/lib/utils";
import { Wordmark } from "./logo";

function CountBadge({ count, label }: { count: number; label: string }) {
  return (
    <span
      aria-hidden={count === 0}
      className={cn(
        "numeric absolute top-1 right-0.5 inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-accent px-1 text-[0.6875rem] font-semibold text-white",
        "transition-[transform,opacity] duration-200 ease-out",
        count > 0 ? "scale-100 opacity-100" : "scale-75 opacity-0",
      )}
    >
      {count > 0 ? count : ""}
      <span className="sr-only">{label}</span>
    </span>
  );
}

/**
 * Header: einzeilig, 72 px. Links Menü und Navigation, Logo mittig, rechts Icons und Warenkorb „(n)“.
 * Beim Scrollen wird das Logo leicht kleiner und eine Haarlinie erscheint (IntersectionObserver).
 */
export function Header() {
  const pathname = usePathname();
  const { cart, wishlist, user, ready, setCartOpen, setSearchOpen, setMenuOpen } = useShop();
  const sentinel = useRef<HTMLDivElement>(null);
  const [compact, setCompact] = useState(false);
  const count = cart?.itemCount ?? 0;

  useEffect(() => {
    const el = sentinel.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setCompact(!entry.isIntersecting), { rootMargin: "0px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <>
      <div ref={sentinel} aria-hidden="true" className="h-px" />
      <header
        className={cn(
          "sticky top-0 z-40 border-b bg-paper transition-[border-color] duration-200 ease-out",
          compact ? "border-line" : "border-transparent",
        )}
      >
        <div className="container-page grid h-[var(--header-height)] grid-cols-[1fr_auto_1fr] items-center gap-4">
          {/* Links: Menü, Suche (mobil) und Hauptnavigation (Desktop) */}
          <div className="flex min-w-0 items-center gap-2 xl:gap-5">
            <IconButton label="Menü öffnen" onClick={() => setMenuOpen(true)} className="-ml-3">
              <Icon icon={List} size={22} />
            </IconButton>
            <IconButton label="Suche öffnen" onClick={() => setSearchOpen(true)} className="md:hidden">
              <Icon icon={MagnifyingGlass} size={22} />
            </IconButton>
            <nav aria-label="Hauptnavigation" className="hidden xl:block">
              <ul className="flex items-center gap-6">
                {HEADER_NAV.map((item) => {
                  const active = pathname === item.href || pathname.startsWith(`${item.href}/`);
                  return (
                    <li key={item.href} className={cn(item.wide && "hidden 2xl:block")}>
                      <Link
                        href={item.href}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "group label relative inline-flex h-11 items-center text-[0.6875rem] tracking-[0.12em] whitespace-nowrap transition-colors duration-150",
                          item.href === "/angebote" ? "text-accent hover:text-accent-strong" : "text-ink-soft hover:text-ink",
                          active && item.href !== "/angebote" && "text-ink",
                        )}
                      >
                        {item.label}
                        <span
                          aria-hidden="true"
                          className={cn(
                            "absolute right-0 bottom-2.5 left-0 h-px origin-left bg-current transition-transform duration-300 ease-out",
                            active ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100",
                          )}
                        />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>
          </div>

          <Link href="/" aria-label="Parfümerie Liebe, zur Startseite" className="justify-self-center rounded-sm">
            <span className="block origin-center transition-transform duration-300 ease-out" style={{ transform: compact ? "scale(0.88)" : "scale(1)" }}>
              <Wordmark />
            </span>
          </Link>

          <div className="-mr-2 flex items-center justify-end">
            <IconButton label="Suche öffnen" onClick={() => setSearchOpen(true)} className="max-md:hidden">
              <Icon icon={MagnifyingGlass} size={22} />
            </IconButton>
            <Link
              href="/parfuemerie"
              aria-label="Unsere Parfümerie in Hannover"
              title="Unsere Parfümerie in Hannover"
              className="hidden size-11 items-center justify-center rounded-full transition-colors duration-150 hover:bg-porcelain lg:inline-flex"
            >
              <Icon icon={Storefront} size={22} />
            </Link>
            <Link
              href={user ? "/konto" : "/anmelden"}
              aria-label={user ? `Kundenkonto von ${user.firstName}` : "Anmelden"}
              title={user ? "Kundenkonto" : "Anmelden"}
              className="hidden size-11 items-center justify-center rounded-full transition-colors duration-150 hover:bg-porcelain md:inline-flex"
            >
              <Icon icon={User} size={22} weight={ready && user ? "regular" : "light"} />
            </Link>
            <Link
              href="/wunschliste"
              aria-label={`Wunschliste, ${wishlist.length} Artikel`}
              title="Wunschliste"
              className="relative hidden size-11 items-center justify-center rounded-full transition-colors duration-150 hover:bg-porcelain sm:inline-flex"
            >
              <Icon icon={Heart} size={22} />
              <CountBadge count={wishlist.length} label="auf der Wunschliste" />
            </Link>
            <button
              type="button"
              aria-label={`Warenkorb öffnen, ${count} Artikel`}
              title="Warenkorb"
              onClick={() => setCartOpen(true)}
              className="press inline-flex h-11 items-center gap-1.5 rounded-full pr-2 pl-2.5 transition-colors duration-150 hover:bg-porcelain"
            >
              <Icon icon={ShoppingBag} size={22} />
              <span aria-hidden="true" className="numeric text-caption font-semibold">
                ({count})
              </span>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
