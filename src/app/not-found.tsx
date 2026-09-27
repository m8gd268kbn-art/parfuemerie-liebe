import type { Metadata } from "next";
import { ShopFrame } from "@/components/layout/shop-frame";
import { NotFoundContent } from "@/features/content/not-found-content";

export const metadata: Metadata = { title: "Seite nicht gefunden", robots: { index: false, follow: true } };

export default function NotFound() {
  return (
    <ShopFrame>
      <NotFoundContent />
    </ShopFrame>
  );
}
