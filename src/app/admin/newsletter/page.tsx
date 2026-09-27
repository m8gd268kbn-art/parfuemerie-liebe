import { count, desc, eq, ilike } from "drizzle-orm";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { ActionButton } from "@/features/admin/kit";
import { deleteSubscriberAction, unsubscribeSubscriberAction } from "@/features/admin/marketing-actions";
import { AdminPage, Stat, StatusPill, Table, Td } from "@/features/admin/ui";
import { formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { db } from "@/services/db";
import { newsletterSubscribers as ns } from "@/services/db/schema";

export const metadata = { title: "Newsletter" };

const STATUS = { pending: { label: "unbestätigt", tone: "warning" }, confirmed: { label: "bestätigt", tone: "accent" }, unsubscribed: { label: "abgemeldet", tone: "neutral" } } as const;

export default async function AdminNewsletter({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const sp = await searchParams;
  const status = sp.status && sp.status in STATUS ? (sp.status as keyof typeof STATUS) : null;
  const q = sp.q?.trim().slice(0, 80);
  const [counts, rows] = await Promise.all([
    db.select({ status: ns.status, n: count() }).from(ns).groupBy(ns.status),
    db
      .select()
      .from(ns)
      .where(status ? eq(ns.status, status) : q ? ilike(ns.email, `%${q}%`) : undefined)
      .orderBy(desc(ns.signupAt))
      .limit(300),
  ]);
  const n = (s: string) => counts.find((c) => c.status === s)?.n ?? 0;
  return (
    <AdminPage
      title="Newsletter"
      description="Double-Opt-in: Nur bestätigte Adressen dürfen Werbung erhalten. Der Export enthält ausschließlich bestätigte Adressen."
      actions={<ButtonLink href="/admin/newsletter/export" size="sm" variant="secondary" prefetch={false}>CSV exportieren</ButtonLink>}
    >
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat label="Bestätigt" value={n("confirmed")} />
        <Stat label="Unbestätigt" value={n("pending")} hint="Bestätigungslink noch nicht geklickt" />
        <Stat label="Abgemeldet" value={n("unsubscribed")} />
      </div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <nav aria-label="Status" className="flex flex-wrap gap-1">
          {[null, "confirmed", "pending", "unsubscribed"].map((s) => (
            <Link key={s ?? "all"} href={s ? `/admin/newsletter?status=${s}` : "/admin/newsletter"} className={cn("rounded-sm px-3 py-1.5 text-caption", status === s ? "bg-ink text-paper" : "text-ink-soft hover:bg-porcelain")}>
              {s ? STATUS[s as keyof typeof STATUS].label : "Alle"}
            </Link>
          ))}
        </nav>
        <form><input name="q" defaultValue={q} placeholder="E-Mail suchen" aria-label="E-Mail suchen" className="h-9 w-56 rounded-sm border border-line-strong bg-white px-3 text-small" /></form>
      </div>
      <Table head={["E-Mail", "Status", "Quelle", "Angemeldet", "Bestätigt", ""]} empty={rows.length ? undefined : "Keine Einträge."}>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td>{r.email}</Td>
            <Td><StatusPill tone={STATUS[r.status].tone}>{STATUS[r.status].label}</StatusPill></Td>
            <Td className="text-ink-soft">{r.source ?? "-"}</Td>
            <Td className="text-ink-soft">{formatDateTime(r.signupAt)}</Td>
            <Td className="text-ink-soft">{r.confirmedAt ? formatDateTime(r.confirmedAt) : "-"}</Td>
            <Td>
              <div className="flex justify-end gap-2">
                {r.status !== "unsubscribed" && <ActionButton action={unsubscribeSubscriberAction.bind(null, r.id)} label="Abmelden" variant="ghost" />}
                <ActionButton action={deleteSubscriberAction.bind(null, r.id)} label="Löschen" variant="ghost" confirm="Eintrag endgültig löschen (z. B. auf Löschwunsch)?" />
              </div>
            </Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
