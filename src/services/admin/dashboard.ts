import "server-only";
import { and, desc, eq, gte, inArray, lte, sql } from "drizzle-orm";
import { REVENUE_STATUSES } from "@/lib/commerce/order-status";
import { db } from "@/services/db";
import { brands, orderItems, orders, products, productVariants, reviews } from "@/services/db/schema";

/** Kennzahlen ausschließlich aus echten Bestellungen (keine Beispielwerte). */
export async function dashboardData() {
  const since = new Date(Date.now() - 30 * 86_400_000);
  const revenueStatuses = REVENUE_STATUSES as never[];
  const [kpi] = await db
    .select({
      revenue: sql<number>`coalesce(sum(${orders.totalCents} - 0), 0)::int`,
      count: sql<number>`count(*)::int`,
    })
    .from(orders)
    .where(and(gte(orders.createdAt, since), inArray(orders.status, revenueStatuses)));
  const [open] = await db
    .select({ n: sql<number>`count(*)::int` })
    .from(orders)
    .where(inArray(orders.status, ["paid", "processing", "packed"] as never[]));
  const recent = await db.select().from(orders).orderBy(desc(orders.createdAt)).limit(8);
  const lowStock = await db
    .select({ variantId: productVariants.id, productId: products.id, name: products.name, brand: brands.name, sizeMl: productVariants.sizeMl, stock: productVariants.stock, sku: productVariants.sku })
    .from(productVariants)
    .innerJoin(products, eq(products.id, productVariants.productId))
    .innerJoin(brands, eq(brands.id, products.brandId))
    .where(and(eq(productVariants.active, true), eq(products.active, true), lte(productVariants.stock, 3)))
    .orderBy(productVariants.stock)
    .limit(12);
  const top = await db
    .select({ productId: orderItems.productId, name: orderItems.productName, brand: orderItems.brandName, qty: sql<number>`sum(${orderItems.quantity})::int`, revenue: sql<number>`sum(${orderItems.lineTotalCents})::int` })
    .from(orderItems)
    .innerJoin(orders, eq(orders.id, orderItems.orderId))
    .where(and(gte(orders.createdAt, since), inArray(orders.status, revenueStatuses)))
    .groupBy(orderItems.productId, orderItems.productName, orderItems.brandName)
    .orderBy(desc(sql`sum(${orderItems.quantity})`))
    .limit(8);
  const [pendingReviews] = await db.select({ n: sql<number>`count(*)::int` }).from(reviews).where(eq(reviews.status, "pending"));
  return {
    revenueCents: kpi?.revenue ?? 0,
    orderCount: kpi?.count ?? 0,
    avgCents: kpi && kpi.count > 0 ? Math.round(kpi.revenue / kpi.count) : 0,
    openOrders: open?.n ?? 0,
    recent,
    lowStock,
    top,
    pendingReviews: pendingReviews?.n ?? 0,
  };
}
