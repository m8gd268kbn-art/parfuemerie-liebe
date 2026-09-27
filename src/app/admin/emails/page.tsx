import { desc, eq } from "drizzle-orm";
import Link from "next/link";
import { AdminPage, StatusPill, Table, Td } from "@/features/admin/ui";
import { formatDateTime } from "@/lib/format";
import { db } from "@/services/db";
import { emailOutbox } from "@/services/db/schema";

export const metadata = { title: "E-Mail-Protokoll" };

const TEMPLATE_LABEL: Record<string, string> = {
  order_confirmation: "Bestellbestätigung",
  shipping_confirmation: "Versandbestätigung",
  order_cancelled: "Stornierung",
  refund: "Erstattung",
  verify_email: "E-Mail bestätigen",
  reset_password: "Passwort zurücksetzen",
  newsletter_confirm: "Newsletter-Bestätigung",
  contact: "Kontaktanfrage",
};

export default async function AdminEmails({ searchParams }: { searchParams: Promise<{ id?: string }> }) {
  const { id } = await searchParams;
  const rows = await db
    .select({ id: emailOutbox.id, to: emailOutbox.to, subject: emailOutbox.subject, template: emailOutbox.template, provider: emailOutbox.provider, status: emailOutbox.status, error: emailOutbox.error, createdAt: emailOutbox.createdAt })
    .from(emailOutbox)
    .orderBy(desc(emailOutbox.createdAt))
    .limit(200);
  const selected = id && /^[0-9a-f-]{36}$/i.test(id) ? (await db.select().from(emailOutbox).where(eq(emailOutbox.id, id)).limit(1))[0] : undefined;
  return (
    <AdminPage title="E-Mail-Protokoll" description="Alle vom Shop versendeten E-Mails (bei E-Mail-Anbieter „outbox“ nur protokolliert, nicht zugestellt).">
      {selected && (
        <section className="rounded-sm border border-line bg-white">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-3.5 text-small">
            <span><span className="font-semibold">{selected.subject}</span><span className="ml-3 text-muted">an {selected.to}</span></span>
            <Link href="/admin/emails" className="text-ink-soft link-underline">Schließen</Link>
          </div>
          {/* Vorschau isoliert (sandbox ohne Skripte), da HTML aus Vorlagen mit Kundendaten stammt. */}
          <iframe title="Vorschau der E-Mail" srcDoc={selected.html} sandbox="" className="h-[36rem] w-full bg-white" />
        </section>
      )}
      <Table head={["Datum", "Empfänger", "Betreff", "Vorlage", "Status"]} empty={rows.length ? undefined : "Noch keine E-Mails."}>
        {rows.map((r) => (
          <tr key={r.id} className="hover:bg-porcelain/50">
            <Td className="whitespace-nowrap text-ink-soft">{formatDateTime(r.createdAt)}</Td>
            <Td>{r.to}</Td>
            <Td><Link href={`/admin/emails?id=${r.id}`} className="font-medium hover:underline">{r.subject}</Link></Td>
            <Td className="text-ink-soft">{TEMPLATE_LABEL[r.template] ?? r.template}</Td>
            <Td>{r.status === "sent" ? <StatusPill tone="accent">{r.provider === "outbox" ? "protokolliert" : "gesendet"}</StatusPill> : <StatusPill tone="danger">{r.error ?? r.status}</StatusPill>}</Td>
          </tr>
        ))}
      </Table>
    </AdminPage>
  );
}
