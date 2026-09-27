"use client";

import { createContext, startTransition, useActionState, useContext, useEffect, useId, useRef, type ReactNode } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) {
      toast(state.message ?? "Gespeichert.");
      // Erst nach Erfolg auf die (neu geladenen) gespeicherten Werte zurücksetzen.
      formRef.current?.reset();
    } else toast.error(state.error);
  }, [state]);
  return (
    <FormState.Provider value={state}>
      <form
        ref={formRef}
        className={cn("flex flex-col gap-6", className)}
        // Manuelles Absenden statt `action`: React würde das Formular sonst auch nach
        // Validierungsfehlern zurücksetzen und Eingaben verwerfen.
        onSubmit={(e) => {
          e.preventDefault();
          if (confirm && !window.confirm(confirm)) return;
          const fd = new FormData(e.currentTarget);
          startTransition(() => formAction(fd));
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
  "w-full rounded-sm border border-line-strong bg-white px-3 text-small text-ink placeholder:text-muted focus:border-ink focus:outline-none focus:shadow-[0_0_0_3px_var(--color-mist)] aria-[invalid=true]:border-danger";

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
        {!required && <span className="font-normal text-muted"> (optional)</span>}
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
      <input type="checkbox" name={name} value={value} defaultChecked={defaultChecked} className="size-4 accent-[var(--color-ink)]" />
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

/** Kleiner Einzelknopf für eine Server Action (z. B. Freigeben, Löschen). Kein eigenes <form>, damit er auch im Footer eines AdminForm stehen darf. */
export function ActionButton({ action, label, variant = "secondary", confirm }: { action: () => Promise<ActionResult<unknown>>; label: string; variant?: "primary" | "secondary" | "ghost"; confirm?: string }) {
  const [state, dispatch, pending] = useActionState(async () => action(), null);
  useEffect(() => {
    if (!state) return;
    if (state.ok) toast(state.message ?? "Erledigt.");
    else toast.error(state.error);
  }, [state]);
  return (
    <Button
      type="button"
      size="sm"
      variant={variant}
      loading={pending}
      onClick={() => {
        if (confirm && !window.confirm(confirm)) return;
        startTransition(() => dispatch());
      }}
    >
      {label}
    </Button>
  );
}

/** Datei-Upload (Bild) mit Vorschau des aktuellen Bildes und optionalem Entfernen. */
export function AFile({ name, label, hint, current, removeName }: { name: string; label: string; hint?: string; current?: string | null; removeName?: string }) {
  const id = useId();
  const error = useFieldError(name);
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="text-caption font-medium">
        {label} <span className="font-normal text-muted">(optional)</span>
      </label>
      {current && (
        <div className="mb-1 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={current} alt="" className="h-14 w-auto max-w-32 border border-line bg-porcelain object-contain" />
          {removeName && <ACheck name={removeName} label="Bild entfernen" />}
        </div>
      )}
      <input
        id={id}
        name={name}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="text-small file:mr-3 file:h-9 file:cursor-pointer file:rounded-sm file:border file:border-line-strong file:bg-white file:px-3 file:text-small"
      />
      <p className="text-[0.75rem] text-muted">{hint ?? "JPG, PNG, WebP oder AVIF, höchstens 5 MB."}</p>
      {error && <p role="alert" className="text-[0.75rem] text-danger">{error}</p>}
    </div>
  );
}
