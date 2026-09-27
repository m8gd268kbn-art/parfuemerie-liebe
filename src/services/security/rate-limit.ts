import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/services/db";

export type RateLimitResult = { ok: boolean; remaining: number; retryAfterSeconds: number };

/**
 * Fixed-Window-Rate-Limit in PostgreSQL (funktioniert auch serverlos über mehrere Instanzen).
 * Beispiel: rateLimit(`login:${ip}`, 10, 900) → max. 10 Versuche je 15 Minuten.
 */
export async function rateLimit(key: string, limit: number, windowSeconds: number): Promise<RateLimitResult> {
  const rows = await db.execute<{ count: number; window_start: Date }>(sql`
    INSERT INTO rate_limits (key, window_start, count)
    VALUES (${key}, now(), 1)
    ON CONFLICT (key) DO UPDATE SET
      count = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                   THEN 1 ELSE rate_limits.count + 1 END,
      window_start = CASE WHEN rate_limits.window_start < now() - make_interval(secs => ${windowSeconds})
                   THEN now() ELSE rate_limits.window_start END
    RETURNING count, window_start
  `);
  const row = rows[0];
  const count = Number(row?.count ?? 1);
  const started = row?.window_start ? new Date(row.window_start).getTime() : Date.now();
  const retryAfter = Math.max(0, Math.ceil((started + windowSeconds * 1000 - Date.now()) / 1000));
  return { ok: count <= limit, remaining: Math.max(0, limit - count), retryAfterSeconds: retryAfter };
}

export function rateLimitMessage(result: RateLimitResult) {
  const minutes = Math.max(1, Math.ceil(result.retryAfterSeconds / 60));
  return `Zu viele Versuche. Bitte versuchen Sie es in ${minutes} ${minutes === 1 ? "Minute" : "Minuten"} erneut.`;
}
