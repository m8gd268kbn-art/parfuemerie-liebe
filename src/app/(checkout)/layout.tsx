import { Lock } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Wordmark } from "@/components/layout/logo";
import { Icon } from "@/components/ui/icon";
import { Toaster } from "@/components/ui/toaster";

/** Ablenkungsfreie Kasse: keine Shop-Navigation, nur Rückweg und Rechtliches. */
export default function CheckoutLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-[100dvh] flex-col">
      <DemoBanner />
      <header className="border-b border-line">
        <div className="container-page flex h-[var(--header-height)] items-center justify-between">
          <Link href="/" aria-label="Parfümerie Liebe, zur Startseite" className="rounded-sm">
            <Wordmark compact />
          </Link>
          <p className="flex items-center gap-2 text-small text-ink-soft">
            <Icon icon={Lock} size={16} /> Sichere Kasse
          </p>
        </div>
      </header>
      <main id="inhalt" className="flex-1">
        {children}
      </main>
      <footer className="border-t border-line">
        <nav aria-label="Rechtliches" className="container-page flex flex-wrap gap-x-6 gap-y-2 py-6 text-caption text-muted">
          <Link href="/agb" className="hover:text-ink">AGB</Link>
          <Link href="/widerruf" className="hover:text-ink">Widerrufsbelehrung</Link>
          <Link href="/datenschutz" className="hover:text-ink">Datenschutz</Link>
          <Link href="/impressum" className="hover:text-ink">Impressum</Link>
          <Link href="/versand" className="hover:text-ink">Versand</Link>
        </nav>
      </footer>
      <Toaster />
    </div>
  );
}
