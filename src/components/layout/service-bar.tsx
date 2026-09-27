import Link from "next/link";
import { interpolateServiceText } from "@/lib/commerce/shipping";
import type { ShopSettings } from "@/lib/settings-schema";
import { cn } from "@/lib/utils";

const LINKS = [
  { label: "Bestellung verfolgen", href: "/bestellung-verfolgen" },
  { label: "Hilfe", href: "/faq" },
  { label: "Unsere Parfümerie", href: "/parfuemerie" },
];

/**
 * Service-Leiste über dem Header: links die Service-Hinweise aus den Einstellungen,
 * rechts Service-Links. Mobil nur der erste Hinweis.
 */
export function ServiceBar({ settings }: { settings: ShopSettings }) {
  if (!settings.serviceBar.enabled) return null;
  const items = settings.serviceBar.items.map((t) => interpolateServiceText(t, settings)).filter((t): t is string => Boolean(t));
  return (
    <div className="bg-accent text-white [font-variation-settings:'wdth'_104]">
      <div className="container-page flex h-8 items-center justify-center gap-8 md:justify-between">
        <ul className="label flex min-w-0 items-center gap-8 text-[0.6875rem] tracking-[0.1em]">
          {items.map((item, i) => (
            // Höchstens zwei Hinweise neben den Links (Inhalt ist auf 1440 px begrenzt), nie abgeschnitten.
            <li key={item} className={cn("truncate", i === 1 && "hidden xl:block", i > 1 && "hidden")}>
              {item}
            </li>
          ))}
        </ul>
        <nav aria-label="Service" className="hidden shrink-0 md:block">
          <ul className="label flex items-center text-[0.6875rem] tracking-[0.1em]">
            {LINKS.map((l, i) => (
              <li key={l.href} className="flex items-center">
                {i > 0 && <span aria-hidden="true" className="mx-3 h-3 w-px bg-white/50" />}
                <Link href={l.href} className="text-white/90 transition-colors duration-150 hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </div>
  );
}
