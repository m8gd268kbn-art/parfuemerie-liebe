import type { Metadata } from "next";
import { Breadcrumbs } from "@/components/ui/breadcrumbs";
import { ContactForm } from "@/features/content/contact-form";
import { StoreInfo } from "@/features/content/store-info";
import { getSettings } from "@/services/settings";

export const metadata: Metadata = { title: "Kontakt", alternates: { canonical: "/kontakt" } };

export default async function ContactPage() {
  const s = await getSettings();
  return (
    <div className="container-page pt-8 pb-24">
      <Breadcrumbs items={[{ label: "Startseite", href: "/" }, { label: "Kontakt" }]} />
      <div className="mt-10 grid grid-cols-1 gap-14 lg:grid-cols-12 lg:gap-6">
        <div className="lg:col-span-5">
          <h1 className="font-display text-h1">Kontakt</h1>
          <p className="mt-4 text-body-lg text-ink-soft">Fragen zu einem Duft, zu Ihrer Bestellung oder zur Beratung? Wir helfen gern, online und in der Parfümerie.</p>
          <div className="mt-10"><StoreInfo settings={s} /></div>
        </div>
        <div className="lg:col-span-6 lg:col-start-7">
          <h2 className="mb-6 font-display text-h3">Nachricht schreiben</h2>
          <ContactForm enabled={Boolean(s.store.supportEmail || s.store.email)} />
          {!(s.store.supportEmail || s.store.email) && <p className="mt-4 text-caption text-muted">Das Formular wird aktiv, sobald im Admin eine Kontakt-E-Mail hinterlegt ist.</p>}
        </div>
      </div>
    </div>
  );
}
