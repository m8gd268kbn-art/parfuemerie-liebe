"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { subscribeAction } from "./actions";

/** Newsletter-Anmeldung mit Double-Opt-In. Kein Popup, keine vorausgewählte Einwilligung. */
export function NewsletterForm({ source = "footer", tone = "light" }: { source?: string; tone?: "light" | "dark" }) {
  const id = useId();
  const [email, setEmail] = useState("");
  const [state, setState] = useState<{ ok: boolean; message: string } | null>(null);
  const [pending, start] = useTransition();

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const result = await subscribeAction(email, source);
          setState(result.ok ? { ok: true, message: result.message ?? "Danke." } : { ok: false, message: result.fieldErrors?.email ?? result.error });
          if (result.ok) setEmail("");
        });
      }}
      className="flex w-full flex-col gap-3"
    >
      <label htmlFor={id} className={cn("text-small font-medium", tone === "dark" ? "text-paper" : "text-ink")}>
        E-Mail-Adresse
      </label>
      <div className="flex flex-col gap-2 sm:flex-row">
        <input
          id={id}
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={state?.ok === false || undefined}
          aria-describedby={state ? `${id}-status` : `${id}-legal`}
          placeholder="name@beispiel.de"
          className={cn(
            "h-12 min-w-0 flex-1 rounded-sm border px-4 text-body transition-[border-color,box-shadow] duration-150 focus:outline-none",
            tone === "dark"
              ? "border-white/30 bg-transparent text-paper placeholder:text-white/55 focus:border-paper"
              : "border-line-strong bg-white text-ink placeholder:text-muted focus:border-accent focus:shadow-[0_0_0_3px_var(--color-accent-soft)]",
          )}
        />
        <Button type="submit" variant={tone === "dark" ? "inverse" : "primary"} loading={pending} loadingLabel="Wird angemeldet">
          Anmelden
        </Button>
      </div>
      <p id={`${id}-status`} role="status" className={cn("min-h-5 text-caption", state?.ok === false ? "text-danger" : tone === "dark" ? "text-white/80" : "text-ink-soft")}>
        {state?.message}
      </p>
      {!state && (
        <p id={`${id}-legal`} className={cn("-mt-5 text-caption", tone === "dark" ? "text-white/60" : "text-muted")}>
          Mit der Anmeldung erhalten Sie eine E-Mail zur Bestätigung. Abmeldung jederzeit möglich.
        </p>
      )}
    </form>
  );
}
