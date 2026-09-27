"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ButtonLink } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ProductCard } from "@/features/catalog/product-card";
import { useShop } from "@/features/shop/shop-provider";
import type { ProductCardDTO } from "@/types/catalog";
import { wishlistProductsAction } from "./actions";

export function WishlistView() {
  const { wishlist, ready, user } = useShop();
  const [products, setProducts] = useState<ProductCardDTO[] | null>(null);
  const key = wishlist.join(",");

  useEffect(() => {
    if (!ready) return;
    let active = true;
    wishlistProductsAction(key ? key.split(",") : []).then((p) => active && setProducts(p as ProductCardDTO[]));
    return () => {
      active = false;
    };
  }, [key, ready]);

  if (!ready || products === null) {
    return (
      <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 xl:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div key={i} className="flex flex-col gap-3">
            <Skeleton className="aspect-[4/5]" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-5 w-32" />
          </div>
        ))}
      </div>
    );
  }

  const visible = products.filter((p) => wishlist.includes(p.id));
  if (visible.length === 0) {
    return (
      <div className="mt-10 flex max-w-lg flex-col items-start gap-5">
        <p className="text-body-lg text-ink-soft">
          Noch nichts gemerkt. Tippen Sie auf das Herz bei einem Duft, um ihn hier zu sammeln und später zu vergleichen.
        </p>
        <ButtonLink href="/parfum">Düfte entdecken</ButtonLink>
      </div>
    );
  }
  return (
    <>
      {!user && (
        <p className="mt-4 text-small text-ink-soft">
          Ihre Wunschliste ist auf diesem Gerät gespeichert.{" "}
          <Link href="/anmelden?weiter=/wunschliste" className="text-ink link-underline">
            Melden Sie sich an
          </Link>
          , um sie in Ihrem Konto zu sichern.
        </p>
      )}
      <ul className="mt-10 grid grid-cols-2 gap-x-4 gap-y-12 md:grid-cols-3 md:gap-x-6 xl:grid-cols-4">
        {visible.map((p) => (
          <li key={p.id}>
            <ProductCard product={p} headingLevel="h2" />
          </li>
        ))}
      </ul>
    </>
  );
}
