import type { Metadata } from "next";
import { CartPageView } from "@/features/cart/cart-page";

export const metadata: Metadata = { title: "Warenkorb", robots: { index: false, follow: false } };

export default function CartPage() {
  return (
    <div className="container-page pt-10 pb-24 md:pt-14">
      <h1 className="font-display text-h1">Warenkorb</h1>
      <CartPageView />
    </div>
  );
}
