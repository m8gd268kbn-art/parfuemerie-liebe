/**
 * Seed für Entwicklung: Einstellungen, Kategorien, Demo-Katalog, Proben, Gutscheine, Admin.
 *   npm run db:seed            – legt fehlende Daten an
 *   npm run db:seed -- --reset – leert vorher alle Shop-Tabellen (nur Entwicklung!)
 */
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { config } from "dotenv";
config({ path: ".env.local" });
config();

import { hash } from "@node-rs/argon2";
import { eq, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { buildSearchText } from "../src/lib/catalog/search-text";
import { defaultSettings } from "../src/lib/settings-schema";
import * as schema from "../src/services/db/schema";
import { DEMO_BRANDS, DEMO_COUPONS, DEMO_PRODUCTS, DEMO_SAMPLES } from "./demo-catalog";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL fehlt");
const NEXT_DATA_CACHE = path.join(process.cwd(), ".next", "cache", "fetch-cache");

if (process.env.NODE_ENV === "production" && process.argv.includes("--reset")) {
  throw new Error("--reset ist in Produktion nicht erlaubt.");
}

const client = postgres(url, { max: 1, onnotice: () => {} });
const db = drizzle(client, { schema });

const CATEGORIES: (typeof schema.categories.$inferInsert)[] = [
  { slug: "parfum", name: "Parfum", description: "Alle Düfte unserer Parfümerie: von Klassikern bis zu Nischendüften.", rule: {}, sortOrder: 1, system: true },
  { slug: "damen", name: "Damendüfte", description: "Düfte für Damen sowie Unisex-Düfte.", rule: { gender: ["women", "unisex"] }, sortOrder: 2, system: true },
  { slug: "herren", name: "Herrendüfte", description: "Düfte für Herren sowie Unisex-Düfte.", rule: { gender: ["men", "unisex"] }, sortOrder: 3, system: true },
  { slug: "unisex", name: "Unisex-Düfte", description: "Düfte ohne Zuordnung, für alle.", rule: { gender: ["unisex"] }, sortOrder: 4, system: true },
  { slug: "nischenduefte", name: "Nischendüfte", description: "Düfte unabhängiger Parfumhäuser und kleiner Manufakturen.", rule: { niche: true }, sortOrder: 5, system: true },
  { slug: "neuheiten", name: "Neuheiten", description: "Neu in unserem Sortiment.", rule: { isNew: true }, sortOrder: 6, system: true },
  { slug: "bestseller", name: "Bestseller", description: "Besonders gefragte Düfte.", rule: { bestseller: true }, sortOrder: 7, system: true },
  { slug: "angebote", name: "Angebote", description: "Aktuell reduzierte Düfte. Solange der Vorrat reicht, ohne künstliche Verknappung.", rule: { onSale: true }, sortOrder: 8, system: true },
];

const IMAGE_KINDS: { kind: "front" | "side" | "lifestyle" | "detail"; file: string; alt: (n: string) => string }[] = [
  { kind: "front", file: "front.webp", alt: (n) => `${n}, Flakon von vorn (Platzhalterbild)` },
  { kind: "side", file: "side.webp", alt: (n) => `${n}, Flakon seitlich (Platzhalterbild)` },
  { kind: "detail", file: "detail.webp", alt: (n) => `${n}, Detail des Verschlusses (Platzhalterbild)` },
  { kind: "lifestyle", file: "lifestyle.webp", alt: (n) => `${n}, Flakon auf Stein im Streiflicht (Platzhalterbild)` },
];

async function reset() {
  const tables = [
    "order_events", "order_samples", "order_items", "coupon_redemptions", "payments", "payment_events", "orders",
    "cart_samples", "cart_items", "carts", "wishlist_items", "reviews", "product_categories", "product_images",
    "variant_price_history", "product_variants", "products", "brands", "categories", "samples", "coupons",
    "newsletter_subscribers", "sessions", "auth_tokens", "addresses", "users", "shop_settings", "rate_limits", "email_outbox",
  ];
  await client.unsafe(`TRUNCATE ${tables.join(", ")} RESTART IDENTITY CASCADE`);
  await client.unsafe(`ALTER SEQUENCE order_number_seq RESTART WITH 100001`);
  console.log("Tabellen geleert.");
}

async function main() {
  if (process.argv.includes("--reset")) await reset();

  // Einstellungen
  await db.insert(schema.shopSettings).values({ id: 1, data: defaultSettings() }).onConflictDoNothing();

  // Kategorien
  for (const c of CATEGORIES) await db.insert(schema.categories).values(c).onConflictDoNothing();

  // Katalog
  const [{ n }] = await db.select({ n: sql<number>`count(*)::int` }).from(schema.products);
  if (n === 0) {
    const brandIds = new Map<string, { id: string; name: string; niche: boolean }>();
    for (const b of DEMO_BRANDS) {
      const [row] = await db
        .insert(schema.brands)
        .values({ name: b.name, slug: b.slug, country: b.country, niche: b.niche, featured: b.featured, description: b.description })
        .returning({ id: schema.brands.id });
      brandIds.set(b.slug, { id: row.id, name: b.name, niche: b.niche });
    }

    for (const [index, p] of DEMO_PRODUCTS.entries()) {
      const brand = brandIds.get(p.brand)!;
      const created = new Date(Date.now() - p.createdDaysAgo * 86_400_000);
      const [product] = await db
        .insert(schema.products)
        .values({
          brandId: brand.id,
          name: p.name,
          slug: p.slug,
          description: p.description,
          gender: p.gender,
          concentration: p.concentration,
          families: p.families,
          topNotes: p.top,
          heartNotes: p.heart,
          baseNotes: p.base,
          character: p.character ?? [],
          seasons: p.seasons ?? [],
          occasions: p.occasions ?? [],
          intensity: p.intensity ?? null,
          usage: "Auf Puls- und Halspartien sprühen, aus etwa 15 cm Abstand. Nicht verreiben.",
          liquidColor: p.liquid,
          niche: p.niche ?? false,
          isNew: p.isNew ?? false,
          bestseller: p.bestseller ?? false,
          featured: p.featured ?? false,
          isDemo: true,
          searchText: buildSearchText({
            brandName: brand.name,
            name: p.name,
            concentration: p.concentration,
            gender: p.gender,
            families: p.families,
            notes: [...p.top, ...p.heart, ...p.base],
            character: p.character ?? [],
          }),
          createdAt: created,
          updatedAt: created,
        })
        .returning({ id: schema.products.id });

      for (const [i, v] of p.variants.entries()) {
        const [variant] = await db
          .insert(schema.productVariants)
          .values({
            productId: product.id,
            sizeMl: v.ml,
            displaySize: v.displaySize ?? null,
            sku: `DEMO-${String(index + 1).padStart(3, "0")}-${v.ml}`,
            ean: null,
            priceCents: v.price,
            compareAtPriceCents: v.compareAt ?? null,
            stock: v.stock,
            weightGrams: Math.round(v.ml * 1.9 + 120),
            sortOrder: i,
          })
          .returning({ id: schema.productVariants.id });
        if (v.compareAt) {
          await db.insert(schema.variantPriceHistory).values([
            { variantId: variant.id, priceCents: v.compareAt, changedAt: new Date(Date.now() - 90 * 86_400_000) },
            { variantId: variant.id, priceCents: v.price, changedAt: new Date(Date.now() - 4 * 86_400_000) },
          ]);
        } else {
          await db.insert(schema.variantPriceHistory).values({ variantId: variant.id, priceCents: v.price, changedAt: created });
        }
      }

      const label = `${brand.name} ${p.name}`;
      await db.insert(schema.productImages).values(
        IMAGE_KINDS.map((img, i) => ({
          productId: product.id,
          url: `/media/products/${p.slug}/${img.file}`,
          alt: img.alt(label),
          kind: img.kind,
          width: 1600,
          height: 2000,
          sortOrder: i,
        })),
      );
    }
    console.log(`${DEMO_PRODUCTS.length} Demo-Produkte von ${DEMO_BRANDS.length} Marken angelegt.`);

    // Proben
    for (const [i, s] of DEMO_SAMPLES.entries()) {
      const [product] = await db
        .select({ id: schema.products.id, name: schema.products.name, brandId: schema.products.brandId })
        .from(schema.products)
        .where(eq(schema.products.slug, s.product));
      const [brand] = await db.select({ name: schema.brands.name }).from(schema.brands).where(eq(schema.brands.id, product.brandId));
      await db.insert(schema.samples).values({
        brandName: brand.name,
        name: product.name,
        productId: product.id,
        imageUrl: `/media/products/${s.product}/front.webp`,
        sizeLabel: "1,5 ml",
        stock: s.stock,
        sortOrder: i,
      });
    }

    // Gutscheine (Demo)
    const nicheBrandIds = [...brandIds.values()].filter((b) => b.niche).map((b) => b.id);
    for (const c of DEMO_COUPONS) {
      await db
        .insert(schema.coupons)
        .values({
          code: c.code,
          description: c.description,
          type: c.type,
          value: c.value,
          minSubtotalCents: c.minSubtotalCents,
          brandIds: "niche" in c && c.niche ? nicheBrandIds : [],
        })
        .onConflictDoNothing();
    }
  } else {
    console.log("Katalog vorhanden, übersprungen.");
  }

  // Admin
  const email = process.env.SEED_ADMIN_EMAIL?.toLowerCase();
  const password = process.env.SEED_ADMIN_PASSWORD;
  if (email && password) {
    if (password.length < 12) throw new Error("SEED_ADMIN_PASSWORD muss mindestens 12 Zeichen haben.");
    const [existing] = await db.select({ id: schema.users.id }).from(schema.users).where(eq(schema.users.email, email));
    if (!existing) {
      await db.insert(schema.users).values({
        email,
        passwordHash: await hash(password, { memoryCost: 19_456, timeCost: 2, parallelism: 1, outputLen: 32 }),
        firstName: "Admin",
        lastName: "Parfümerie Liebe",
        role: "admin",
        emailVerifiedAt: new Date(),
      });
      console.log(`Admin angelegt: ${email}`);
    }
  } else {
    console.log("Kein Admin angelegt (SEED_ADMIN_EMAIL / SEED_ADMIN_PASSWORD fehlen).");
  }

  // Next.js-Datencache (unstable_cache) hält sonst Katalog-IDs aus der Zeit vor dem Seed.
  // Lokal liegt er unter .next/cache/fetch-cache; auf Vercel wird bei jedem Deployment neu gebaut.
  if (existsSync(NEXT_DATA_CACHE)) {
    rmSync(NEXT_DATA_CACHE, { recursive: true, force: true });
    console.log("Next.js-Datencache geleert (.next/cache/fetch-cache). Laufenden Server bitte neu starten.");
  }

  await client.end();
}

main().catch(async (e) => {
  console.error(e);
  await client.end();
  process.exit(1);
});
