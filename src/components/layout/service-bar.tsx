import { interpolateServiceText } from "@/lib/commerce/shipping";
import type { ShopSettings } from "@/lib/settings-schema";

/** Service-Leiste über dem Header. Texte und Werte kommen aus den Shop-Einstellungen. */
export function ServiceBar({ settings }: { settings: ShopSettings }) {
  if (!settings.serviceBar.enabled) return null;
  const items = settings.serviceBar.items.map((t) => interpolateServiceText(t, settings)).filter((t): t is string => Boolean(t));
  if (!items.length) return null;
  return (
    <div className="bg-accent text-[0.75rem] text-white/90 [font-variation-settings:'wdth'_104]">
      <ul className="container-page flex h-8 items-center justify-center gap-10 overflow-hidden">
        {items.map((item, i) => (
          <li key={item} className={i === 0 ? "truncate" : "hidden truncate md:block"}>
            {item}
          </li>
        ))}
      </ul>
    </div>
  );
}
