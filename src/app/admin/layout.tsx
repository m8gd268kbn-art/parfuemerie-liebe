import type { Metadata } from "next";
import Link from "next/link";
import { Wordmark } from "@/components/layout/logo";
import { Toaster } from "@/components/ui/toaster";
import { logoutAction } from "@/features/account/actions";
import { AdminNav } from "@/features/admin/admin-nav";
import { requireAdmin } from "@/services/auth/session";

export const metadata: Metadata = { title: { default: "Admin", template: "%s | Admin Parfümerie Liebe" }, robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

/** Geschützter Admin-Bereich: Rechteprüfung serverseitig (Nicht-Admins erhalten 404). */
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireAdmin();
  return (
    <div className="min-h-[100dvh] bg-paper">
      <header className="sticky top-0 z-40 border-b border-line bg-paper">
        <div className="flex h-14 items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-4">
            <Link href="/admin" aria-label="Admin-Dashboard"><Wordmark compact className="scale-90" /></Link>
            <span className="label text-[0.6875rem] text-muted">Admin</span>
          </div>
          <div className="flex items-center gap-4 text-small">
            <Link href="/" className="text-ink-soft link-underline">Zum Shop</Link>
            <span className="hidden text-muted sm:inline">{user.email}</span>
            <form action={logoutAction}><button type="submit" className="text-ink-soft link-underline">Abmelden</button></form>
          </div>
        </div>
      </header>
      <div className="grid grid-cols-1 gap-8 px-5 py-8 lg:grid-cols-[13rem_1fr]">
        <aside className="lg:sticky lg:top-22 lg:self-start">
          <AdminNav />
        </aside>
        <main id="inhalt" className="min-w-0">{children}</main>
      </div>
      <Toaster />
    </div>
  );
}
