import type { Metadata } from "next";
import { OrderLookupForm } from "@/features/orders/order-lookup-form";

export const metadata: Metadata = { title: "Bestellung verfolgen", alternates: { canonical: "/bestellung-verfolgen" } };

export default function TrackOrderPage() {
  return (
    <div className="container-page pt-12 pb-24">
      <div className="max-w-lg">
        <h1 className="font-display text-h1">Bestellung verfolgen</h1>
        <p className="mt-4 text-body-lg text-ink-soft">Mit Bestellnummer und E-Mail-Adresse sehen Sie den aktuellen Stand, auch ohne Kundenkonto.</p>
        <div className="mt-10">
          <OrderLookupForm />
        </div>
      </div>
    </div>
  );
}
