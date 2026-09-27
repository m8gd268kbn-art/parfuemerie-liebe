"use client";

import { Heart } from "@phosphor-icons/react/dist/ssr";
import { useShop } from "@/features/shop/shop-provider";
import { cn } from "@/lib/utils";

/** Herz mit kurzem Druck-Feedback; gefüllt, wenn gemerkt. Relativ positioniert über der Karte. */
export function WishButton({ productId, name, className, size = "md" }: { productId: string; name: string; className?: string; size?: "md" | "lg" }) {
  const { isWished, toggleWish } = useShop();
  const active = isWished(productId);
  return (
    <button
      type="button"
      onClick={() => toggleWish(productId, name)}
      aria-pressed={active}
      aria-label={active ? `${name} von der Wunschliste entfernen` : `${name} auf die Wunschliste`}
      title={active ? "Von der Wunschliste entfernen" : "Auf die Wunschliste"}
      className={cn(
        "z-10 inline-flex items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-150 ease-out active:scale-90",
        size === "lg" ? "size-12 border border-line-strong hover:border-ink" : "size-11 hover:bg-paper/80",
        className,
      )}
    >
      <Heart
        size={size === "lg" ? 22 : 20}
        weight={active ? "fill" : "light"}
        aria-hidden="true"
        className={cn("transition-[color,transform] duration-200 ease-out", active ? "scale-100 text-accent" : "scale-95")}
      />
    </button>
  );
}
