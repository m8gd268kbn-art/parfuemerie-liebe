import { notFound } from "next/navigation";
import { AdminForm, AField, ACheck, ASelect } from "@/features/admin/kit";
import { changeStatusAction, refundAction, trackingAction } from "@/features/admin/order-actions";
import { AdminPage, Panel, StatusPill } from "@/features/admin/ui";
import { OrderDetails } from "@/features/orders/order-details";
import { MANUAL_TRANSITIONS, ORDER_STATUS } from "@/lib/commerce/order-status";
import { centsToEuroInput, formatDateTime, formatPrice } from "@/lib/format";
import { getOrderView } from "@/services/orders";

export const metadata = { title: "Bestellung" };

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const view = await getOrderView({ id });
  if (!view) notFound();
  const { order, payment, events } = view;
  const transitions = MANUAL_TRANSITIONS[order.status];
  const refundable = payment && ["succeeded", "partially_refunded"].includes(payment.status) ? payment.amountCents - payment.refundedCents : 0;

  return (
    <AdminPage
      title={`Bestellung ${order.number}`}
      description={<>{order.email}{order.phone ? ` · ${order.phone}` : ""} · angelegt {formatDateTime(order.createdAt)}</>}
      actions={<StatusPill tone={ORDER_STATUS[order.status].tone}>{ORDER_STATUS[order.status].label}</StatusPill>}
    >
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_22rem]">
        <div className="flex flex-col gap-6">
          <Panel><OrderDetails view={view} /></Panel>
          {order.customerNote && <Panel title="Anmerkung der Kundin/des Kunden"><p className="text-small whitespace-pre-line">{order.customerNote}</p></Panel>}
          <Panel title="Verlauf">
            <ol className="flex flex-col gap-3">
              {events.map((e) => (
                <li key={e.id} className="grid grid-cols-[9rem_1fr] gap-4 text-small">
                  <span className="tabular text-muted">{formatDateTime(e.createdAt)}</span>
                  <span>{e.toStatus ? <strong className="font-medium">{ORDER_STATUS[e.toStatus].label}. </strong> : null}{e.message}</span>
                </li>
              ))}
            </ol>
          </Panel>
        </div>
        <div className="flex flex-col gap-6">
          <Panel title="Status ändern">
            {transitions.length === 0 ? <p className="text-small text-muted">Für diesen Status ist kein manueller Wechsel vorgesehen.</p> : (
              <AdminForm action={changeStatusAction.bind(null, order.id)} submitLabel="Status setzen">
                <ASelect name="status" label="Neuer Status" options={transitions.map((t) => ({ value: t, label: ORDER_STATUS[t].label }))} />
                {transitions.includes("shipped") && (
                  <>
                    <AField name="carrier" label="Versanddienstleister" defaultValue={order.carrier ?? "DHL"} />
                    <AField name="trackingNumber" label="Sendungsnummer" defaultValue={order.trackingNumber} />
                  </>
                )}
                <AField name="note" label="Notiz (intern)" />
                {transitions.includes("cancelled") && order.status !== "pending_payment" && <ACheck name="restock" label="Bei Storno Ware zurück in den Bestand" defaultChecked />}
              </AdminForm>
            )}
          </Panel>
          <Panel title="Sendungsverfolgung">
            <AdminForm action={trackingAction.bind(null, order.id)}>
              <AField name="carrier" label="Versanddienstleister" defaultValue={order.carrier} />
              <AField name="trackingNumber" label="Sendungsnummer" defaultValue={order.trackingNumber} />
            </AdminForm>
          </Panel>
          <Panel title="Zahlung">
            {payment ? (
              <dl className="tabular grid grid-cols-2 gap-y-1.5 text-small">
                <dt className="text-muted">Anbieter</dt><dd>{payment.provider}</dd>
                <dt className="text-muted">Status</dt><dd>{payment.status}</dd>
                <dt className="text-muted">Betrag</dt><dd>{formatPrice(payment.amountCents)}</dd>
                <dt className="text-muted">Erstattet</dt><dd>{formatPrice(payment.refundedCents)}</dd>
                <dt className="text-muted">Referenz</dt><dd className="truncate" title={payment.providerPaymentId ?? payment.providerRef ?? ""}>{payment.providerPaymentId ?? payment.providerRef ?? "-"}</dd>
              </dl>
            ) : <p className="text-small text-muted">Keine Zahlung.</p>}
            {refundable > 0 && (
              <div className="mt-5 border-t border-line pt-5">
                <AdminForm action={refundAction.bind(null, order.id)} submitLabel="Erstattung auslösen" confirm="Erstattung jetzt beim Zahlungsanbieter auslösen?">
                  <AField name="amount" label="Betrag in €" defaultValue={centsToEuroInput(refundable)} inputMode="decimal" required hint={`Maximal ${formatPrice(refundable)}. Die Erstattung läuft über den Zahlungsanbieter; der Status aktualisiert sich per Webhook.`} />
                </AdminForm>
              </div>
            )}
          </Panel>
        </div>
      </div>
    </AdminPage>
  );
}
