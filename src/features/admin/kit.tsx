"use client";

import { createContext, useActionState, useContext, useEffect, useId, type ReactNode } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { ActionResult } from "@/lib/action-result";
import { cn } from "@/lib/utils";

type State = ActionResult<unknown> | null;
const FormState = createContext<State>(null);

/** Formular für Admin-Server-Actions: Toast bei Erfolg/Fehler, Feldfehler per Kontext. */
export function AdminForm({
  action,
  children,
  submitLabel = "Speichern",
  className,
  footer,
  confirm,
}: {
  action: (prev: State, formData: FormData) => Promise<State>;
  children: ReactNode;
  submitLabel?: string;
  className?: string;
  footer?: ReactNode;
  confirm?: string;
}) {
  const [state, formAction, pending] = useActionState(action, null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast(state.message ?? "Gespeichert.");
    else toast.error(state.error);
  }, [state]);
  return (
    <FormState.Provider value={state}>
      <form
        action={formAction}
        className={cn("flex flex-col gap-6", className)}
        onSubmit={(e) => {
          if (confirm && !window.confirm(confirm)) e.preventDefault();
        }}
      >
        {children}
        {state && !state.ok && <p role="alert" className="text-small text-danger">{state.error}</p>}
        <div className="flex items-center gap-3">
          <Button type="submit" loading={pending}>{submitLabel}</Button>
          {footer}
        </div>
      </form>
    </FormState.Provider>
  );
}

function useFieldError(name: string) {
  const state = useContext(FormState);
  return state && !state.ok ? state.fieldErrors?.[name] : undefined;
}

const control =
  "w-full rounded-sm border border-line-strong bg-white px-3 text-small text-ink placeholder:text-muted focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_var(--color-accent-soft)] aria-[invalid=true]:border-danger";

export function AField({
  name,
  label,
  hint,
  defaultValue,
  type = "text",
  required,
  className,
  placeholder,
  textarea,
  rows = 4,
  step,
  inputMode,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
  textarea?: boolean;
  rows?: number;
  step?: string;
  inputMode?: "numeric" | "decimal" | "text";
}) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-caption font-medium text-ink">
        {label}
        {!required && <span className="ml-1 font-normal text-muted">(optional)</span>}
      </label>
      {textarea ? (
        <textarea id={id} name={name} rows={rows} defaultValue={defaultValue ?? ""} placeholder={placeholder} aria-invalid={Boolean(error) || undefined} className={cn(control, "py-2 leading-relaxed")} />
      ) : (
        <input id={id} name={name} type={type} step={step} inputMode={inputMode} required={required} defaultValue={defaultValue ?? ""} placeholder={placeholder} aria-invalid={Boolean(error) || undefined} className={cn(control, "h-10")} />
      )}
      {hint && !error && <p className="text-[0.75rem] text-muted">{hint}</p>}
      {error && <p role="alert" className="text-[0.75rem] text-danger">{error}</p>}
    </div>
  );
}

export function ASelect({ name, label, options, defaultValue, className }: { name: string; label: string; options: { value: string; label: string }[]; defaultValue?: string | null; className?: string }) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={id} className="text-caption font-medium">{label}</label>
      <select id={id} name={name} defaultValue={defaultValue ?? ""} className={cn(control, "h-10 cursor-pointer")}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <p role="alert" className="text-[0.75rem] text-danger">{error}</p>}
    </div>
  );
}

export function ACheck({ name, label, defaultChecked, value = "on" }: { name: string; label: string; defaultChecked?: boolean; value?: string }) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 text-small">
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="size-4 accent-[var(--color-accent)]" />
      {label}
    </label>
  );
}

export function ACheckGroup({ name, label, options, selected }: { name: string; label: string; options: { value: string; label: string }[]; selected: string[] }) {
  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="mb-1 text-caption font-medium">{label}</legend>
      <div className="flex flex-wrap gap-x-5 gap-y-2">
        {options.map((o) => <ACheck key={o.value} name={name} value={o.value} label={o.label} defaultChecked={selected.includes(o.value)} />)}
      </div>
    </fieldset>
  );
}

/** Kleiner Einzelknopf für eine Server Action (z. B. Freigeben, Löschen). */
export function ActionButton({ action, label, variant = "secondary", confirm }: { action: () => Promise<ActionResult<unknown>>; label: string; variant?: "primary" | "secondary" | "ghost"; confirm?: string }) {
  const [state, formAction, pending] = useActionState(async () => action(), null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast(state.message ?? "Erledigt.");
    else toast.error(state.error);
  }, [state]);
  return (
    <form action={formAction} onSubmit={(e) => { if (confirm && !window.confirm(confirm)) e.preventDefault(); }}>
      <Button type="submit" size="sm" variant={variant} loading={pending}>{label}</Button>
    </form>
  );
}
