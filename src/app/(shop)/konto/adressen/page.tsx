import { desc, eq } from "drizzle-orm";
import { AddressBook } from "@/features/account/address-book";
import { shippingCountries } from "@/lib/commerce/shipping";
import { requireUser } from "@/services/auth/session";
import { db } from "@/services/db";
import { addresses } from "@/services/db/schema";
import { getSettings } from "@/services/settings";

export default async function AddressesPage() {
  const user = await requireUser("/konto/adressen");
  const [rows, settings] = await Promise.all([
    db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefaultShipping), desc(addresses.createdAt)),
    getSettings(),
  ]);
  return (
    <section aria-labelledby="addr-title">
      <h2 id="addr-title" className="mb-6 font-display text-h2">Adressen</h2>
      <AddressBook
        countries={shippingCountries(settings)}
        addresses={rows.map((a) => ({ id: a.id, firstName: a.firstName, lastName: a.lastName, company: a.company, street: a.street, houseNumber: a.houseNumber, addressLine2: a.addressLine2, postalCode: a.postalCode, city: a.city, country: a.country, phone: a.phone, isDefaultShipping: a.isDefaultShipping }))}
      />
    </section>
  );
}
