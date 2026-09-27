"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { lookupOrderAction } from "@/features/checkout/actions";

export function OrderLookupForm() {
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <form
      className="flex flex-col gap-5"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        setError(null);
        start(async () => {
          const r = await lookupOrderAction({ number: String(fd.get("number")), email: String(fd.get("email")) });
          if (r && !r.ok) setError(r.error);
        });
      }}
    >
      <Field label="Bestellnummer" hint="Zum Beispiel PL-100123, steht in Ihrer Bestellbestätigung.">
        {({ id, describedBy }) => <Input id={id} name="number" required autoComplete="off" aria-describedby={describedBy} />}
      </Field>
      <Field label="E-Mail-Adresse">
        {({ id }) => <Input id={id} name="email" type="email" required autoComplete="email" />}
      </Field>
      {error && <p role="alert" className="text-small text-danger">{error}</p>}
      <div>
        <Button type="submit" loading={pending}>
          Status anzeigen
        </Button>
      </div>
    </form>
  );
}
