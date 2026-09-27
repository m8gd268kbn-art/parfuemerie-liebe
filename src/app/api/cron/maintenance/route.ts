import { lt } from "drizzle-orm";
import { env } from "@/config/env";
import { purgeExpiredSessions } from "@/services/auth/session";
import { db } from "@/services/db";
import { rateLimits } from "@/services/db/schema";
import { releaseExpiredReservations } from "@/services/orders";
import { safeEqual } from "@/services/security/crypto";

export const dynamic = "force-dynamic";

/**
 * Wartung: gibt abgelaufene Bestandsreservierungen frei, löscht abgelaufene Sessions und alte
 * Rate-Limit-Fenster. Nur mit CRON_SECRET aufrufbar; ohne gesetztes Secret deaktiviert.
 */
export async function GET(request: Request) {
  const secret = env().CRON_SECRET;
  const auth = request.headers.get("authorization") ?? "";
  if (!secret || !safeEqual(auth, `Bearer ${secret}`)) return new Response("Not found", { status: 404 });
  await releaseExpiredReservations();
  await purgeExpiredSessions();
  await db.delete(rateLimits).where(lt(rateLimits.windowStart, new Date(Date.now() - 2 * 86_400_000)));
  return Response.json({ ok: true, at: new Date().toISOString() });
}
