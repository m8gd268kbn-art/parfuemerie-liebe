import "server-only";
import { revalidateTag } from "next/cache";

export const TAGS = {
  catalog: "catalog",
  categories: "categories",
  settings: "settings",
  samples: "samples",
  reviews: "reviews",
  product: (slug: string) => `product:${slug}`,
} as const;

/**
 * Sofortige Invalidierung (keine veralteten Inhalte nach Admin-Änderungen, Bestandsänderungen
 * oder Moderation). Außerhalb von Next.js (Skripte, Tests) ist der Aufruf ein No-op.
 */
export function invalidate(...tags: string[]) {
  for (const tag of tags) {
    try {
      revalidateTag(tag, { expire: 0 });
    } catch {
      // Kein Next.js-Request-Kontext (z. B. Seed-Skript) – nichts zu invalidieren.
    }
  }
}
