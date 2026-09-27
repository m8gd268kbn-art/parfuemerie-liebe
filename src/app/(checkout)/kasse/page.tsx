import type { Metadata } from "next";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/button";
import { env } from "@/config/env";
import { CheckoutForm, type CheckoutConfig } from "@/features/checkout/checkout-form";
import { getCurrentUser } from "@/services/auth/session";
import { getCartView } from "@/services/cart";
import { db } from "@/services/db";
import { addresses } from "@/services/db/schema";
import { availablePaymentMethods } from "@/services/payments";
import { getSettingsFresh } from "@/services/settings";
import { eq, desc } from "drizzle-orm";

export const metadata: Metadata = { title: "Kasse", robots: { index: false, follow: false } };
export const dynamic = "force-dynamic";

export default async function CheckoutPage() {
  const [cart, settings, user] = await Promise.all([getCartView(), getSettingsFresh(), getCurrentUser()]);

  if (!cart.lines.length) {
    return (
      <div className="container-page flex flex-col items-start gap-5 py-20">
        <h1 className="font-display text-h1">Ihr Warenkorb ist leer.</h1>
        <ButtonLink href="/parfum">Düfte entdecken</ButtonLink>
      </div>
    );
  }
  if (cart.hasIssues) {
    return (
      <div className="container-page flex flex-col items-start gap-5 py-20">
        <h1 className="font-display text-h1">Bitte prüfen Sie Ihren Warenkorb.</h1>
        <p className="max-w-md text-body text-ink-soft">Einige Artikel sind nicht mehr in der gewünschten Menge verfügbar.</p>
        <ButtonLink href="/warenkorb">Zum Warenkorb</ButtonLink>
      </div>
    );
  }

  const saved = user
    ? await db.select().from(addresses).where(eq(addresses.userId, user.id)).orderBy(desc(addresses.isDefaultShipping))
    : [];

  const config: CheckoutConfig = {
    zones: settings.shipping.zones
      .filter((z) => z.active)
      .map((z) => ({ id: z.id, name: z.name, countries: z.countries, methods: z.methods.filter((m) => m.active) })),
    pickup: settings.pickup,
    payments: availablePaymentMethods(settings).map((m) => ({ id: m.id, label: m.label })),
    taxRatePercent: settings.shipping.taxRatePercent,
    testMode: env().PAYMENT_PROVIDER === "test",
  };

  return (
    <div className="container-page pt-10 pb-24">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h1 className="font-display text-h1">Kasse</h1>
        <Link href="/warenkorb" className="text-small text-ink-soft link-underline">
          Zurück zum Warenkorb
        </Link>
      </div>
      <CheckoutForm
        cart={cart}
        config={config}
        prefill={user ? { email: user.email, firstName: user.firstName, lastName: user.lastName } : null}
        savedAddresses={saved.map((a) => ({
          firstName: a.firstName,
          lastName: a.lastName,
          company: a.company,
          street: a.street,
          houseNumber: a.houseNumber,
          addressLine2: a.addressLine2,
          postalCode: a.postalCode,
          city: a.city,
          country: a.country,
          phone: a.phone,
        }))}
      />
    </div>
  );
}
