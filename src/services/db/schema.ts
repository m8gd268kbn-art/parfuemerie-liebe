import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  smallint,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

/* ------------------------------------------------------------------ */
/* Enums                                                               */
/* ------------------------------------------------------------------ */

export const genderEnum = pgEnum("gender", ["women", "men", "unisex"]);
export const concentrationEnum = pgEnum("concentration", ["edc", "edt", "edp", "parfum", "extrait"]);
export const imageKindEnum = pgEnum("image_kind", ["front", "back", "side", "packaging", "detail", "lifestyle"]);
export const userRoleEnum = pgEnum("user_role", ["customer", "admin"]);
export const authTokenTypeEnum = pgEnum("auth_token_type", ["verify_email", "reset_password"]);
export const orderStatusEnum = pgEnum("order_status", [
  "pending_payment",
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "cancelled",
  "returned",
  "partially_returned",
  "refunded",
  "partially_refunded",
]);
export const fulfillmentTypeEnum = pgEnum("fulfillment_type", ["shipping", "pickup"]);
export const paymentStatusEnum = pgEnum("payment_status", [
  "pending",
  "succeeded",
  "failed",
  "cancelled",
  "expired",
  "refunded",
  "partially_refunded",
]);
export const couponTypeEnum = pgEnum("coupon_type", ["percent", "fixed"]);
export const reviewStatusEnum = pgEnum("review_status", ["pending", "approved", "rejected"]);
export const newsletterStatusEnum = pgEnum("newsletter_status", ["pending", "confirmed", "unsubscribed"]);

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

/* ------------------------------------------------------------------ */
/* Katalog                                                             */
/* ------------------------------------------------------------------ */

export const brands = pgTable(
  "brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    story: text("story"),
    logoUrl: text("logo_url"),
    heroImageUrl: text("hero_image_url"),
    country: text("country"),
    featured: boolean("featured").notNull().default(false),
    niche: boolean("niche").notNull().default(false),
    active: boolean("active").notNull().default(true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ...timestamps,
  },
  (t) => [uniqueIndex("brands_slug_idx").on(t.slug)],
);

/** Regel-basierte Kollektionen (Damen, Nischendüfte, Angebote …) oder manuelle Kategorien. */
export type CategoryRule = {
  gender?: ("women" | "men" | "unisex")[];
  niche?: boolean;
  isNew?: boolean;
  bestseller?: boolean;
  onSale?: boolean;
  manual?: boolean;
};

export const categories = pgTable(
  "categories",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description"),
    heroImageUrl: text("hero_image_url"),
    rule: jsonb("rule").$type<CategoryRule>().notNull().default({}),
    sortOrder: integer("sort_order").notNull().default(0),
    showInNav: boolean("show_in_nav").notNull().default(true),
    system: boolean("system").notNull().default(false),
    active: boolean("active").notNull().default(true),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    ...timestamps,
  },
  (t) => [uniqueIndex("categories_slug_idx").on(t.slug)],
);

export const products = pgTable(
  "products",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    brandId: uuid("brand_id")
      .notNull()
      .references(() => brands.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    gender: genderEnum("gender").notNull(),
    concentration: concentrationEnum("concentration").notNull(),
    /** Erste Familie = Hauptfamilie. */
    families: text("families").array().notNull().default(sql`'{}'::text[]`),
    topNotes: text("top_notes").array().notNull().default(sql`'{}'::text[]`),
    heartNotes: text("heart_notes").array().notNull().default(sql`'{}'::text[]`),
    baseNotes: text("base_notes").array().notNull().default(sql`'{}'::text[]`),
    character: text("character").array().notNull().default(sql`'{}'::text[]`),
    seasons: text("seasons").array().notNull().default(sql`'{}'::text[]`),
    occasions: text("occasions").array().notNull().default(sql`'{}'::text[]`),
    /** 1 (leicht) bis 5 (intensiv); leer, wenn nicht bekannt. */
    intensity: smallint("intensity"),
    ingredients: text("ingredients"),
    usage: text("usage"),
    manufacturerInfo: text("manufacturer_info"),
    /** Flüssigkeitsfarbe für Platzhalter-Visualisierungen (Hex). */
    liquidColor: text("liquid_color"),
    featured: boolean("featured").notNull().default(false),
    bestseller: boolean("bestseller").notNull().default(false),
    isNew: boolean("is_new").notNull().default(false),
    niche: boolean("niche").notNull().default(false),
    exclusive: boolean("exclusive").notNull().default(false),
    active: boolean("active").notNull().default(true),
    /** Aus echten Bestellungen berechnet (Sortierung „Beliebtheit“). */
    popularity: integer("popularity").notNull().default(0),
    searchText: text("search_text").notNull().default(""),
    seoTitle: text("seo_title"),
    seoDescription: text("seo_description"),
    isDemo: boolean("is_demo").notNull().default(false),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("products_slug_idx").on(t.slug),
    index("products_brand_idx").on(t.brandId),
    index("products_active_idx").on(t.active),
  ],
);

export const productCategories = pgTable(
  "product_categories",
  {
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => categories.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.productId, t.categoryId] })],
);

export const productVariants = pgTable(
  "product_variants",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    sizeMl: integer("size_ml").notNull(),
    /** Optional abweichende Anzeige, z. B. „3 × 10 ml“. */
    displaySize: text("display_size"),
    sku: text("sku").notNull(),
    ean: text("ean"),
    priceCents: integer("price_cents").notNull(),
    /** Durchgestrichener Vergleichspreis (vorheriger Preis). */
    compareAtPriceCents: integer("compare_at_price_cents"),
    stock: integer("stock").notNull().default(0),
    weightGrams: integer("weight_grams"),
    active: boolean("active").notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (t) => [uniqueIndex("variants_sku_idx").on(t.sku), index("variants_product_idx").on(t.productId)],
);

/** Preisverlauf für die Angabe des niedrigsten Preises der letzten 30 Tage (§ 11 PAngV). */
export const variantPriceHistory = pgTable(
  "variant_price_history",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    priceCents: integer("price_cents").notNull(),
    changedAt: timestamp("changed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("price_history_variant_idx").on(t.variantId, t.changedAt)],
);

export const productImages = pgTable(
  "product_images",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    url: text("url").notNull(),
    alt: text("alt").notNull().default(""),
    kind: imageKindEnum("kind").notNull().default("front"),
    width: integer("width"),
    height: integer("height"),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("product_images_product_idx").on(t.productId)],
);

/* ------------------------------------------------------------------ */
/* Nutzer & Auth                                                       */
/* ------------------------------------------------------------------ */

export const users = pgTable(
  "users",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    passwordHash: text("password_hash").notNull(),
    firstName: text("first_name").notNull().default(""),
    lastName: text("last_name").notNull().default(""),
    role: userRoleEnum("role").notNull().default("customer"),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    disabledAt: timestamp("disabled_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [uniqueIndex("users_email_idx").on(t.email)],
);

export const sessions = pgTable(
  "sessions",
  {
    /** SHA-256 des Session-Tokens; das Token selbst existiert nur im Cookie. */
    id: text("id").primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    userAgent: text("user_agent"),
  },
  (t) => [index("sessions_user_idx").on(t.userId)],
);

export const authTokens = pgTable(
  "auth_tokens",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: authTokenTypeEnum("type").notNull(),
    tokenHash: text("token_hash").notNull(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("auth_tokens_hash_idx").on(t.tokenHash)],
);

export const addresses = pgTable(
  "addresses",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    firstName: text("first_name").notNull(),
    lastName: text("last_name").notNull(),
    company: text("company"),
    street: text("street").notNull(),
    houseNumber: text("house_number").notNull(),
    addressLine2: text("address_line2"),
    postalCode: text("postal_code").notNull(),
    city: text("city").notNull(),
    country: text("country").notNull().default("DE"),
    phone: text("phone"),
    isDefaultShipping: boolean("is_default_shipping").notNull().default(false),
    isDefaultBilling: boolean("is_default_billing").notNull().default(false),
    ...timestamps,
  },
  (t) => [index("addresses_user_idx").on(t.userId)],
);

export const wishlistItems = pgTable(
  "wishlist_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("wishlist_user_product_idx").on(t.userId, t.productId)],
);

/* ------------------------------------------------------------------ */
/* Proben                                                              */
/* ------------------------------------------------------------------ */

export const samples = pgTable("samples", {
  id: uuid("id").primaryKey().defaultRandom(),
  brandName: text("brand_name").notNull(),
  name: text("name").notNull(),
  productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
  imageUrl: text("image_url"),
  sizeLabel: text("size_label").notNull().default("1,5 ml"),
  stock: integer("stock").notNull().default(0),
  active: boolean("active").notNull().default(true),
  sortOrder: integer("sort_order").notNull().default(0),
  ...timestamps,
});

/* ------------------------------------------------------------------ */
/* Warenkorb                                                           */
/* ------------------------------------------------------------------ */

export const carts = pgTable(
  "carts",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    couponCode: text("coupon_code"),
    ...timestamps,
  },
  (t) => [index("carts_user_idx").on(t.userId)],
);

export const cartItems = pgTable(
  "cart_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    variantId: uuid("variant_id")
      .notNull()
      .references(() => productVariants.id, { onDelete: "cascade" }),
    quantity: integer("quantity").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [uniqueIndex("cart_items_cart_variant_idx").on(t.cartId, t.variantId)],
);

export const cartSamples = pgTable(
  "cart_samples",
  {
    cartId: uuid("cart_id")
      .notNull()
      .references(() => carts.id, { onDelete: "cascade" }),
    sampleId: uuid("sample_id")
      .notNull()
      .references(() => samples.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.cartId, t.sampleId] })],
);

/* ------------------------------------------------------------------ */
/* Gutscheine                                                          */
/* ------------------------------------------------------------------ */

export const coupons = pgTable(
  "coupons",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    code: text("code").notNull(),
    description: text("description"),
    type: couponTypeEnum("type").notNull(),
    /** Prozent (1–100) oder Betrag in Cent. */
    value: integer("value").notNull(),
    minSubtotalCents: integer("min_subtotal_cents"),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    usageLimit: integer("usage_limit"),
    usageCount: integer("usage_count").notNull().default(0),
    oncePerCustomer: boolean("once_per_customer").notNull().default(false),
    productIds: uuid("product_ids").array().notNull().default(sql`'{}'::uuid[]`),
    brandIds: uuid("brand_ids").array().notNull().default(sql`'{}'::uuid[]`),
    active: boolean("active").notNull().default(true),
    ...timestamps,
  },
  (t) => [uniqueIndex("coupons_code_idx").on(t.code)],
);

/* ------------------------------------------------------------------ */
/* Bestellungen & Zahlungen                                            */
/* ------------------------------------------------------------------ */

export type OrderAddress = {
  firstName: string;
  lastName: string;
  company?: string | null;
  street: string;
  houseNumber: string;
  addressLine2?: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone?: string | null;
};

export type OrderShippingMethod = {
  zoneId: string;
  methodId: string;
  name: string;
  deliveryTime: string;
  priceCents: number;
};

export const orders = pgTable(
  "orders",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    number: text("number").notNull(),
    /** Zufälliges Token für Gast-Links (Bestätigung, Sendungsstatus). */
    publicToken: text("public_token").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    /** Warenkorb, aus dem bestellt wurde; wird nach bestätigter Zahlung geleert. */
    cartId: uuid("cart_id"),
    email: text("email").notNull(),
    phone: text("phone"),
    status: orderStatusEnum("status").notNull().default("pending_payment"),
    fulfillmentType: fulfillmentTypeEnum("fulfillment_type").notNull().default("shipping"),
    shippingAddress: jsonb("shipping_address").$type<OrderAddress | null>(),
    billingAddress: jsonb("billing_address").$type<OrderAddress>().notNull(),
    shippingMethod: jsonb("shipping_method").$type<OrderShippingMethod | null>(),
    subtotalCents: integer("subtotal_cents").notNull(),
    discountCents: integer("discount_cents").notNull().default(0),
    shippingCents: integer("shipping_cents").notNull().default(0),
    taxCents: integer("tax_cents").notNull().default(0),
    totalCents: integer("total_cents").notNull(),
    currency: text("currency").notNull().default("EUR"),
    couponId: uuid("coupon_id").references(() => coupons.id, { onDelete: "set null" }),
    couponCode: text("coupon_code"),
    paymentMethod: text("payment_method").notNull(),
    paymentProvider: text("payment_provider").notNull(),
    customerNote: text("customer_note"),
    trackingNumber: text("tracking_number"),
    carrier: text("carrier"),
    termsAcceptedAt: timestamp("terms_accepted_at", { withTimezone: true }).notNull(),
    reservationExpiresAt: timestamp("reservation_expires_at", { withTimezone: true }),
    stockReleasedAt: timestamp("stock_released_at", { withTimezone: true }),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    shippedAt: timestamp("shipped_at", { withTimezone: true }),
    deliveredAt: timestamp("delivered_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    ...timestamps,
  },
  (t) => [
    uniqueIndex("orders_number_idx").on(t.number),
    uniqueIndex("orders_token_idx").on(t.publicToken),
    index("orders_user_idx").on(t.userId),
    index("orders_status_idx").on(t.status),
    index("orders_created_idx").on(t.createdAt),
  ],
);

export const orderItems = pgTable(
  "order_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: uuid("product_id").references(() => products.id, { onDelete: "set null" }),
    variantId: uuid("variant_id").references(() => productVariants.id, { onDelete: "set null" }),
    brandName: text("brand_name").notNull(),
    productName: text("product_name").notNull(),
    productSlug: text("product_slug"),
    concentration: text("concentration").notNull(),
    displaySize: text("display_size").notNull(),
    sku: text("sku").notNull(),
    imageUrl: text("image_url"),
    unitPriceCents: integer("unit_price_cents").notNull(),
    quantity: integer("quantity").notNull(),
    lineTotalCents: integer("line_total_cents").notNull(),
    taxRate: integer("tax_rate").notNull(),
  },
  (t) => [index("order_items_order_idx").on(t.orderId)],
);

export const orderSamples = pgTable(
  "order_samples",
  {
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    sampleId: uuid("sample_id").references(() => samples.id, { onDelete: "set null" }),
    label: text("label").notNull(),
  },
  (t) => [index("order_samples_order_idx").on(t.orderId)],
);

export const orderEvents = pgTable(
  "order_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    type: text("type").notNull(),
    fromStatus: orderStatusEnum("from_status"),
    toStatus: orderStatusEnum("to_status"),
    message: text("message"),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("order_events_order_idx").on(t.orderId)],
);

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    provider: text("provider").notNull(),
    /** Checkout-Session-ID o. ä. */
    providerRef: text("provider_ref"),
    /** Payment-Intent-ID o. ä. (für Erstattungen). */
    providerPaymentId: text("provider_payment_id"),
    method: text("method"),
    status: paymentStatusEnum("status").notNull().default("pending"),
    amountCents: integer("amount_cents").notNull(),
    refundedCents: integer("refunded_cents").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("payments_order_idx").on(t.orderId), index("payments_ref_idx").on(t.providerRef)],
);

/** Idempotenz für Webhooks: jedes Provider-Event wird genau einmal verarbeitet. */
export const paymentEvents = pgTable("payment_events", {
  id: text("id").primaryKey(),
  provider: text("provider").notNull(),
  type: text("type").notNull(),
  receivedAt: timestamp("received_at", { withTimezone: true }).notNull().defaultNow(),
});

export const couponRedemptions = pgTable(
  "coupon_redemptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    couponId: uuid("coupon_id")
      .notNull()
      .references(() => coupons.id, { onDelete: "cascade" }),
    orderId: uuid("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("coupon_redemptions_coupon_idx").on(t.couponId, t.email)],
);

/* ------------------------------------------------------------------ */
/* Bewertungen                                                         */
/* ------------------------------------------------------------------ */

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    productId: uuid("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    userId: uuid("user_id").references(() => users.id, { onDelete: "set null" }),
    authorName: text("author_name").notNull(),
    rating: smallint("rating").notNull(),
    title: text("title"),
    body: text("body").notNull(),
    longevity: smallint("longevity"),
    sillage: smallint("sillage"),
    value: smallint("value"),
    verifiedPurchase: boolean("verified_purchase").notNull().default(false),
    status: reviewStatusEnum("status").notNull().default("pending"),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("reviews_product_idx").on(t.productId, t.status)],
);

/* ------------------------------------------------------------------ */
/* Newsletter                                                          */
/* ------------------------------------------------------------------ */

export const newsletterSubscribers = pgTable(
  "newsletter_subscribers",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    email: text("email").notNull(),
    status: newsletterStatusEnum("status").notNull().default("pending"),
    tokenHash: text("token_hash"),
    source: text("source"),
    signupAt: timestamp("signup_at", { withTimezone: true }).notNull().defaultNow(),
    confirmedAt: timestamp("confirmed_at", { withTimezone: true }),
    unsubscribedAt: timestamp("unsubscribed_at", { withTimezone: true }),
  },
  (t) => [uniqueIndex("newsletter_email_idx").on(t.email)],
);

/* ------------------------------------------------------------------ */
/* Einstellungen, Rate Limits, E-Mail-Protokoll                        */
/* ------------------------------------------------------------------ */

export const shopSettings = pgTable("shop_settings", {
  id: integer("id").primaryKey().default(1),
  data: jsonb("data").notNull().default({}),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
  count: integer("count").notNull().default(0),
});

export const emailOutbox = pgTable("email_outbox", {
  id: uuid("id").primaryKey().defaultRandom(),
  to: text("to").notNull(),
  subject: text("subject").notNull(),
  html: text("html").notNull(),
  text: text("text").notNull(),
  template: text("template").notNull(),
  provider: text("provider").notNull(),
  status: text("status").notNull().default("sent"),
  error: text("error"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});
