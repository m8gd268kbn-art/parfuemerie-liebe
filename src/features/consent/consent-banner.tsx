"use client";

import Link from "next/link";
import Script from "next/script";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import { Check } from "@/components/ui/field";
import { Modal } from "@/components/ui/dialog";
import { analyticsProvider } from "./analytics";
import { CONSENT_OPEN_EVENT, consentSnapshot, readConsent, subscribeConsent, writeConsent, type Consent } from "./consent";

/**
 * Zurückhaltender Consent-Hinweis unten links (kein blockierendes Popup).
 * „Nur notwendige“ ist gleichwertig zu „Alle akzeptieren“ platziert.
 */
export function ConsentBanner() {
  // undefined = noch unbekannt (Server-Rendering), null = keine Auswahl getroffen.
  const consent = useSyncExternalStore<Consent | null | undefined>(subscribeConsent, consentSnapshot, () => undefined);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  const openSettings = useCallback(() => {
    const current = readConsent();
    setAnalytics(current?.analytics ?? false);
    setMarketing(current?.marketing ?? false);
    setSettingsOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener(CONSENT_OPEN_EVENT, openSettings);
    return () => window.removeEventListener(CONSENT_OPEN_EVENT, openSettings);
  }, [openSettings]);

  const save = (choice: { analytics: boolean; marketing: boolean }) => {
    writeConsent(choice);
    setSettingsOpen(false);
  };

  const provider = analyticsProvider();

  return (
    <>
      {provider === "plausible" && consent?.analytics && (
        <Script
          src="https://plausible.io/js/script.tagged-events.js"
          data-domain={process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN}
          strategy="afterInteractive"
        />
      )}

      {consent === null && !settingsOpen && (
        <section
          aria-label="Cookie-Einstellungen"
          className="sheet-top fixed right-4 bottom-4 left-4 z-[65] max-w-[26rem] rounded-sm border border-line bg-paper p-6 shadow-overlay sm:right-auto"
          data-state="open"
        >
          <h2 className="text-h4 font-semibold">Ihre Privatsphäre</h2>
          <p className="mt-2 text-small text-ink-soft">
            Wir verwenden notwendige Cookies für Warenkorb, Anmeldung und Sicherheit. Statistik und Marketing nutzen wir nur mit
            Ihrer Zustimmung. Details in der{" "}
            <Link href="/datenschutz" className="link-underline text-ink">
              Datenschutzerklärung
            </Link>
            .
          </p>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <Button variant="secondary" size="sm" onClick={() => save({ analytics: false, marketing: false })}>
              Nur notwendige
            </Button>
            <Button variant="primary" size="sm" onClick={() => save({ analytics: true, marketing: true })}>
              Alle akzeptieren
            </Button>
          </div>
          <button
            type="button"
            onClick={openSettings}
            className="mt-4 text-caption text-ink-soft link-underline"
          >
            Einstellungen anpassen
          </button>
        </section>
      )}

      <Modal open={settingsOpen} onOpenChange={setSettingsOpen} title="Cookie-Einstellungen" description="Wählen Sie, welche optionalen Dienste wir verwenden dürfen. Sie können Ihre Auswahl jederzeit im Footer ändern.">
        <div className="flex flex-col gap-3">
          <Check label="Notwendig" description="Warenkorb, Anmeldung, Sicherheit, Speicherung dieser Auswahl. Immer aktiv." checked disabled readOnly />
          <Check
            label="Statistik"
            description={provider ? "Anonyme Reichweitenmessung (Plausible), ohne Cookies zur Wiedererkennung." : "Derzeit ist kein Statistikdienst eingebunden."}
            checked={analytics}
            onChange={(e) => setAnalytics(e.currentTarget.checked)}
          />
          <Check
            label="Marketing"
            description="Derzeit sind keine Marketingdienste eingebunden. Ihre Auswahl gilt für künftige Dienste."
            checked={marketing}
            onChange={(e) => setMarketing(e.currentTarget.checked)}
          />
        </div>
        <div className="mt-6 grid grid-cols-2 gap-2">
          <Button variant="secondary" size="sm" onClick={() => save({ analytics: false, marketing: false })}>
            Nur notwendige
          </Button>
          <Button variant="primary" size="sm" onClick={() => save({ analytics, marketing })}>
            Auswahl speichern
          </Button>
        </div>
      </Modal>
    </>
  );
}

export function ConsentSettingsLink({ className }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={() => window.dispatchEvent(new Event(CONSENT_OPEN_EVENT))}>
      Cookie-Einstellungen
    </button>
  );
}
