"use client";

import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { changePasswordAction, setNewsletterAction, updateProfileAction } from "./actions";

export function ProfileForm({ firstName, lastName, email }: { firstName: string; lastName: string; email: string }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  return (
    <form
      className="grid max-w-xl gap-5 sm:grid-cols-2"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await updateProfileAction({ firstName: fd.get("firstName"), lastName: fd.get("lastName") });
          if (r.ok) { toast(r.message); setErrors({}); } else setErrors(r.fieldErrors ?? {});
        });
      }}
    >
      <Field label="Vorname" error={errors.firstName}>{({ id, describedBy, invalid }) => <Input id={id} name="firstName" defaultValue={firstName} autoComplete="given-name" aria-describedby={describedBy} invalid={invalid} />}</Field>
      <Field label="Nachname" error={errors.lastName}>{({ id, describedBy, invalid }) => <Input id={id} name="lastName" defaultValue={lastName} autoComplete="family-name" aria-describedby={describedBy} invalid={invalid} />}</Field>
      <Field label="E-Mail-Adresse" hint="Zur Änderung der E-Mail-Adresse schreiben Sie uns bitte." className="sm:col-span-2">{({ id, describedBy }) => <Input id={id} value={email} readOnly disabled aria-describedby={describedBy} />}</Field>
      <div><Button type="submit" loading={pending}>Speichern</Button></div>
    </form>
  );
}

export function PasswordForm() {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  return (
    <form
      className="grid max-w-xl gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const fd = new FormData(form);
        start(async () => {
          const r = await changePasswordAction({ currentPassword: fd.get("currentPassword"), password: fd.get("password"), passwordConfirm: fd.get("passwordConfirm") });
          if (r.ok) { toast(r.message); setErrors({}); form.reset(); } else setErrors({ form: r.error, ...(r.fieldErrors ?? {}) });
        });
      }}
    >
      <Field label="Aktuelles Passwort" error={errors.currentPassword}>{({ id, describedBy, invalid }) => <Input id={id} name="currentPassword" type="password" autoComplete="current-password" aria-describedby={describedBy} invalid={invalid} />}</Field>
      <Field label="Neues Passwort" error={errors.password} hint="Mindestens 10 Zeichen.">{({ id, describedBy, invalid }) => <Input id={id} name="password" type="password" autoComplete="new-password" aria-describedby={describedBy} invalid={invalid} />}</Field>
      <Field label="Neues Passwort wiederholen" error={errors.passwordConfirm}>{({ id, describedBy, invalid }) => <Input id={id} name="passwordConfirm" type="password" autoComplete="new-password" aria-describedby={describedBy} invalid={invalid} />}</Field>
      {errors.form && !errors.currentPassword && !errors.password && <p role="alert" className="text-small text-danger">{errors.form}</p>}
      <div><Button type="submit" variant="secondary" loading={pending}>Passwort ändern</Button></div>
    </form>
  );
}

export function NewsletterToggle({ status }: { status: "pending" | "confirmed" | "unsubscribed" | null }) {
  const [current, setCurrent] = useState(status);
  const [pending, start] = useTransition();
  const subscribed = current === "confirmed";
  return (
    <div className="flex max-w-xl flex-col gap-4">
      <p className="text-body text-ink-soft">
        {subscribed ? "Sie erhalten unseren Newsletter." : current === "pending" ? "Ihre Anmeldung wartet auf Bestätigung per E-Mail." : "Sie erhalten derzeit keinen Newsletter."}
      </p>
      <div>
        <Button
          variant="secondary"
          loading={pending}
          onClick={() => start(async () => {
            const r = await setNewsletterAction(!subscribed);
            toast(r.ok ? r.message : r.error);
            if (r.ok) setCurrent(subscribed ? "unsubscribed" : "pending");
          })}
        >
          {subscribed ? "Newsletter abbestellen" : "Newsletter abonnieren"}
        </Button>
      </div>
    </div>
  );
}
