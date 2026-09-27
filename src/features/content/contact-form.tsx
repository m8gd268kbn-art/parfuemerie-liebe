"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input, Textarea } from "@/components/ui/field";
import { contactAction } from "./contact-actions";

export function ContactForm({ enabled }: { enabled: boolean }) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (done) return <p role="status" className="text-body-lg text-accent">{done}</p>;
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.currentTarget));
        start(async () => {
          const r = await contactAction(fd);
          if (r.ok) setDone(r.message ?? "Danke.");
          else setErrors({ form: r.error, ...(r.fieldErrors ?? {}) });
        });
      }}
    >
      <div className="grid gap-5 sm:grid-cols-2">
        <Field label="Name" error={errors.name}>{({ id, describedBy, invalid }) => <Input id={id} name="name" autoComplete="name" required aria-describedby={describedBy} invalid={invalid} />}</Field>
        <Field label="E-Mail-Adresse" error={errors.email}>{({ id, describedBy, invalid }) => <Input id={id} name="email" type="email" autoComplete="email" required aria-describedby={describedBy} invalid={invalid} />}</Field>
      </div>
      <Field label="Bestellnummer" optional>{({ id }) => <Input id={id} name="orderNumber" />}</Field>
      <Field label="Ihre Nachricht" error={errors.message}>{({ id, describedBy, invalid }) => <Textarea id={id} name="message" required minLength={10} aria-describedby={describedBy} invalid={invalid} />}</Field>
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      {errors.form && <p role="alert" className="text-small text-danger">{errors.form}</p>}
      <p className="text-caption text-muted">Wir verwenden Ihre Angaben nur zur Beantwortung Ihrer Anfrage.</p>
      <div><Button type="submit" loading={pending} disabled={!enabled}>Nachricht senden</Button></div>
    </form>
  );
}
