"use client";

import * as Slider from "@radix-ui/react-slider";
import { SlidersHorizontal, X } from "@phosphor-icons/react/dist/ssr";
import { usePathname, useRouter } from "next/navigation";
import { createContext, useContext, useMemo, useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { SORTS, type SortKey } from "@/config/catalog";
import { activeFilterCount, filtersToQuery, type CatalogFilters, type Facets } from "@/lib/catalog/filters";
import { cn } from "@/lib/utils";

type Hidden = ("brand" | "gender" | "niche" | "isNew" | "bestseller" | "sale")[];

type Ctx = {
  filters: CatalogFilters;
  facets: Facets;
  hidden: Hidden;
  pending: boolean;
  update: (patch: Partial<CatalogFilters>) => void;
  reset: () => void;
};

const FilterCtx = createContext<Ctx | null>(null);
const useFilters = () => useContext(FilterCtx)!;

/** Stellt Filterzustand bereit; jede Änderung schreibt die URL (teil- und neu ladbar). */
export function FilterProvider({ filters, facets, hidden = [], children }: { filters: CatalogFilters; facets: Facets; hidden?: Hidden; children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();
  const value = useMemo<Ctx>(
    () => ({
      filters,
      facets,
      hidden,
      pending,
      update: (patch) => {
        const next = { ...filters, ...patch, page: patch.page ?? 1 };
        start(() => router.push(`${pathname}${filtersToQuery(next)}`, { scroll: false }));
      },
      reset: () => start(() => router.push(`${pathname}${filtersToQuery({ q: filters.q, sort: filters.sort })}`, { scroll: false })),
    }),
    [filters, facets, hidden, pending, pathname, router],
  );
  return <FilterCtx.Provider value={value}>{children}</FilterCtx.Provider>;
}

/** Ergebnisbereich: während einer Filteränderung leicht abgeblendet (kein Spinner). */
export function ResultsArea({ children }: { children: ReactNode }) {
  const { pending } = useFilters();
  return (
    <div aria-busy={pending} className={cn("transition-[opacity,filter] duration-200 ease-out", pending && "opacity-50 blur-[1px]")}>
      {children}
    </div>
  );
}

function toggle<T>(list: T[], value: T) {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function OptionList({ title, options, selected, onToggle, searchable }: { title: string; options: { value: string; label: string; count: number }[]; selected: string[]; onToggle: (v: string) => void; searchable?: boolean }) {
  const [q, setQ] = useState("");
  const [expanded, setExpanded] = useState(false);
  if (!options.length) return null;
  const visible = options.filter((o) => !q || o.label.toLowerCase().includes(q.toLowerCase()));
  const limited = expanded || q ? visible : visible.slice(0, 8);
  return (
    <fieldset className="border-b border-line py-5">
      <legend className="float-left mb-3 w-full text-small font-semibold">{title}</legend>
      {searchable && options.length > 8 && (
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={`${title} suchen`}
          aria-label={`${title} suchen`}
          className="mb-3 h-10 w-full rounded-sm border border-line-strong bg-white px-3 text-small placeholder:text-muted focus:border-accent focus:outline-none"
        />
      )}
      <ul className="clear-both flex flex-col">
        {limited.map((o) => {
          const checked = selected.includes(o.value);
          const disabled = o.count === 0 && !checked;
          return (
            <li key={o.value}>
              <label className={cn("group flex cursor-pointer items-center gap-3 py-1.5 text-small", disabled && "cursor-not-allowed opacity-45")}>
                <input
                  type="checkbox"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(o.value)}
                  className="peer size-[16px] shrink-0 cursor-pointer appearance-none rounded-[2px] border border-line-strong bg-white transition-colors duration-150 checked:border-accent checked:bg-accent group-hover:border-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                />
                <span className="flex-1 text-ink-soft peer-checked:text-ink">{o.label}</span>
                <span className="numeric text-caption text-muted">{o.count}</span>
              </label>
            </li>
          );
        })}
      </ul>
      {!q && visible.length > 8 && (
        <button type="button" onClick={() => setExpanded((e) => !e)} className="mt-2 text-caption text-ink-soft link-underline">
          {expanded ? "Weniger anzeigen" : `Alle ${visible.length} anzeigen`}
        </button>
      )}
    </fieldset>
  );
}

function PriceFilter() {
  const { filters, facets, update } = useFilters();
  const min = facets.price.min;
  const max = Math.max(facets.price.max, min + 1);
  const [value, setValue] = useState<[number, number]>([filters.priceMin ?? min, filters.priceMax ?? max]);
  if (facets.price.max <= 0) return null;
  return (
    <fieldset className="border-b border-line py-5">
      <legend className="mb-4 text-small font-semibold">Preis</legend>
      <Slider.Root
        min={min}
        max={max}
        step={5}
        minStepsBetweenThumbs={1}
        value={value}
        onValueChange={(v) => setValue([v[0], v[1]])}
        onValueCommit={(v) => update({ priceMin: v[0] > min ? v[0] : null, priceMax: v[1] < max ? v[1] : null })}
        className="relative flex h-6 w-full touch-none items-center select-none"
      >
        <Slider.Track className="relative h-px grow bg-line-strong">
          <Slider.Range className="absolute h-px bg-ink" />
        </Slider.Track>
        {["Mindestpreis", "Höchstpreis"].map((label) => (
          <Slider.Thumb
            key={label}
            aria-label={label}
            className="block size-5 rounded-full border border-ink bg-paper shadow-popover transition-transform duration-150 hover:scale-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent active:scale-95"
          />
        ))}
      </Slider.Root>
      <p className="numeric mt-3 flex justify-between text-caption text-ink-soft">
        <span>{value[0]} €</span>
        <span>{value[1]} €</span>
      </p>
    </fieldset>
  );
}

function FlagFilters() {
  const { filters, facets, hidden, update } = useFilters();
  const flags: { key: "isNew" | "bestseller" | "sale" | "available" | "niche"; label: string; count: number }[] = [
    { key: "available", label: "Nur verfügbare", count: facets.flags.available },
    { key: "isNew", label: "Neuheiten", count: facets.flags.isNew },
    { key: "bestseller", label: "Bestseller", count: facets.flags.bestseller },
    { key: "sale", label: "Angebote", count: facets.flags.sale },
    { key: "niche", label: "Nischendüfte", count: facets.flags.niche },
  ];
  const shown = flags.filter((f) => !hidden.includes(f.key as never));
  return (
    <fieldset className="py-5">
      <legend className="mb-3 text-small font-semibold">Weitere</legend>
      <ul className="flex flex-col">
        {shown.map((f) => {
          const on = filters[f.key];
          return (
            <li key={f.key}>
              <label className={cn("flex cursor-pointer items-center justify-between gap-3 py-1.5 text-small", f.count === 0 && !on && "cursor-not-allowed opacity-45")}>
                <span className={on ? "text-ink" : "text-ink-soft"}>{f.label}</span>
                <span className="flex items-center gap-3">
                  <span className="numeric text-caption text-muted">{f.count}</span>
                  <input
                    type="checkbox"
                    role="switch"
                    checked={on}
                    disabled={f.count === 0 && !on}
                    onChange={() => update({ [f.key]: !on })}
                    className="relative h-5 w-9 cursor-pointer appearance-none rounded-full bg-line-strong transition-colors duration-200 before:absolute before:top-0.5 before:left-0.5 before:size-4 before:rounded-full before:bg-white before:transition-transform before:duration-200 before:ease-out checked:bg-accent checked:before:translate-x-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
                  />
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}

export function FilterPanel() {
  const { filters, facets, hidden, update } = useFilters();
  return (
    <div>
      {!hidden.includes("gender") && (
        <OptionList title="Für" options={facets.genders} selected={filters.genders} onToggle={(v) => update({ genders: toggle(filters.genders, v) })} />
      )}
      {!hidden.includes("brand") && (
        <OptionList title="Marke" searchable options={facets.brands} selected={filters.brands} onToggle={(v) => update({ brands: toggle(filters.brands, v) })} />
      )}
      <OptionList title="Duftfamilie" options={facets.families} selected={filters.families} onToggle={(v) => update({ families: toggle(filters.families, v) })} />
      <OptionList title="Konzentration" options={facets.concentrations} selected={filters.concentrations} onToggle={(v) => update({ concentrations: toggle(filters.concentrations, v) })} />
      <OptionList
        title="Größe"
        options={facets.sizes}
        selected={filters.sizes.map(String)}
        onToggle={(v) => update({ sizes: toggle(filters.sizes, Number(v)) })}
      />
      <PriceFilter key={`${filters.priceMin}-${filters.priceMax}`} />
      <FlagFilters />
    </div>
  );
}

export function SortSelect() {
  const { filters, update } = useFilters();
  return (
    <label className="flex items-center gap-2 text-small">
      <span className="text-ink-soft max-sm:sr-only">Sortieren nach</span>
      <span className="relative">
        <select
          value={filters.sort}
          onChange={(e) => update({ sort: e.target.value as SortKey })}
          className="h-10 cursor-pointer appearance-none rounded-sm border border-line-strong bg-white pr-9 pl-3 text-small font-medium focus:border-accent focus:outline-none"
        >
          {SORTS.map((s) => (
            <option key={s.key} value={s.key}>
              {s.label}
            </option>
          ))}
        </select>
        <svg aria-hidden="true" viewBox="0 0 16 16" className="pointer-events-none absolute top-1/2 right-3 size-3 -translate-y-1/2" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M3.5 6l4.5 4.5L12.5 6" />
        </svg>
      </span>
    </label>
  );
}

/** Aktive Filter als entfernbare Chips. */
export function ActiveFilters({ labels }: { labels: { brand: Record<string, string>; family: Record<string, string>; conc: Record<string, string>; gender: Record<string, string> } }) {
  const { filters, update, reset } = useFilters();
  const chips: { label: string; remove: () => void }[] = [
    ...filters.genders.map((g) => ({ label: labels.gender[g] ?? g, remove: () => update({ genders: filters.genders.filter((x) => x !== g) }) })),
    ...filters.brands.map((b) => ({ label: labels.brand[b] ?? b, remove: () => update({ brands: filters.brands.filter((x) => x !== b) }) })),
    ...filters.families.map((f) => ({ label: labels.family[f] ?? f, remove: () => update({ families: filters.families.filter((x) => x !== f) }) })),
    ...filters.concentrations.map((c) => ({ label: labels.conc[c] ?? c, remove: () => update({ concentrations: filters.concentrations.filter((x) => x !== c) }) })),
    ...filters.sizes.map((s) => ({ label: `${s} ml`, remove: () => update({ sizes: filters.sizes.filter((x) => x !== s) }) })),
    ...(filters.priceMin != null || filters.priceMax != null
      ? [{ label: `${filters.priceMin ?? 0} bis ${filters.priceMax ?? "∞"} €`, remove: () => update({ priceMin: null, priceMax: null }) }]
      : []),
    ...(filters.note ? [{ label: `Note: ${filters.note}`, remove: () => update({ note: null }) }] : []),
    ...(filters.available ? [{ label: "Nur verfügbare", remove: () => update({ available: false }) }] : []),
    ...(filters.isNew ? [{ label: "Neuheiten", remove: () => update({ isNew: false }) }] : []),
    ...(filters.bestseller ? [{ label: "Bestseller", remove: () => update({ bestseller: false }) }] : []),
    ...(filters.sale ? [{ label: "Angebote", remove: () => update({ sale: false }) }] : []),
    ...(filters.niche ? [{ label: "Nischendüfte", remove: () => update({ niche: false }) }] : []),
  ];
  if (!chips.length) return null;
  return (
    <div className="flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.label}
          type="button"
          onClick={c.remove}
          className="inline-flex h-8 items-center gap-1.5 rounded-sm border border-line-strong bg-white pr-2 pl-3 text-caption text-ink transition-colors hover:border-ink press"
          aria-label={`Filter ${c.label} entfernen`}
        >
          {c.label}
          <Icon icon={X} size={12} />
        </button>
      ))}
      <button type="button" onClick={reset} className="ml-1 text-caption text-ink-soft link-underline">
        Alle zurücksetzen
      </button>
    </div>
  );
}

/** Filter-Drawer für Mobile und Tablet mit Ergebnisbutton. */
export function MobileFilters({ total }: { total: number }) {
  const { filters } = useFilters();
  const [open, setOpen] = useState(false);
  const count = activeFilterCount(filters);
  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setOpen(true)} className="lg:hidden" icon={<Icon icon={SlidersHorizontal} size={16} />}>
        Filter{count > 0 ? ` (${count})` : ""}
      </Button>
      <Drawer
        open={open}
        onOpenChange={setOpen}
        side="left"
        title="Filter"
        footer={
          <div className="p-4">
            <Button className="w-full" size="lg" onClick={() => setOpen(false)}>
              {total} {total === 1 ? "Duft" : "Düfte"} anzeigen
            </Button>
          </div>
        }
      >
        <div className="px-6">
          <FilterPanel />
        </div>
      </Drawer>
    </>
  );
}
