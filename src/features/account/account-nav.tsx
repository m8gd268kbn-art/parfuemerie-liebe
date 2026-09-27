"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { logoutAction } from "./actions";

const ITEMS = [
  { href: "/konto", label: "Übersicht" },
  { href: "/konto/bestellungen", label: "Bestellungen" },
  { href: "/konto/adressen", label: "Adressen" },
  { href: "/konto/wunschliste", label: "Wunschliste" },
  { href: "/konto/profil", label: "Profil und Newsletter" },
];

export function AccountNav() {
  const path = usePathname();
  return (
    <nav aria-label="Kundenkonto" className="no-scrollbar -mx-[var(--gutter)] overflow-x-auto px-[var(--gutter)] lg:mx-0 lg:px-0">
      <ul className="flex gap-6 border-b border-line lg:flex-col lg:gap-1 lg:border-b-0">
        {ITEMS.map((i) => {
          const active = i.href === "/konto" ? path === i.href : path.startsWith(i.href);
          return (
            <li key={i.href}>
              <Link
                href={i.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "block border-b-2 py-3 text-small whitespace-nowrap transition-colors lg:border-b-0 lg:border-l-2 lg:py-2 lg:pl-4",
                  active ? "border-ink text-ink" : "border-transparent text-ink-soft hover:text-ink",
                )}
              >
                {i.label}
              </Link>
            </li>
          );
        })}
        <li>
          <form action={logoutAction}>
            <button type="submit" className="block py-3 text-small whitespace-nowrap text-ink-soft hover:text-ink lg:py-2 lg:pl-4">
              Abmelden
            </button>
          </form>
        </li>
      </ul>
    </nav>
  );
}
