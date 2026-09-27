import Link from "next/link";
import { cn } from "@/lib/utils";

export type Crumb = { label: string; href?: string };

/** Brotkrumen (sichtbar) – strukturierte Daten werden separat als JSON-LD ausgegeben. */
export function Breadcrumbs({ items, className }: { items: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Brotkrumen" className={cn("text-caption text-muted", className)}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1">
        {items.map((item, i) => (
          <li key={`${item.label}-${i}`} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className="text-line-strong">
                /
              </span>
            )}
            {item.href && i < items.length - 1 ? (
              <Link href={item.href} className="transition-colors duration-150 hover:text-ink">
                {item.label}
              </Link>
            ) : (
              <span aria-current={i === items.length - 1 ? "page" : undefined} className="text-ink-soft">
                {item.label}
              </span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
