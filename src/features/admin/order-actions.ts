"use server";

import { revalidatePath } from "next/cache";
import { fail, type ActionResult } from "@/lib/action-result";
import { MANUAL_TRANSITIONS, type OrderStatus } from "@/lib/commerce/order-status";
import { parseEuroToCents } from "@/lib/format";
import { requireAdmin } from "@/services/auth/session";
import { refundOrder, updateOrderStatus, updateTracking } from "@/services/orders/admin";

type S = ActionResult<unknown> | null;

export async function changeStatusAction(orderId: string, _prev: S, fd: FormData) {
  const admin = await requireAdmin();
  const to = String(fd.get("status") ?? "") as OrderStatus;
  if (!Object.keys(MANUAL_TRANSITIONS).includes(to)) return fail("Unbekannter Status.");
  const r = await updateOrderStatus(orderId, to, admin.id, {
    trackingNumber: fd.has("trackingNumber") ? String(fd.get("trackingNumber") ?? "").trim() : undefined,
    carrier: fd.has("carrier") ? String(fd.get("carrier") ?? "").trim() : undefined,
    note: String(fd.get("note") ?? "").trim() || null,
    restock: fd.get("restock") === "on",
  });
  revalidatePath(`/admin/bestellungen/${orderId}`);
  return r;
}

export async function trackingAction(orderId: string, _prev: S, fd: FormData) {
  const admin = await requireAdmin();
  const r = await updateTracking(orderId, String(fd.get("trackingNumber") ?? "").trim() || null, String(fd.get("carrier") ?? "").trim() || null, admin.id);
  revalidatePath(`/admin/bestellungen/${orderId}`);
  return r;
}

export async function refundAction(orderId: string, _prev: S, fd: FormData) {
  const admin = await requireAdmin();
  const cents = parseEuroToCents(String(fd.get("amount") ?? ""));
  if (cents == null) return fail("Bitte einen Betrag wie 12,50 eingeben.", { amount: "Ungültiger Betrag" });
  const r = await refundOrder(orderId, cents, admin.id);
  revalidatePath(`/admin/bestellungen/${orderId}`);
  return r;
}
