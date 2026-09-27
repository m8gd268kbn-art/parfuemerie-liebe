import "server-only";
import { and, desc, eq, inArray } from "drizzle-orm";
import { db } from "@/services/db";
import { orderItems, orders } from "@/services/db/schema";

export async function customerOrders(userId: string, limit = 50) {
  const rows = await db.select().from(orders).where(eq(orders.userId, userId)).orderBy(desc(orders.createdAt)).limit(limit);
  if (!rows.length) return [];
  const items = await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((o) => o.id)));
  const byOrder = Map.groupBy(items, (i) => i.orderId);
  return rows.map((o) => ({ order: o, items: byOrder.get(o.id) ?? [] }));
}

export async function customerOrderByNumber(userId: string, number: string) {
  const [row] = await db.select({ id: orders.id }).from(orders).where(and(eq(orders.userId, userId), eq(orders.number, number))).limit(1);
  return row?.id ?? null;
}
