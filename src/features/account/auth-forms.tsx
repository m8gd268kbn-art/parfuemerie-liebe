"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Check, Field, Input } from "@/components/ui/field";
import { useShop } from "@/features/shop/shop-provider";
import { forgotPasswordAction, loginAction, registerAction, resetPasswordAction } from "./actions";

function FormError({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p role="alert" className="rounded-sm border border-danger/30 bg-danger-soft px-4 py-3 text-small text-danger">
      {message}
    </p>
  );
}

function PasswordInput({ id, describedBy, invalid, autoComplete, name }: { id: string; describedBy?: string; invalid: boolean; autoComplete: string; name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} name={name} type={show ? "text" : "password"} autoComplete={autoComplete} required aria-describedby={describedBy} invalid={invalid} className="pr-24" />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute top-1/2 right-3 -translate-y-1/2 text-caption text-ink-soft link-underline" aria-pressed={show}>
        {show ? "Verbergen" : "Anzeigen"}
      </button>
    </div>
  );
}

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useShop();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await loginAction({ email: fd.get("email"), password: fd.get("password") }, params.get("weiter") ?? undefined);
          if (!r.ok) {
            setFormError(r.error);
            setErrors(r.fieldErrors ?? {});
            return;
          }
          await refresh();
          router.push(r.data.redirectTo);
          router.refresh();
        });
      }}
    >
      <Field label="E-Mail-Adresse" error={errors.email}>
        {({ id, describedBy, invalid }) => <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Passwort" error={errors.password}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} name="password" autoComplete="current-password" describedBy={describedBy} invalid={invalid} />}
      </Field>
      <Link href="/passwort-vergessen" className="-mt-2 self-start text-caption text-ink-soft link-underline">
        Passwort vergessen?
      </Link>
      <FormError message={formError} />
      <Button type="submit" size="lg" loading={pending} loadingLabel="Anmeldung läuft">
        Anmelden
      </Button>
    </form>
  );
}

export function RegisterForm() {
  const router = useRouter();
  const params = useSearchParams();
  const { refresh } = useShop();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await registerAction(
            {
              firstName: fd.get("firstName"),
              lastName: fd.get("lastName"),
              email: fd.get("email"),
              password: fd.get("password"),
              newsletter: fd.get("newsletter") === "on",
            },
            params.get("weiter") ?? undefined,
          );
          if (!r.ok) {
            setFormError(r.error);
            setErrors(r.fieldErrors ?? {});
            return;
          }
          await refresh();
          router.push(r.data.redirectTo);
          router.refresh();
        });
      }}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Vorname" error={errors.firstName}>
          {({ id, describedBy, invalid }) => <Input id={id} name="firstName" autoComplete="given-name" required aria-describedby={describedBy} invalid={invalid} />}
        </Field>
        <Field label="Nachname" error={errors.lastName}>
          {({ id, describedBy, invalid }) => <Input id={id} name="lastName" autoComplete="family-name" required aria-describedby={describedBy} invalid={invalid} />}
        </Field>
      </div>
      <Field label="E-Mail-Adresse" error={errors.email}>
        {({ id, describedBy, invalid }) => <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Passwort" error={errors.password} hint="Mindestens 10 Zeichen. Ein Satz aus mehreren Wörtern ist sicher und gut zu merken.">
        {({ id, describedBy, invalid }) => <PasswordInput id={id} name="password" autoComplete="new-password" describedBy={describedBy} invalid={invalid} />}
      </Field>
      <Check name="newsletter" label="Newsletter erhalten" description="Freiwillig, mit Bestätigung per E-Mail. Abmeldung jederzeit." />
      <p className="text-caption text-muted">
        Mit der Registrierung gelten unsere{" "}
        <Link href="/agb" className="link-underline">
          AGB
        </Link>
        . Informationen zur Verarbeitung Ihrer Daten finden Sie in der{" "}
        <Link href="/datenschutz" className="link-underline">
          Datenschutzerklärung
        </Link>
        .
      </p>
      <FormError message={formError} />
      <Button type="submit" size="lg" loading={pending} loadingLabel="Konto wird angelegt">
        Konto anlegen
      </Button>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (done) return <p role="status" className="text-body text-ink-soft">{done}</p>;
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await forgotPasswordAction({ email: fd.get("email") });
          if (r.ok) setDone(r.message ?? "");
          else setError(r.fieldErrors?.email ?? r.error);
        });
      }}
    >
      <Field label="E-Mail-Adresse" error={error}>
        {({ id, describedBy, invalid }) => <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} invalid={invalid} />}
      </Field>
      <Button type="submit" size="lg" loading={pending}>
        Link anfordern
      </Button>
    </form>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const { refresh } = useShop();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        start(async () => {
          const r = await resetPasswordAction({ token, password: fd.get("password"), passwordConfirm: fd.get("passwordConfirm") });
          if (!r.ok) {
            setFormError(r.error);
            setErrors(r.fieldErrors ?? {});
            return;
          }
          await refresh();
          router.push("/konto");
        });
      }}
    >
      <Field label="Neues Passwort" error={errors.password} hint="Mindestens 10 Zeichen.">
        {({ id, describedBy, invalid }) => <PasswordInput id={id} name="password" autoComplete="new-password" describedBy={describedBy} invalid={invalid} />}
      </Field>
      <Field label="Passwort wiederholen" error={errors.passwordConfirm}>
        {({ id, describedBy, invalid }) => <PasswordInput id={id} name="passwordConfirm" autoComplete="new-password" describedBy={describedBy} invalid={invalid} />}
      </Field>
      <FormError message={formError} />
      <Button type="submit" size="lg" loading={pending}>
        Passwort speichern
      </Button>
    </form>
  );
}
