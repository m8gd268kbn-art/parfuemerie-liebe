import { WishlistView } from "@/features/wishlist/wishlist-view";

export default function AccountWishlist() {
  return (
    <section aria-labelledby="wish-title">
      <h2 id="wish-title" className="font-display text-h2">Wunschliste</h2>
      <WishlistView />
    </section>
  );
}
