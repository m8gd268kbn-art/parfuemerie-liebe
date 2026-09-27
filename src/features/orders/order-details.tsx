import Image from "next/image";
import Link from "next/link";
import { FULFILLMENT_STEPS, fulfillmentIndex, ORDER_STATUS } from "@/lib/commerce/order-status";
import { COUNTRY_NAMES } from "@/lib/commerce/shipping";
import { formatDate, formatPrice } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { OrderAddress } from "@/services/db/schema";
import type { OrderView } from "@/services/orders";
import { trackingUrl } from "@/services/orders/notifications";
import { paymentMethodLabel } from "@/services/payments";

function Address({ a }: { a: OrderAddress }) {
  return (
    <address className="text-small leading-relaxed not-italic">
      {a.firstName} {a.lastName}
      {a.company && <><br />{a.company}</>}
      <br />
      {a.street} {a.houseNumber}
      {a.addressLine2 && <><br />{a.addressLine2}</>}
      <br />
      {a.postalCode} {a.city}
      <br />
      {COUNTRY_NAMES[a.country] ?? a.country}
    </address>
  );
}

export function StatusTimeline({ status }: { status: OrderView["order"]["status"] }) {
  const idx = fulfillmentIndex(status);
  if (idx < 0) {
    return <p className={cn("text-small", status === "cancelled" ? "text-danger" : "text-ink-soft")}>{ORDER_STATUS[status].customer}</p>;
  }
  return (
    <ol className="grid grid-cols-4 gap-2" aria-label="Bestellfortschritt">
      {FULFILLMENT_STEPS.map((s, i) => (
        <li key={s.status} className="flex flex-col gap-2" aria-current={i === idx ? "step" : undefined}>
          <span className={cn("h-[3px]", i <= idx ? "bg-positive" : "bg-line")} />
          <span className={cn("text-caption", i <= idx ? "text-ink" : "text-muted")}>{s.label}</span>
        </li>
      ))}
    </ol>
  );
}

export function OrderDetails({ view }: { view: OrderView }) {
  const { order, items, samples } = view;
  const tUrl = trackingUrl(order.carrier, order.trackingNumber);
  return (
    <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-6">
      <div className="flex flex-col gap-8 lg:col-span-7">
        <ul className="divide-y divide-line border-y border-line">
          {items.map((i) => (
            <li key={i.id} className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-4 py-4">
              <span className="relative block aspect-[4/5] overflow-hidden bg-porcelain">
                {i.imageUrl && <Image src={i.imageUrl} alt="" fill sizes="72px" className="object-cover" />}
              </span>
              <span className="min-w-0">
                <span className="label block text-[0.6875rem] text-muted">{i.brandName}</span>
                {i.productSlug ? (
                  <Link href={`/produkt/${i.productSlug}`} className="font-display text-[1.125rem]">
                    {i.productName}
                  </Link>
                ) : (
                  <span className="font-display text-[1.125rem]">{i.productName}</span>
                )}
                <span className="block text-caption text-ink-soft">
                  {i.concentration}, {i.displaySize} · Menge {i.quantity}
                </span>
              </span>
              <span className="numeric text-small">{formatPrice(i.lineTotalCents)}</span>
            </li>
          ))}
        </ul>
        {samples.length > 0 && <p className="text-small text-ink-soft">Kostenlose Duftproben: {samples.map((s) => s.label).join(", ")}</p>}
        {order.trackingNumber && (
          <p className="text-small">
            Sendungsnummer {order.carrier ? `${order.carrier} ` : ""}
            <span className="font-medium">{order.trackingNumber}</span>
            {tUrl && (
              <>
                {" "}
                <a href={tUrl} target="_blank" rel="noopener noreferrer" className="link-underline">
                  Sendung verfolgen
                </a>
              </>
            )}
          </p>
        )}
      </div>
      <aside className="flex flex-col gap-6 lg:col-span-4 lg:col-start-9">
        <dl className="numeric flex flex-col gap-2 text-small">
          <div className="flex justify-between"><dt className="text-ink-soft">Zwischensumme</dt><dd>{formatPrice(order.subtotalCents)}</dd></div>
          {order.discountCents > 0 && <div className="flex justify-between"><dt className="text-ink-soft">Rabatt {order.couponCode && `(${order.couponCode})`}</dt><dd>-{formatPrice(order.discountCents)}</dd></div>}
          <div className="flex justify-between"><dt className="text-ink-soft">{order.fulfillmentType === "pickup" ? "Abholung" : "Versand"}</dt><dd>{order.shippingCents ? formatPrice(order.shippingCents) : "kostenlos"}</dd></div>
          <div className="mt-2 flex justify-between border-t border-line pt-3 text-body font-semibold"><dt>Gesamt</dt><dd>{formatPrice(order.totalCents)}</dd></div>
          <p className="text-right text-caption text-muted">inkl. {formatPrice(order.taxCents)} MwSt.</p>
        </dl>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-1">
          <div>
            <h3 className="mb-2 text-small font-semibold">{order.fulfillmentType === "pickup" ? "Abholung" : "Lieferadresse"}</h3>
            {order.shippingAddress ? <Address a={order.shippingAddress} /> : <p className="text-small">Parfümerie Liebe, Hannover</p>}
          </div>
          <div>
            <h3 className="mb-2 text-small font-semibold">Rechnungsadresse</h3>
            <Address a={order.billingAddress} />
          </div>
          <div>
            <h3 className="mb-2 text-small font-semibold">Zahlungsart</h3>
            <p className="text-small">{paymentMethodLabel(order.paymentMethod)}</p>
          </div>
          <div>
            <h3 className="mb-2 text-small font-semibold">Bestelldatum</h3>
            <p className="text-small">{formatDate(order.createdAt)}</p>
          </div>
        </div>
      </aside>
    </div>
  );
}
