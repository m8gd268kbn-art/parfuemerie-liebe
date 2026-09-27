import { forwardRef, useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const control =
  "w-full rounded-sm border border-line-strong bg-white px-4 text-body text-ink placeholder:text-muted " +
  "transition-[border-color,box-shadow] duration-[160ms] ease-out " +
  "hover:border-ink-soft focus:border-accent focus:outline-none focus:shadow-[0_0_0_3px_var(--color-accent-soft)] " +
  "aria-[invalid=true]:border-danger aria-[invalid=true]:focus:shadow-[0_0_0_3px_var(--color-danger-soft)] " +
  "disabled:bg-porcelain disabled:text-muted";

type FieldProps = {
  label: ReactNode;
  error?: string | null;
  hint?: ReactNode;
  optional?: boolean;
  className?: string;
  children: (ids: { id: string; describedBy: string | undefined; invalid: boolean }) => ReactNode;
};

/** Label über dem Feld, Hinweis/Fehler darunter (nie Platzhalter als Label). */
export function Field({ label, error, hint, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <label htmlFor={id} className="text-small font-medium text-ink">
        {label}
        {optional && <span className="ml-1.5 font-normal text-muted">(optional)</span>}
      </label>
      {children({ id, describedBy, invalid: Boolean(error) })}
      {hint && !error && (
        <p id={hintId} className="text-caption text-muted">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="text-caption text-danger" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

export const Input = forwardRef<HTMLInputElement, ComponentProps<"input"> & { invalid?: boolean }>(function Input(
  { className, invalid, ...props },
  ref,
) {
  return <input ref={ref} aria-invalid={invalid || undefined} className={cn(control, "h-12", className)} {...props} />;
});

export const Textarea = forwardRef<HTMLTextAreaElement, ComponentProps<"textarea"> & { invalid?: boolean }>(function Textarea(
  { className, invalid, ...props },
  ref,
) {
  return <textarea ref={ref} aria-invalid={invalid || undefined} className={cn(control, "min-h-28 py-3 leading-relaxed", className)} {...props} />;
});

export const Select = forwardRef<HTMLSelectElement, ComponentProps<"select"> & { invalid?: boolean }>(function Select(
  { className, invalid, children, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(control, "h-12 cursor-pointer appearance-none pr-10", className)}
        {...props}
      >
        {children}
      </select>
      <svg
        aria-hidden="true"
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-4 size-3.5 -translate-y-1/2 text-ink-soft"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
      >
        <path d="M3.5 6l4.5 4.5L12.5 6" />
      </svg>
    </div>
  );
});

type CheckProps = Omit<ComponentProps<"input">, "type"> & { label: ReactNode; description?: ReactNode; type?: "checkbox" | "radio" };

/** Checkbox/Radio mit großem Klickbereich; der Indikator ist gezeichnet, das Input bleibt nativ. */
export const Check = forwardRef<HTMLInputElement, CheckProps>(function Check(
  { label, description, type = "checkbox", className, disabled, ...props },
  ref,
) {
  return (
    <label className={cn("group flex cursor-pointer items-start gap-3 py-1.5", disabled && "cursor-not-allowed opacity-55", className)}>
      <span className="relative mt-[3px] inline-flex size-[18px] shrink-0">
        <input
          ref={ref}
          type={type}
          disabled={disabled}
          className={cn(
            "peer size-[18px] cursor-pointer appearance-none border border-line-strong bg-white transition-[background-color,border-color] duration-150 ease-out",
            type === "radio" ? "rounded-full" : "rounded-[2px]",
            "checked:border-accent checked:bg-accent group-hover:border-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent",
          )}
          {...props}
        />
        {type === "checkbox" ? (
          <svg
            aria-hidden="true"
            viewBox="0 0 16 16"
            className="pointer-events-none absolute inset-0 m-auto size-3 scale-75 text-white opacity-0 transition-[opacity,transform] duration-150 ease-out peer-checked:scale-100 peer-checked:opacity-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <path d="M3 8.5l3.2 3L13 4.5" />
          </svg>
        ) : (
          <span className="pointer-events-none absolute inset-0 m-auto size-1.5 scale-50 rounded-full bg-white opacity-0 transition-[opacity,transform] duration-150 ease-out peer-checked:scale-100 peer-checked:opacity-100" />
        )}
      </span>
      <span className="flex flex-col gap-0.5">
        <span className="text-small text-ink">{label}</span>
        {description && <span className="text-caption text-muted">{description}</span>}
      </span>
    </label>
  );
});
