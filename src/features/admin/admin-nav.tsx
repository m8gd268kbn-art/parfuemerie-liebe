"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const GROUPS: { title: string; items: { href: string; label: string }[] }[] = [
  { title: "Übersicht", items: [{ href: "/admin", label: "Dashboard" }, { href: "/admin/bestellungen", label: "Bestellungen" }, { href: "/admin/kunden", label: "Kunden" }] },
  { title: "Sortiment", items: [{ href: "/admin/produkte", label: "Produkte" }, { href: "/admin/marken", label: "Marken" }, { href: "/admin/kategorien", label: "Kategorien" }, { href: "/admin/proben", label: "Duftproben" }] },
  { title: "Marketing", items: [{ href: "/admin/gutscheine", label: "Gutscheine" }, { href: "/admin/bewertungen", label: "Bewertungen" }, { href: "/admin/newsletter", label: "Newsletter" }] },
  { title: "System", items: [{ href: "/admin/einstellungen", label: "Einstellungen" }, { href: "/admin/emails", label: "E-Mail-Protokoll" }] },
];

export function AdminNav() {
  const path = usePathname();
  return (
    <nav aria-label="Admin" className="flex flex-col gap-6">
      {GROUPS.map((g) => (
        <div key={g.title}>
          <p className="label mb-2 px-3 text-[0.625rem] text-muted">{g.title}</p>
          <ul className="flex flex-col">
            {g.items.map((i) => {
              const active = i.href === "/admin" ? path === "/admin" : path.startsWith(i.href);
              return (
                <li key={i.href}>
                  <Link href={i.href} aria-current={active ? "page" : undefined} className={cn("block rounded-sm px-3 py-1.5 text-small transition-colors", active ? "bg-ink text-paper" : "text-ink-soft hover:bg-porcelain hover:text-ink")}>
                    {i.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </nav>
  );
}
