"use client";

import { Check as CheckIcon, Lock, PencilSimple } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import Link from "next/link";
import { useMemo, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Select, Textarea } from "@/components/ui/field";
import { Icon } from "@/components/ui/icon";
import { track } from "@/features/consent/analytics";
import { computeTotals } from "@/lib/commerce/pricing";
import { COUNTRY_NAMES } from "@/lib/commerce/shipping";
import { formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import { emailSchema } from "@/lib/validation/auth";
import { addressSchema, type AddressInput } from "@/lib/validation/checkout";
import type { CartView } from "@/services/cart";
import { placeOrderAction } from "./actions";

export type CheckoutConfig = {
  zones: { id: string; name: string; countries: string[]; methods: { id: string; name: string; carrier: string; priceCents: number; freeFromCents: number | null; deliveryTime: string }[] }[];
  pickup: { enabled: boolean; label: string; readyTime: string; instructions: string };
  payments: { id: string; label: string }[];
  taxRatePercent: number;
  testMode: boolean;
};

type Prefill = { email: string; firstName: string; lastName: string } | null;

const EMPTY_ADDRESS: AddressInput = {
  firstName: "",
  lastName: "",
  company: null,
  street: "",
  houseNumber: "",
  addressLine2: null,
  postalCode: "",
  city: "",
  country: "DE",
  phone: null,
};

const STEPS = ["Kontakt", "Lieferadresse", "Versand", "Zahlung", "Prüfen"] as const;

function issuesToErrors(issues: { path: PropertyKey[]; message: string }[], prefix = "") {
  const out: Record<string, string> = {};
  for (const i of issues) {
    const key = prefix + i.path.map(String).join(".");
    if (!out[key]) out[key] = i.message;
  }
  return out;
}

function AddressFields({
  prefix,
  value,
  onChange,
  errors,
  countries,
  autoPrefix,
}: {
  prefix: string;
  value: AddressInput;
  onChange: (v: AddressInput) => void;
  errors: Record<string, string>;
  countries: string[];
  autoPrefix: "shipping" | "billing";
}) {
  const set = (k: keyof AddressInput) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => onChange({ ...value, [k]: e.target.value || (k === "company" || k === "addressLine2" || k === "phone" ? null : "") });
  const err = (k: string) => errors[`${prefix}.${k}`];
  return (
    <div className="grid grid-cols-6 gap-x-4 gap-y-5">
      <Field label="Vorname" error={err("firstName")} className="col-span-6 sm:col-span-3">
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete={`${autoPrefix} given-name`} value={value.firstName} onChange={set("firstName")} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Nachname" error={err("lastName")} className="col-span-6 sm:col-span-3">
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete={`${autoPrefix} family-name`} value={value.lastName} onChange={set("lastName")} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Firma" optional error={err("company")} className="col-span-6">
        {({ id, describedBy }) => <Input id={id} autoComplete={`${autoPrefix} organization`} value={value.company ?? ""} onChange={set("company")} aria-describedby={describedBy} />}
      </Field>
      <Field label="Straße" error={err("street")} className="col-span-4">
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete={`${autoPrefix} address-line1`} value={value.street} onChange={set("street")} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Nr." error={err("houseNumber")} className="col-span-2">
        {({ id, describedBy, invalid }) => <Input id={id} value={value.houseNumber} onChange={set("houseNumber")} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Adresszusatz" optional className="col-span-6">
        {({ id }) => <Input id={id} autoComplete={`${autoPrefix} address-line2`} value={value.addressLine2 ?? ""} onChange={set("addressLine2")} />}
      </Field>
      <Field label="PLZ" error={err("postalCode")} className="col-span-2">
        {({ id, describedBy, invalid }) => <Input id={id} inputMode="numeric" autoComplete={`${autoPrefix} postal-code`} value={value.postalCode} onChange={set("postalCode")} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Ort" error={err("city")} className="col-span-4">
        {({ id, describedBy, invalid }) => <Input id={id} autoComplete={`${autoPrefix} address-level2`} value={value.city} onChange={set("city")} aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Land" error={err("country")} className="col-span-6 sm:col-span-3">
        {({ id, describedBy, invalid }) => (
          <Select id={id} autoComplete={`${autoPrefix} country`} value={value.country} onChange={set("country")} aria-describedby={describedBy} invalid={invalid}>
            {countries.map((c) => (
              <option key={c} value={c}>
                {COUNTRY_NAMES[c] ?? c}
              </option>
            ))}
          </Select>
        )}
      </Field>
      <Field label="Telefon" optional hint="Nur für Rückfragen zur Zustellung." className="col-span-6 sm:col-span-3">
        {({ id, describedBy }) => <Input id={id} type="tel" autoComplete={`${autoPrefix} tel`} value={value.phone ?? ""} onChange={set("phone")} aria-describedby={describedBy} />}
      </Field>
    </div>
  );
}

function StepShell({ index, current, title, summary, onEdit, children }: { index: number; current: number; title: string; summary?: React.ReactNode; onEdit: () => void; children: React.ReactNode }) {
  const done = index < current;
  const active = index === current;
  return (
    <section aria-labelledby={`step-${index}`} className={cn("border-b border-line py-7", !active && !done && "opacity-50")}>
      <div className="flex items-center justify-between gap-4">
        <h2 id={`step-${index}`} className="flex items-center gap-3 font-display text-h3">
          <span
            className={cn(
              "numeric inline-flex size-7 items-center justify-center rounded-full border font-sans text-caption font-semibold",
              done ? "border-accent bg-accent text-white" : active ? "border-ink text-ink" : "border-line-strong text-muted",
            )}
            aria-hidden="true"
          >
            {done ? <Icon icon={CheckIcon} size={14} weight="regular" /> : index + 1}
          </span>
          {title}
        </h2>
        {done && (
          <button type="button" onClick={onEdit} className="inline-flex items-center gap-1.5 text-small text-ink-soft link-underline">
            <Icon icon={PencilSimple} size={14} /> Ändern
          </button>
        )}
      </div>
      {done && summary && <div className="mt-3 pl-10 text-small text-ink-soft">{summary}</div>}
      {active && <div className="mt-6 sm:pl-10">{children}</div>}
    </section>
  );
}

export function CheckoutForm({ cart, config, prefill, savedAddresses }: { cart: CartView; config: CheckoutConfig; prefill: Prefill; savedAddresses: AddressInput[] }) {
  const countries = useMemo(() => [...new Set(config.zones.flatMap((z) => z.countries))], [config.zones]);
  const [step, setStep] = useState(0);
  const [email, setEmail] = useState(prefill?.email ?? "");
  const [newsletter, setNewsletter] = useState(false);
  const [fulfillment, setFulfillment] = useState<"shipping" | "pickup">("shipping");
  const [shipping, setShipping] = useState<AddressInput>(savedAddresses[0] ?? { ...EMPTY_ADDRESS, firstName: prefill?.firstName ?? "", lastName: prefill?.lastName ?? "" });
  const [billingSame, setBillingSame] = useState(true);
  const [billing, setBilling] = useState<AddressInput>({ ...EMPTY_ADDRESS, firstName: prefill?.firstName ?? "", lastName: prefill?.lastName ?? "" });
  const [methodId, setMethodId] = useState<string | null>(null);
  const [payment, setPayment] = useState<string>(config.payments[0]?.id ?? "");
  const [note, setNote] = useState("");
  const [terms, setTerms] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();

  const zone = config.zones.find((z) => z.countries.includes(shipping.country));
  const methods = zone?.methods ?? [];
  const method = methods.find((m) => m.id === methodId) ?? methods[0] ?? null;

  const lines = cart.lines.filter((l) => l.available).map((l) => ({ variantId: l.variantId, productId: l.productId, brandId: l.brandId, unitPriceCents: l.unitPriceCents, quantity: l.quantity }));
  const totals = computeTotals({
    lines,
    discountCents: cart.totals.discountCents,
    shipping: fulfillment === "shipping" && method ? { priceCents: method.priceCents, freeFromCents: method.freeFromCents } : null,
    taxRatePercent: config.taxRatePercent,
  });

  const go = (next: number) => {
    setErrors({});
    setFormError(null);
    setStep(next);
    requestAnimationFrame(() => document.getElementById(`step-${next}`)?.scrollIntoView({ block: "start", behavior: "smooth" }));
  };

  const validateStep = (i: number): boolean => {
    if (i === 0) {
      const r = emailSchema.safeParse(email);
      if (!r.success) {
        setErrors({ email: r.error.issues[0].message });
        return false;
      }
      if (step === 0) track("begin_checkout", { items: cart.itemCount });
    }
    if (i === 1) {
      const e: Record<string, string> = {};
      if (fulfillment === "shipping") {
        const r = addressSchema.safeParse(shipping);
        if (!r.success) Object.assign(e, issuesToErrors(r.error.issues, "shipping."));
      }
      if (fulfillment === "pickup" || !billingSame) {
        const r = addressSchema.safeParse(billing);
        if (!r.success) Object.assign(e, issuesToErrors(r.error.issues, "billing."));
      }
      if (Object.keys(e).length) {
        setErrors(e);
        return false;
      }
    }
    if (i === 2 && fulfillment === "shipping" && !method) {
      setErrors({ method: "In dieses Land liefern wir derzeit nicht." });
      return false;
    }
    if (i === 3 && !payment) {
      setErrors({ payment: "Bitte wählen Sie eine Zahlungsart." });
      return false;
    }
    return true;
  };

  const next = () => validateStep(step) && go(step + 1);

  const submit = () => {
    if (!terms) {
      setErrors({ terms: "Bitte bestätigen Sie die AGB und die Widerrufsbelehrung." });
      return;
    }
    setFormError(null);
    start(async () => {
      const result = await placeOrderAction({
        email,
        phone: (fulfillment === "shipping" ? shipping.phone : billing.phone) || undefined,
        fulfillment,
        shippingAddress: fulfillment === "shipping" ? shipping : null,
        billingSameAsShipping: fulfillment === "shipping" ? billingSame : false,
        billingAddress: fulfillment === "pickup" || !billingSame ? billing : null,
        shippingMethodId: fulfillment === "shipping" ? method?.id ?? null : null,
        paymentMethod: payment,
        customerNote: note || undefined,
        acceptTerms: terms,
        newsletterOptIn: newsletter,
      });
      if (result.ok) {
        window.location.assign(result.data.redirectUrl);
        return;
      }
      setFormError(result.error);
      if (result.fieldErrors) {
        const fe = result.fieldErrors;
        setErrors(Object.fromEntries(Object.entries(fe).map(([k, v]) => [k.replace("shippingAddress", "shipping").replace("billingAddress", "billing"), v])));
        if (fe.email) go(0);
        else if (Object.keys(fe).some((k) => k.startsWith("shippingAddress") || k.startsWith("billingAddress"))) go(1);
      }
    });
  };

  const addressLine = (a: AddressInput) => `${a.firstName} ${a.lastName}, ${a.street} ${a.houseNumber}, ${a.postalCode} ${a.city}, ${COUNTRY_NAMES[a.country] ?? a.country}`;
  const methodPrice = (m: { priceCents: number; freeFromCents: number | null }) =>
    m.freeFromCents != null && cart.totals.subtotalCents - cart.totals.discountCents >= m.freeFromCents ? "kostenlos" : formatPrice(m.priceCents);

  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
      <div className="lg:col-span-7">
        <StepShell index={0} current={step} title={STEPS[0]} onEdit={() => go(0)} summary={email}>
          <div className="flex flex-col gap-5">
            <Field label="E-Mail-Adresse" error={errors.email} hint="Für Bestellbestätigung und Versandinformationen.">
              {({ id, describedBy, invalid }) => (
                <Input id={id} type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} aria-describedby={describedBy} invalid={invalid} />
              )}
            </Field>
            {!prefill && (
              <p className="text-small text-ink-soft">
                Sie haben ein Kundenkonto?{" "}
                <Link href="/anmelden?weiter=/kasse" className="text-ink link-underline">
                  Anmelden
                </Link>
                . Sie können aber auch ohne Konto bestellen.
              </p>
            )}
            <Check label="Newsletter der Parfümerie Liebe erhalten" description="Freiwillig. Sie erhalten eine E-Mail zur Bestätigung und können sich jederzeit abmelden." checked={newsletter} onChange={(e) => setNewsletter(e.currentTarget.checked)} />
            <div>
              <Button onClick={next}>Weiter zur Lieferadresse</Button>
            </div>
          </div>
        </StepShell>

        <StepShell
          index={1}
          current={step}
          title={STEPS[1]}
          onEdit={() => go(1)}
          summary={fulfillment === "pickup" ? config.pickup.label : addressLine(shipping)}
        >
          <div className="flex flex-col gap-6">
            {config.pickup.enabled && (
              <fieldset className="grid grid-cols-2 gap-2">
                <legend className="sr-only">Lieferart</legend>
                {(["shipping", "pickup"] as const).map((f) => (
                  <label key={f} className={cn("flex h-14 cursor-pointer items-center justify-center rounded-sm border text-small transition-colors", fulfillment === f ? "border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-line-strong")}>
                    <input type="radio" name="fulfillment" className="sr-only" checked={fulfillment === f} onChange={() => setFulfillment(f)} />
                    {f === "shipping" ? "Versand" : "Abholung in Hannover"}
                  </label>
                ))}
              </fieldset>
            )}
            {fulfillment === "shipping" ? (
              <>
                {savedAddresses.length > 0 && (
                  <Field label="Gespeicherte Adresse">
                    {({ id }) => (
                      <Select id={id} onChange={(e) => setShipping(savedAddresses[Number(e.target.value)])} defaultValue="0">
                        {savedAddresses.map((a, i) => (
                          <option key={i} value={i}>
                            {addressLine(a)}
                          </option>
                        ))}
                      </Select>
                    )}
                  </Field>
                )}
                <AddressFields prefix="shipping" value={shipping} onChange={setShipping} errors={errors} countries={countries} autoPrefix="shipping" />
                <Check label="Rechnungsadresse entspricht der Lieferadresse" checked={billingSame} onChange={(e) => setBillingSame(e.currentTarget.checked)} />
              </>
            ) : (
              <p className="text-small text-ink-soft">
                {config.pickup.label}. {config.pickup.readyTime && `Abholbereit ${config.pickup.readyTime}. `}
                {config.pickup.instructions}
              </p>
            )}
            {(fulfillment === "pickup" || !billingSame) && (
              <div className="flex flex-col gap-4">
                <h3 className="text-small font-semibold">Rechnungsadresse</h3>
                <AddressFields prefix="billing" value={billing} onChange={setBilling} errors={errors} countries={countries} autoPrefix="billing" />
              </div>
            )}
            <div>
              <Button onClick={next}>Weiter zur Versandart</Button>
            </div>
          </div>
        </StepShell>

        <StepShell
          index={2}
          current={step}
          title={STEPS[2]}
          onEdit={() => go(2)}
          summary={fulfillment === "pickup" ? "Abholung, kostenlos" : method ? `${method.name}${method.carrier ? ` (${method.carrier})` : ""}, ${methodPrice(method)}` : null}
        >
          <div className="flex flex-col gap-4">
            {fulfillment === "pickup" ? (
              <p className="text-small text-ink-soft">Bei Abholung fallen keine Versandkosten an.</p>
            ) : methods.length === 0 ? (
              <p role="alert" className="text-small text-danger">In dieses Land liefern wir derzeit nicht.</p>
            ) : (
              <fieldset className="flex flex-col gap-2">
                <legend className="sr-only">Versandart</legend>
                {methods.map((m) => (
                  <label key={m.id} className={cn("flex cursor-pointer items-center justify-between gap-4 rounded-sm border bg-white p-4", method?.id === m.id ? "border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-line")}>
                    <span className="flex items-center gap-3">
                      <input type="radio" name="method" checked={method?.id === m.id} onChange={() => setMethodId(m.id)} className="size-4 accent-[var(--color-accent)]" />
                      <span>
                        <span className="block text-small font-medium">
                          {m.name}
                          {m.carrier && <span className="font-normal text-ink-soft"> mit {m.carrier}</span>}
                        </span>
                        {m.deliveryTime && <span className="block text-caption text-ink-soft">Lieferzeit {m.deliveryTime}</span>}
                      </span>
                    </span>
                    <span className="numeric text-small font-medium">{methodPrice(m)}</span>
                  </label>
                ))}
              </fieldset>
            )}
            {errors.method && <p role="alert" className="text-caption text-danger">{errors.method}</p>}
            <div>
              <Button onClick={next} disabled={fulfillment === "shipping" && !method}>
                Weiter zur Zahlung
              </Button>
            </div>
          </div>
        </StepShell>

        <StepShell index={3} current={step} title={STEPS[3]} onEdit={() => go(3)} summary={config.payments.find((p) => p.id === payment)?.label}>
          <div className="flex flex-col gap-4">
            {config.testMode && (
              <p className="flex items-center gap-2 text-caption text-warning">
                <Badge tone="muted">Testmodus</Badge> Es wird keine echte Zahlung ausgeführt.
              </p>
            )}
            <fieldset className="flex flex-col gap-2">
              <legend className="sr-only">Zahlungsart</legend>
              {config.payments.map((p) => (
                <label key={p.id} className={cn("flex cursor-pointer items-center gap-3 rounded-sm border bg-white p-4 text-small", payment === p.id ? "border-ink shadow-[inset_0_0_0_1px_var(--color-ink)]" : "border-line")}>
                  <input type="radio" name="payment" checked={payment === p.id} onChange={() => setPayment(p.id)} className="size-4 accent-[var(--color-accent)]" />
                  {p.label}
                </label>
              ))}
            </fieldset>
            {errors.payment && <p role="alert" className="text-caption text-danger">{errors.payment}</p>}
            <p className="flex items-start gap-2 text-caption text-ink-soft">
              <Icon icon={Lock} size={14} className="mt-0.5 shrink-0" />
              Nach der Bestellung werden Sie zur gesicherten Zahlungsseite unseres Zahlungsdienstleisters weitergeleitet. Kartendaten werden nicht von uns gespeichert.
            </p>
            <div>
              <Button onClick={next} disabled={!payment}>
                Weiter zur Übersicht
              </Button>
            </div>
          </div>
        </StepShell>

        <StepShell index={4} current={step} title={STEPS[4]} onEdit={() => go(4)}>
          <div className="flex flex-col gap-6">
            <dl className="grid grid-cols-1 gap-4 text-small sm:grid-cols-2">
              <div>
                <dt className="text-muted">Kontakt</dt>
                <dd>{email}</dd>
              </div>
              <div>
                <dt className="text-muted">{fulfillment === "pickup" ? "Abholung" : "Lieferadresse"}</dt>
                <dd>{fulfillment === "pickup" ? config.pickup.label : addressLine(shipping)}</dd>
              </div>
              <div>
                <dt className="text-muted">Rechnungsadresse</dt>
                <dd>{fulfillment === "shipping" && billingSame ? "wie Lieferadresse" : addressLine(billing)}</dd>
              </div>
              <div>
                <dt className="text-muted">Zahlungsart</dt>
                <dd>{config.payments.find((p) => p.id === payment)?.label}</dd>
              </div>
            </dl>
            <Field label="Anmerkung zur Bestellung" optional>
              {({ id }) => <Textarea id={id} value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} className="min-h-20" />}
            </Field>
            <div>
              <Check
                checked={terms}
                onChange={(e) => {
                  setTerms(e.currentTarget.checked);
                  setErrors({});
                }}
                label={
                  <>
                    Ich habe die{" "}
                    <Link href="/agb" target="_blank" className="link-underline">
                      AGB
                    </Link>{" "}
                    und die{" "}
                    <Link href="/widerruf" target="_blank" className="link-underline">
                      Widerrufsbelehrung
                    </Link>{" "}
                    gelesen. Hinweise zum Datenschutz finden Sie in der{" "}
                    <Link href="/datenschutz" target="_blank" className="link-underline">
                      Datenschutzerklärung
                    </Link>
                    .
                  </>
                }
              />
              {errors.terms && <p role="alert" className="mt-1 text-caption text-danger">{errors.terms}</p>}
            </div>
            {formError && (
              <p role="alert" className="rounded-sm border border-danger/30 bg-danger-soft px-4 py-3 text-small text-danger">
                {formError}{" "}
                {formError.includes("Warenkorb") && (
                  <Link href="/warenkorb" className="link-underline">
                    Zum Warenkorb
                  </Link>
                )}
              </p>
            )}
            <Button size="lg" className="w-full sm:w-auto" onClick={submit} loading={pending} loadingLabel="Bestellung wird angelegt">
              Zahlungspflichtig bestellen
            </Button>
          </div>
        </StepShell>
      </div>

      <aside className="lg:col-span-4 lg:col-start-9" aria-label="Bestellübersicht">
        <div className="flex flex-col gap-5 rounded-sm border border-line bg-white p-6 lg:sticky lg:top-6">
          <h2 className="font-display text-h3">Ihre Bestellung</h2>
          <ul className="flex flex-col gap-4">
            {cart.lines.map((l) => (
              <li key={l.variantId} className="grid grid-cols-[3.5rem_1fr_auto] items-center gap-3">
                <span className="relative block aspect-[4/5] overflow-hidden bg-porcelain">
                  {l.imageUrl && <Image src={l.imageUrl} alt="" fill sizes="56px" className="object-cover" />}
                  <span className="numeric absolute -top-1.5 -right-1.5 inline-flex size-5 items-center justify-center rounded-full bg-ink text-[0.6875rem] text-paper">{l.quantity}</span>
                </span>
                <span className="min-w-0 text-caption">
                  <span className="block text-muted">{l.brandName}</span>
                  <span className="block truncate text-ink">{l.productName}</span>
                  <span className="block text-ink-soft">{l.displaySize}</span>
                </span>
                <span className="numeric text-small">{formatPrice(l.lineTotalCents)}</span>
              </li>
            ))}
          </ul>
          {cart.samples.selectedIds.length > 0 && (
            <p className="text-caption text-ink-soft">Dazu {cart.samples.selectedIds.length} kostenlose Duftproben.</p>
          )}
          {cart.coupon?.applied && <p className="text-caption text-accent">Gutschein {cart.coupon.code} angewendet</p>}
          <dl className="numeric flex flex-col gap-2 border-t border-line pt-4 text-small">
            <div className="flex justify-between">
              <dt className="text-ink-soft">Zwischensumme</dt>
              <dd>{formatPrice(totals.subtotalCents)}</dd>
            </div>
            {totals.discountCents > 0 && (
              <div className="flex justify-between">
                <dt className="text-ink-soft">Rabatt</dt>
                <dd className="text-accent">-{formatPrice(totals.discountCents)}</dd>
              </div>
            )}
            <div className="flex justify-between">
              <dt className="text-ink-soft">{fulfillment === "pickup" ? "Abholung" : "Versand"}</dt>
              <dd>{totals.shippingCents === 0 ? "kostenlos" : formatPrice(totals.shippingCents)}</dd>
            </div>
            <div className="mt-2 flex justify-between border-t border-line pt-3 text-body font-semibold">
              <dt>Gesamt</dt>
              <dd>{formatPrice(totals.totalCents)}</dd>
            </div>
            <p className="text-right text-caption text-muted">inkl. {formatPrice(totals.taxCents)} MwSt.</p>
          </dl>
          <Link href="/warenkorb" className="text-caption text-ink-soft link-underline">
            Warenkorb bearbeiten
          </Link>
        </div>
      </aside>
    </div>
  );
}
