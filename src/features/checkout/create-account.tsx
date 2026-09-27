"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { createAccountFromOrderAction } from "./actions";

export function CreateAccountFromOrder({ token, email }: { token: string; email: string }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);
  const [pending, start] = useTransition();
  if (done) return <p role="status" className="text-small text-accent">{done}</p>;
  return (
    <form
      className="flex flex-col gap-4"
      onSubmit={(e) => {
        e.preventDefault();
        start(async () => {
          const r = await createAccountFromOrderAction(token, password);
          if (r.ok) setDone(r.message ?? "Konto angelegt.");
          else setError(r.fieldErrors?.password ?? r.error);
        });
      }}
    >
      <p className="text-small text-ink-soft">
        Mit einem Passwort legen Sie für <span className="text-ink">{email}</span> ein Kundenkonto an und sehen den Status dieser Bestellung jederzeit.
      </p>
      <Field label="Passwort wählen" error={error} hint="Mindestens 10 Zeichen.">
        {({ id, describedBy, invalid }) => (
          <Input id={id} type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} aria-describedby={describedBy} invalid={invalid} />
        )}
      </Field>
      <div>
        <Button type="submit" variant="secondary" loading={pending}>
          Kundenkonto anlegen
        </Button>
      </div>
    </form>
  );
}
