import { getCurrentUser } from "@/services/auth/session";
import { getCartView } from "@/services/cart";
import { wishlistProductIds } from "@/services/wishlist";

export const dynamic = "force-dynamic";

/** Personalisierter Zustand (Konto, Warenkorb, Wunschliste) – clientseitig geladen, damit Seiten statisch bleiben. */
export async function GET() {
  const user = await getCurrentUser();
  const [cart, wishlist] = await Promise.all([getCartView(), user ? wishlistProductIds(user.id) : Promise.resolve(null)]);
  return Response.json(
    {
      user: user ? { firstName: user.firstName, role: user.role, emailVerified: user.emailVerified } : null,
      cart,
      wishlist,
    },
    { headers: { "Cache-Control": "private, no-store" } },
  );
}
