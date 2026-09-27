"use client";

import { Check as CheckIcon, Gift, Tag, Warning } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { Button, ButtonLink } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";
import { QuantityStepper } from "@/components/ui/quantity";
import { useShop } from "@/features/shop/shop-provider";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { CartLine, CartView } from "@/services/cart";
import { applyCouponAction, removeCouponAction, removeItemAction, setQuantityAction, toggleSampleAction } from "./actions";

export function CartLineItem({ line, compact }: { line: CartLine; compact?: boolean }) {
  const { applyCartResult } = useShop();
  const [pending, start] = useTransition();
  const [removing, setRemoving] = useState(false);

  const update = (qty: number) =>
    start(async () => {
      if (qty <= 0) setRemoving(true);
      const result = qty <= 0 ? await removeItemAction(line.variantId) : await setQuantityAction(line.variantId, qty);
      if (!applyCartResult(result, { silent: qty > 0 })) setRemoving(false);
    });

  return (
    <li
      className={cn(
        "grid grid-cols-[5.5rem_1fr] gap-4 py-5 transition-[opacity,filter] duration-200 ease-out sm:grid-cols-[6.5rem_1fr] sm:gap-5",
        (pending || removing) && "opacity-60",
        removing && "blur-[1px]",
      )}
    >
      <Link href={`/produkt/${line.slug}`} className="relative block aspect-[4/5] overflow-hidden bg-white">
        {line.imageUrl && (
          <Image src={line.imageUrl} alt={line.imageAlt} fill sizes="112px" className="object-cover" />
        )}
      </Link>
      <div className="flex min-w-0 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="label truncate text-[0.6875rem] text-muted">{line.brandName}</p>
            <Link href={`/produkt/${line.slug}`} className="mt-1 block font-display text-[1.125rem] leading-snug text-ink">
              {line.productName}
            </Link>
            <p className="mt-0.5 text-caption text-ink-soft">
              {line.concentrationLabel}, {line.displaySize}
            </p>
          </div>
          <p className="numeric shrink-0 text-small font-medium">{formatPrice(line.lineTotalCents)}</p>
        </div>
        {line.notice && (
          <p className="mt-1 flex items-start gap-1.5 text-caption text-warning">
            <Icon icon={Warning} size={14} className="mt-0.5 shrink-0" />
            {line.notice}
          </p>
        )}
        <div className="mt-auto flex items-center justify-between gap-3 pt-3">
          {line.available ? (
            <QuantityStepper
              size={compact ? "sm" : "md"}
              value={line.quantity}
              max={line.maxQuantity}
              disabled={pending}
              onChange={update}
              label={`Menge für ${line.productName} ${line.displaySize}`}
            />
          ) : (
            <span className="text-caption text-muted">Nicht verfügbar</span>
          )}
          <button
            type="button"
            onClick={() => update(0)}
            disabled={pending}
            className="text-caption text-ink-soft link-underline disabled:opacity-50"
          >
            Entfernen
          </button>
        </div>
        {line.quantity > 1 && (
          <p className="numeric text-caption text-muted">{formatPrice(line.unitPriceCents)} pro Stück</p>
        )}
      </div>
    </li>
  );
}

/** Hinweis bis zur Versandkostenfreiheit (echter Wert aus den Einstellungen). */
export function FreeShippingNote({ cart }: { cart: CartView }) {
  const remaining = cart.totals.freeShippingRemainingCents;
  const threshold = cart.shipping?.freeFromCents;
  if (remaining == null || threshold == null || cart.lines.length === 0) return null;
  const progress = Math.min(1, 1 - remaining / threshold);
  return (
    <div className="flex flex-col gap-2.5">
      <p className="text-small text-ink-soft">
        {remaining > 0 ? (
          <>
            Noch <span className="numeric font-medium text-ink">{formatPrice(remaining)}</span> bis zum kostenlosen Versand.
          </>
        ) : (
          <span className="inline-flex items-center gap-1.5 text-accent">
            <Icon icon={CheckIcon} size={16} />
            Ihre Bestellung wird versandkostenfrei geliefert.
          </span>
        )}
      </p>
      <div className="h-px w-full bg-line" aria-hidden="true">
        <div className="h-px origin-left bg-accent transition-transform duration-500 ease-out" style={{ transform: `scaleX(${progress})` }} />
      </div>
    </div>
  );
}

export function SamplePicker({ cart }: { cart: CartView }) {
  const { applyCartResult } = useShop();
  const [pending, start] = useTransition();
  const s = cart.samples;
  if (!s.enabled || s.max === 0 || s.options.length === 0 || cart.lines.length === 0) return null;

  return (
    <section aria-labelledby="samples-title" className="flex flex-col gap-4">
      <div className="flex items-baseline justify-between gap-4">
        <h3 id="samples-title" className="flex items-center gap-2 text-small font-semibold">
          <Icon icon={Gift} size={18} />
          Kostenlose Duftproben
        </h3>
        <p className="numeric text-caption text-muted">
          {s.selectedIds.length} von {s.max} gewählt
        </p>
      </div>
      {!s.eligible ? (
        <p className="text-caption text-ink-soft">Duftproben gibt es ab einem Warenwert von {formatPrice(s.minSubtotalCents)}.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-2" aria-busy={pending}>
          {s.options.map((o) => {
            const selected = s.selectedIds.includes(o.id);
            const full = !selected && s.selectedIds.length >= s.max;
            return (
              <li key={o.id}>
                <button
                  type="button"
                  aria-pressed={selected}
                  disabled={!o.available || full || pending}
                  onClick={() => start(async () => void applyCartResult(await toggleSampleAction(o.id), { silent: true }))}
                  className={cn(
                    "flex h-full w-full items-center gap-3 rounded-sm border bg-white p-2 pr-3 text-left transition-[border-color,background-color] duration-150 press",
                    selected ? "border-accent bg-accent-soft/40" : "border-line hover:border-line-strong",
                    (!o.available || full) && "cursor-not-allowed opacity-50",
                  )}
                >
                  <span className="relative size-11 shrink-0 overflow-hidden bg-porcelain">
                    {o.imageUrl && <Image src={o.imageUrl} alt="" fill sizes="44px" className="object-cover" />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[0.6875rem] tracking-wide text-muted uppercase">{o.brandName}</span>
                    <span className="block truncate text-caption text-ink">{o.name}</span>
                    <span className="block text-[0.6875rem] text-muted">{o.available ? o.sizeLabel : "Vergriffen"}</span>
                  </span>
                  <span
                    aria-hidden="true"
                    className={cn(
                      "flex size-4 shrink-0 items-center justify-center rounded-full border transition-colors",
                      selected ? "border-accent bg-accent text-white" : "border-line-strong",
                    )}
                  >
                    {selected && <Icon icon={CheckIcon} size={10} weight="regular" />}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export function CouponForm({ cart }: { cart: CartView }) {
  const { applyCartResult } = useShop();
  const [open, setOpen] = useState(Boolean(cart.coupon));
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  if (cart.coupon) {
    return (
      <div className="flex items-start justify-between gap-4 text-small">
        <p className="flex items-start gap-2">
          <Icon icon={Tag} size={16} className="mt-0.5 text-accent" />
          <span>
            Gutschein <span className="font-semibold">{cart.coupon.code}</span>
            {!cart.coupon.applied && <span className="block text-caption text-warning">{cart.coupon.message}</span>}
          </span>
        </p>
        <button
          type="button"
          disabled={pending}
          onClick={() => start(async () => void applyCartResult(await removeCouponAction()))}
          className="text-caption text-ink-soft link-underline"
        >
          Entfernen
        </button>
      </div>
    );
  }

  if (!open) {
    return (
      <button type="button" onClick={() => setOpen(true)} className="flex items-center gap-2 text-small text-ink-soft link-underline">
        <Icon icon={Tag} size={16} />
        Gutscheincode einlösen
      </button>
    );
  }

  return (
    <form
      className="flex flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        setError(null);
        start(async () => {
          const result = await applyCouponAction(code);
          if (result.ok) {
            applyCartResult(result);
            setCode("");
          } else setError(result.error);
        });
      }}
    >
      <label htmlFor="coupon" className="text-small font-medium">
        Gutscheincode
      </label>
      <div className="flex gap-2">
        <input
          id="coupon"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          autoComplete="off"
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? "coupon-error" : undefined}
          className="h-11 min-w-0 flex-1 rounded-sm border border-line-strong bg-white px-3 text-small tracking-wider uppercase focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)] focus:outline-none aria-[invalid=true]:border-danger"
        />
        <Button type="submit" variant="secondary" size="sm" className="h-11" loading={pending} disabled={!code.trim()}>
          Einlösen
        </Button>
      </div>
      {error && (
        <p id="coupon-error" role="alert" className="text-caption text-danger">
          {error}
        </p>
      )}
    </form>
  );
}

export function CartSummary({ cart, className }: { cart: CartView; className?: string }) {
  const t = cart.totals;
  const row = "flex items-baseline justify-between gap-4";
  return (
    <dl className={cn("numeric flex flex-col gap-2 text-small", className)}>
      <div className={row}>
        <dt className="text-ink-soft">Zwischensumme</dt>
        <dd>{formatPrice(t.subtotalCents)}</dd>
      </div>
      {t.discountCents > 0 && (
        <div className={row}>
          <dt className="text-ink-soft">Rabatt</dt>
          <dd className="text-accent">-{formatPrice(t.discountCents)}</dd>
        </div>
      )}
      <div className={row}>
        <dt className="text-ink-soft">
          Versand{cart.shipping ? <span className="text-muted"> ({cart.shipping.name}, Deutschland)</span> : null}
        </dt>
        <dd>{t.shippingCents === 0 && cart.lines.length ? "kostenlos" : formatPrice(t.shippingCents)}</dd>
      </div>
      <div className={cn(row, "mt-2 border-t border-line pt-3 text-body font-semibold")}>
        <dt>Gesamt</dt>
        <dd>{formatPrice(t.totalCents)}</dd>
      </div>
      <p className="text-right text-caption text-muted">inkl. {formatPrice(t.taxCents)} MwSt.</p>
    </dl>
  );
}

export function EmptyCart({ onNavigate, className }: { onNavigate?: () => void; className?: string }) {
  return (
    <div className={cn("flex flex-col items-start gap-6 px-6 py-12", className)}>
      <div>
        <p className="font-display text-h2">Ihr Warenkorb ist leer.</p>
        <p className="mt-3 max-w-sm text-body text-ink-soft">
          Stöbern Sie in unseren Neuheiten oder lassen Sie sich vom Duftfinder beraten.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <ButtonLink href="/neuheiten" onClick={onNavigate}>
          Neuheiten ansehen
        </ButtonLink>
        <ButtonLink href="/duftfinder" variant="secondary" onClick={onNavigate}>
          Duftfinder
        </ButtonLink>
      </div>
    </div>
  );
}
