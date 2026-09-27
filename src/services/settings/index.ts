import "server-only";
import { eq, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";
import { parseSettings, settingsSchema, type ShopSettings } from "@/lib/settings-schema";
import { db } from "@/services/db";
import { shopSettings } from "@/services/db/schema";
import { invalidate, TAGS } from "@/services/cache";

async function load(): Promise<ShopSettings> {
  const [row] = await db.select({ data: shopSettings.data }).from(shopSettings).where(eq(shopSettings.id, 1));
  return parseSettings(row?.data);
}

/** Aktuelle Shop-Einstellungen (gecacht, per Tag invalidiert). */
export const getSettings = unstable_cache(load, ["shop-settings-v1"], { tags: [TAGS.settings], revalidate: 3600 });

/** Ungecachte Variante für sicherheits- und preisrelevante Entscheidungen (Checkout, Bestellung). */
export const getSettingsFresh = load;

/** Speichert einen Teilbereich der Einstellungen nach vollständiger Validierung. */
export async function updateSettings(patch: Partial<ShopSettings>): Promise<ShopSettings> {
  const current = await load();
  const next = settingsSchema.parse({ ...current, ...patch });
  await db
    .insert(shopSettings)
    .values({ id: 1, data: next, updatedAt: new Date() })
    .onConflictDoUpdate({ target: shopSettings.id, set: { data: next, updatedAt: sql`now()` } });
  invalidate(TAGS.settings);
  return next;
}
