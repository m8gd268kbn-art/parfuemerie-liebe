import Link from "next/link";
import { forwardRef, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "inverse";
type Size = "lg" | "md" | "sm";

const base =
  "relative inline-flex items-center justify-center gap-2.5 whitespace-nowrap rounded-sm font-sans font-semibold uppercase select-none " +
  "text-button tracking-[0.08em] [font-variation-settings:'wdth'_108] " +
  "transition-[background-color,color,border-color,box-shadow,transform] duration-[180ms] ease-out press " +
  "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-accent text-white hover:bg-accent-strong disabled:bg-mist disabled:text-muted aria-disabled:bg-mist aria-disabled:text-muted",
  secondary:
    "border border-ink text-ink bg-transparent hover:bg-ink hover:text-paper disabled:border-line-strong disabled:text-muted",
  ghost: "text-ink hover:bg-porcelain disabled:text-muted",
  inverse: "bg-paper text-ink hover:bg-white disabled:opacity-60",
};

const sizes: Record<Size, string> = {
  lg: "h-14 px-8",
  md: "h-12 px-6",
  sm: "h-10 px-4 text-[0.75rem]",
};

export function buttonClasses(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

type ButtonProps = ComponentProps<"button"> & {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  loadingLabel?: string;
  icon?: ReactNode;
};

/**
 * Button mit Lade-Zustand: Das Label blendet weich (Blur-Crossfade) in den Ladetext über,
 * statt einen generischen Spinner zu zeigen.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", loading, loadingLabel, icon, className, children, disabled, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      className={buttonClasses(variant, size, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      <span
        className={cn(
          "inline-flex items-center gap-2.5 transition-[filter,opacity] duration-200 ease-out",
          loading && "opacity-0 blur-[2px]",
        )}
      >
        {icon}
        {children}
      </span>
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center gap-2" aria-live="polite">
          <span className="loading-dots" aria-hidden="true">
            <span />
            <span />
            <span />
          </span>
          <span className="sr-only">{loadingLabel ?? "Wird geladen"}</span>
        </span>
      )}
    </button>
  );
});

type ButtonLinkProps = ComponentProps<typeof Link> & { variant?: Variant; size?: Size };

export function ButtonLink({ variant = "primary", size = "md", className, ...props }: ButtonLinkProps) {
  return <Link className={buttonClasses(variant, size, className)} {...props} />;
}

/** Textlink mit feiner Unterstreichung (sekundäre Aktion neben einem Button). */
export function TextLink({ className, ...props }: ComponentProps<typeof Link>) {
  return (
    <Link
      className={cn(
        "inline-flex items-center gap-1.5 text-small font-medium text-ink link-underline underline-offset-[0.3em]",
        className,
      )}
      {...props}
    />
  );
}

type IconButtonProps = ComponentProps<"button"> & { label: string; badge?: ReactNode };

/** Rundes Icon-Bedienelement mit 44 px Trefferfläche und Pflicht-Label für Screenreader. */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { label, badge, className, children, type = "button", ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex size-11 shrink-0 items-center justify-center rounded-full text-ink",
        "transition-[background-color,transform] duration-[160ms] ease-out press hover:bg-porcelain",
        className,
      )}
      {...props}
    >
      {children}
      {badge}
    </button>
  );
});
