import type { Metadata } from "next";
import { WishlistView } from "@/features/wishlist/wishlist-view";

export const metadata: Metadata = { title: "Wunschliste", robots: { index: false, follow: false } };

export default function WishlistPage() {
  return (
    <div className="container-page pt-10 pb-24 md:pt-14">
      <h1 className="font-display text-h1">Wunschliste</h1>
      <WishlistView />
    </div>
  );
}
