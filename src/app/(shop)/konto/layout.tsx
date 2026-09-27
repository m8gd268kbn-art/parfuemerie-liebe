import type { Metadata } from "next";
import { AccountNav } from "@/features/account/account-nav";
import { requireUser } from "@/services/auth/session";

export const metadata: Metadata = { title: "Kundenkonto", robots: { index: false, follow: false } };

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser("/konto");
  return (
    <div className="container-page pt-10 pb-24 md:pt-14">
      <p className="text-small text-ink-soft">Kundenkonto</p>
      <h1 className="mt-2 font-display text-h1">Guten Tag, {user.firstName}.</h1>
      <div className="mt-10 grid gap-10 lg:grid-cols-12 lg:gap-6">
        <aside className="lg:col-span-3">
          <AccountNav />
        </aside>
        <div className="min-w-0 lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}
