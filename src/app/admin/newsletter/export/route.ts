import { asc, eq } from "drizzle-orm";
import { getCurrentUser } from "@/services/auth/session";
import { db } from "@/services/db";
import { newsletterSubscribers as ns } from "@/services/db/schema";

export const dynamic = "force-dynamic";

/** Schützt vor CSV-/Formel-Injection beim Öffnen in Tabellenprogrammen. */
function cell(value: string) {
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return `"${safe.replace(/"/g, '""')}"`;
}

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return new Response("Not found", { status: 404 });
  const rows = await db.select().from(ns).where(eq(ns.status, "confirmed")).orderBy(asc(ns.confirmedAt));
  const lines = [
    ["email", "confirmed_at", "signup_at", "source"].join(";"),
    ...rows.map((r) => [r.email, r.confirmedAt?.toISOString() ?? "", r.signupAt.toISOString(), r.source ?? ""].map(cell).join(";")),
  ];
  const date = new Date().toISOString().slice(0, 10);
  return new Response(`﻿${lines.join("\r\n")}\r\n`, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="newsletter-bestaetigt-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
