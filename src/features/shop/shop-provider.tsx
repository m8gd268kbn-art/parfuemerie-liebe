"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, useTransition, type ReactNode } from "react";
import { toast } from "sonner";
import type { ActionResult } from "@/lib/action-result";
import type { CartView } from "@/services/cart";
import { addToCartAction } from "@/features/cart/actions";
import { mergeWishlistAction, toggleWishlistAction } from "@/features/wishlist/actions";
import { track } from "@/features/consent/analytics";

type Me = { firstName: string; role: "customer" | "admin"; emailVerified: boolean } | null;

type ShopContext = {
  ready: boolean;
  user: Me;
  cart: CartView | null;
  wishlist: string[];
  cartOpen: boolean;
  searchOpen: boolean;
  menuOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setSearchOpen: (open: boolean) => void;
  setMenuOpen: (open: boolean) => void;
  setCart: (cart: CartView) => void;
  applyCartResult: (result: ActionResult<CartView>, opts?: { silent?: boolean }) => boolean;
  addToCart: (variantId: string, quantity?: number, meta?: { name?: string }) => Promise<boolean>;
  isWished: (productId: string) => boolean;
  toggleWish: (productId: string, name?: string) => void;
  refresh: () => Promise<void>;
};

const Ctx = createContext<ShopContext | null>(null);

const WISH_KEY = "pl.wishlist";

function readLocal(key: string): string[] {
  try {
    const raw = window.localStorage.getItem(key);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed.filter((x) => typeof x === "string").slice(0, 200) : [];
  } catch {
    return [];
  }
}

function writeLocal(key: string, value: string[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Speicher nicht verfügbar (privater Modus) – Wunschliste bleibt für diese Sitzung im Speicher.
  }
}

export function ShopProvider({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState<Me>(null);
  const [cart, setCart] = useState<CartView | null>(null);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [, startTransition] = useTransition();
  const userRef = useRef<Me>(null);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/me", { cache: "no-store", credentials: "same-origin" });
      if (!res.ok) throw new Error(String(res.status));
      const data = (await res.json()) as { user: Me; cart: CartView; wishlist: string[] | null };
      setUser(data.user);
      userRef.current = data.user;
      setCart(data.cart);
      const local = readLocal(WISH_KEY);
      if (data.user && data.wishlist) {
        if (local.length) {
          const merged = await mergeWishlistAction(local);
          writeLocal(WISH_KEY, []);
          setWishlist(merged ?? data.wishlist);
        } else {
          setWishlist(data.wishlist);
        }
      } else {
        setWishlist(local);
      }
    } catch {
      setWishlist(readLocal(WISH_KEY));
    } finally {
      setReady(true);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const applyCartResult = useCallback((result: ActionResult<CartView>, opts?: { silent?: boolean }) => {
    if (result.ok) {
      setCart(result.data);
      if (result.message && !opts?.silent) toast(result.message);
      return true;
    }
    toast.error(result.error);
    return false;
  }, []);

  const addToCart = useCallback(
    async (variantId: string, quantity = 1, meta?: { name?: string }) => {
      const result = await addToCartAction(variantId, quantity);
      if (result.ok) {
        setCart(result.data);
        setCartOpen(true);
        track("add_to_cart", { variantId, quantity, name: meta?.name });
        return true;
      }
      toast.error(result.error);
      return false;
    },
    [],
  );

  const isWished = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const toggleWish = useCallback(
    (productId: string, name?: string) => {
      const add = !wishlist.includes(productId);
      const next = add ? [productId, ...wishlist] : wishlist.filter((id) => id !== productId);
      setWishlist(next);
      if (add) {
        toast(name ? `${name} ist auf Ihrer Wunschliste.` : "Zur Wunschliste hinzugefügt.");
        track("add_to_wishlist", { productId });
      } else {
        toast(name ? `${name} wurde von der Wunschliste entfernt.` : "Von der Wunschliste entfernt.");
      }
      if (userRef.current) {
        startTransition(async () => {
          const ids = await toggleWishlistAction(productId, add);
          if (ids) setWishlist(ids);
        });
      } else {
        writeLocal(WISH_KEY, next);
      }
    },
    [wishlist],
  );

  const value = useMemo<ShopContext>(
    () => ({
      ready,
      user,
      cart,
      wishlist,
      cartOpen,
      searchOpen,
      menuOpen,
      setCartOpen,
      setSearchOpen,
      setMenuOpen,
      setCart,
      applyCartResult,
      addToCart,
      isWished,
      toggleWish,
      refresh,
    }),
    [ready, user, cart, wishlist, cartOpen, searchOpen, menuOpen, applyCartResult, addToCart, isWished, toggleWish, refresh],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useShop() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useShop muss innerhalb von <ShopProvider> verwendet werden.");
  return ctx;
}
