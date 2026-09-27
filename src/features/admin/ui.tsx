import Link from "next/link";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminPage({ title, description, actions, children }: { title: string; description?: ReactNode; actions?: ReactNode; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-8">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="font-display text-h2">{title}</h1>
          {description && <p className="mt-2 max-w-2xl text-small text-ink-soft">{description}</p>}
        </div>
        {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
      </header>
      {children}
    </div>
  );
}

export function Panel({ title, children, className, actions }: { title?: string; children: ReactNode; className?: string; actions?: ReactNode }) {
  return (
    <section className={cn("rounded-sm border border-line bg-white", className)}>
      {title && (
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-3.5">
          <h2 className="text-small font-semibold">{title}</h2>
          {actions}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Table({ head, children, empty }: { head: ReactNode[]; children: ReactNode; empty?: string }) {
  return (
    <div className="overflow-x-auto rounded-sm border border-line bg-white">
      <table className="tabular w-full min-w-[40rem] text-left text-small">
        <thead className="border-b border-line bg-porcelain/60 text-caption text-ink-soft">
          <tr>{head.map((h, i) => <th key={i} scope="col" className="px-4 py-2.5 font-medium">{h}</th>)}</tr>
        </thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
      {empty && <p className="px-4 py-8 text-center text-small text-muted">{empty}</p>}
    </div>
  );
}

export function Td({ children, className }: { children: ReactNode; className?: string }) {
  return <td className={cn("px-4 py-3 align-middle", className)}>{children}</td>;
}

export function Stat({ label, value, hint }: { label: string; value: ReactNode; hint?: string }) {
  return (
    <div className="rounded-sm border border-line bg-white p-5">
      <p className="text-caption text-ink-soft">{label}</p>
      <p className="tabular mt-2 font-display text-[2rem] leading-none">{value}</p>
      {hint && <p className="mt-2 text-[0.75rem] text-muted">{hint}</p>}
    </div>
  );
}

export function StatusPill({ tone, children }: { tone: "neutral" | "accent" | "warning" | "danger"; children: ReactNode }) {
  return (
    <span
      className={cn(
        "inline-flex h-6 items-center rounded-sm px-2 text-[0.75rem] font-medium whitespace-nowrap",
        tone === "accent" && "bg-positive-soft text-positive",
        tone === "warning" && "bg-warning-soft text-warning",
        tone === "danger" && "bg-danger-soft text-danger",
        tone === "neutral" && "bg-porcelain text-ink-soft",
      )}
    >
      {children}
    </span>
  );
}

export function AdminLink({ href, children }: { href: string; children: ReactNode }) {
  return <Link href={href} className="font-medium text-ink hover:underline">{children}</Link>;
}
