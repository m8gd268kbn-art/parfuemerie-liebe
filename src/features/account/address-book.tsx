"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Check, Field, Input, Select } from "@/components/ui/field";
import { COUNTRY_NAMES } from "@/lib/commerce/shipping";
import { deleteAddressAction, saveAddressAction } from "./actions";

export type SavedAddress = {
  id: string;
  firstName: string;
  lastName: string;
  company: string | null;
  street: string;
  houseNumber: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  country: string;
  phone: string | null;
  isDefaultShipping: boolean;
};

function AddressForm({ initial, countries, onDone }: { initial?: SavedAddress; countries: string[]; onDone: () => void }) {
  const router = useRouter();
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [pending, start] = useTransition();
  return (
    <form
      className="grid grid-cols-6 gap-x-4 gap-y-5 rounded-sm border border-line bg-white p-6"
      onSubmit={(e) => {
        e.preventDefault();
        const fd = Object.fromEntries(new FormData(e.currentTarget));
        start(async () => {
          const r = await saveAddressAction({ ...fd, isDefaultShipping: fd.isDefaultShipping === "on" }, initial?.id);
          if (!r.ok) return setErrors(r.fieldErrors ?? { form: r.error });
          toast(r.message);
          onDone();
          router.refresh();
        });
      }}
    >
      {([
        ["firstName", "Vorname", 3],
        ["lastName", "Nachname", 3],
        ["company", "Firma (optional)", 6],
        ["street", "Straße", 4],
        ["houseNumber", "Nr.", 2],
        ["addressLine2", "Adresszusatz (optional)", 6],
        ["postalCode", "PLZ", 2],
        ["city", "Ort", 4],
        ["phone", "Telefon (optional)", 3],
      ] as const).map(([name, label, span]) => (
        <Field key={name} label={label} error={errors[name]} className={span === 6 ? "col-span-6" : span === 4 ? "col-span-6 sm:col-span-4" : span === 3 ? "col-span-6 sm:col-span-3" : "col-span-3 sm:col-span-2"}>
          {({ id, describedBy, invalid }) => <Input id={id} name={name} defaultValue={(initial?.[name] as string | null) ?? ""} aria-describedby={describedBy} invalid={invalid} />}
        </Field>
      ))}
      <Field label="Land" className="col-span-6 sm:col-span-3">
        {({ id }) => (
          <Select id={id} name="country" defaultValue={initial?.country ?? "DE"}>
            {countries.map((c) => <option key={c} value={c}>{COUNTRY_NAMES[c] ?? c}</option>)}
          </Select>
        )}
      </Field>
      <div className="col-span-6">
        <Check name="isDefaultShipping" label="Als Standard-Lieferadresse verwenden" defaultChecked={initial?.isDefaultShipping} />
      </div>
      {errors.form && <p role="alert" className="col-span-6 text-small text-danger">{errors.form}</p>}
      <div className="col-span-6 flex gap-3">
        <Button type="submit" loading={pending}>Speichern</Button>
        <Button variant="ghost" onClick={onDone}>Abbrechen</Button>
      </div>
    </form>
  );
}

export function AddressBook({ addresses, countries }: { addresses: SavedAddress[]; countries: string[] }) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | "new" | null>(null);
  const [, start] = useTransition();
  return (
    <div className="flex flex-col gap-6">
      {addresses.length === 0 && editing !== "new" && <p className="text-body text-ink-soft">Noch keine Adressen gespeichert. Gespeicherte Adressen stehen Ihnen an der Kasse zur Auswahl.</p>}
      <ul className="grid gap-4 md:grid-cols-2">
        {addresses.map((a) =>
          editing === a.id ? (
            <li key={a.id} className="md:col-span-2"><AddressForm initial={a} countries={countries} onDone={() => setEditing(null)} /></li>
          ) : (
            <li key={a.id} className="flex flex-col gap-4 rounded-sm border border-line bg-white p-5">
              <address className="text-small leading-relaxed not-italic">
                {a.firstName} {a.lastName}<br />
                {a.company && <>{a.company}<br /></>}
                {a.street} {a.houseNumber}<br />
                {a.postalCode} {a.city}<br />
                {COUNTRY_NAMES[a.country] ?? a.country}
              </address>
              {a.isDefaultShipping && <p className="text-caption text-accent">Standard-Lieferadresse</p>}
              <div className="mt-auto flex gap-4 text-small">
                <button type="button" onClick={() => setEditing(a.id)} className="link-underline">Bearbeiten</button>
                <button type="button" onClick={() => start(async () => { const r = await deleteAddressAction(a.id); toast(r.ok ? r.message : r.error); router.refresh(); })} className="text-ink-soft link-underline">Löschen</button>
              </div>
            </li>
          ),
        )}
      </ul>
      {editing === "new" ? <AddressForm countries={countries} onDone={() => setEditing(null)} /> : <div><Button variant="secondary" onClick={() => setEditing("new")}>Neue Adresse</Button></div>}
    </div>
  );
}
