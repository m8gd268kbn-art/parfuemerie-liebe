import { FacebookLogo, InstagramLogo, PinterestLogo, TiktokLogo } from "@phosphor-icons/react/dist/ssr";
import Link from "next/link";
import { Icon } from "@/components/ui/icon";
import { FOOTER_NAV } from "@/config/navigation";
import { ConsentSettingsLink } from "@/features/consent/consent-banner";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import type { ShopSettings } from "@/lib/settings-schema";
import { PAYMENT_METHODS } from "@/config/catalog";
import { Wordmark } from "./logo";

const SOCIAL = [
  { key: "instagram", label: "Instagram", icon: InstagramLogo },
  { key: "facebook", label: "Facebook", icon: FacebookLogo },
  { key: "tiktok", label: "TikTok", icon: TiktokLogo },
  { key: "pinterest", label: "Pinterest", icon: PinterestLogo },
] as const;

export function Footer({ settings }: { settings: ShopSettings }) {
  const socials = SOCIAL.filter((s) => settings.social[s.key]);
  const enabledPayments = PAYMENT_METHODS.filter((m) => settings.payments.methods.some((x) => x.id === m.id && x.enabled));
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-line bg-porcelain">
      <div className="container-page grid grid-cols-1 gap-14 py-16 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:py-24">
        <div className="flex max-w-md flex-col gap-6">
          <Wordmark size="lg" />
          <div>
            <h2 className="font-display text-h3">Neues aus der Parfümerie</h2>
            <p className="mt-2 text-small text-ink-soft">Neuheiten, Duftproben-Aktionen und Beratungstermine, höchstens zweimal im Monat.</p>
          </div>
          <NewsletterForm source="footer" />
        </div>

        <nav aria-label="Fußzeile" className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-4">
          {FOOTER_NAV.map((group) => (
            <div key={group.title}>
              <h2 className="label mb-4 text-muted">{group.title}</h2>
              <ul className="flex flex-col gap-2.5">
                {group.items.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="text-small text-ink-soft transition-colors duration-150 hover:text-ink">
                      {item.label}
                    </Link>
                  </li>
                ))}
                {group.title === "Rechtliches" && (
                  <li>
                    <ConsentSettingsLink className="text-left text-small text-ink-soft transition-colors duration-150 hover:text-ink" />
                  </li>
                )}
              </ul>
            </div>
          ))}
        </nav>
      </div>

      <div className="border-t border-line">
        <div className="container-page flex flex-col gap-6 py-8 text-caption text-muted md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-1">
            <p>© {year} {settings.store.name}, {settings.store.city}</p>
            <p>
              Alle Preise inkl. gesetzlicher MwSt., zzgl.{" "}
              <Link href="/versand" className="link-underline">
                Versandkosten
              </Link>
              .
            </p>
          </div>
          {enabledPayments.length > 0 && (
            <ul aria-label="Zahlungsarten" className="flex flex-wrap gap-2">
              {enabledPayments.map((m) => (
                <li key={m.id} className="rounded-sm border border-line bg-paper px-2.5 py-1 text-[0.6875rem] font-medium text-ink-soft">
                  {m.short}
                </li>
              ))}
            </ul>
          )}
          {socials.length > 0 && (
            <ul aria-label="Soziale Netzwerke" className="flex gap-1">
              {socials.map((s) => (
                <li key={s.key}>
                  <a
                    href={settings.social[s.key]}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={`${settings.store.name} auf ${s.label}`}
                    className="inline-flex size-10 items-center justify-center rounded-full text-ink-soft transition-colors hover:bg-paper hover:text-ink"
                  >
                    <Icon icon={s.icon} />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </footer>
  );
}
