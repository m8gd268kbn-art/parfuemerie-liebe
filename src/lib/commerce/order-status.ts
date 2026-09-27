export type OrderStatus =
  | "pending_payment"
  | "paid"
  | "processing"
  | "packed"
  | "shipped"
  | "delivered"
  | "cancelled"
  | "returned"
  | "partially_returned"
  | "refunded"
  | "partially_refunded";

export const ORDER_STATUS: Record<OrderStatus, { label: string; customer: string; tone: "neutral" | "accent" | "warning" | "danger" }> = {
  pending_payment: { label: "Zahlung ausstehend", customer: "Wir warten auf die Bestätigung Ihrer Zahlung.", tone: "warning" },
  paid: { label: "Bezahlt", customer: "Ihre Zahlung ist eingegangen. Wir bereiten Ihre Bestellung vor.", tone: "accent" },
  processing: { label: "In Bearbeitung", customer: "Ihre Bestellung wird bearbeitet.", tone: "accent" },
  packed: { label: "Verpackt", customer: "Ihre Bestellung ist verpackt und wird in Kürze übergeben.", tone: "accent" },
  shipped: { label: "Versendet", customer: "Ihre Bestellung ist unterwegs.", tone: "accent" },
  delivered: { label: "Zugestellt", customer: "Ihre Bestellung wurde zugestellt.", tone: "neutral" },
  cancelled: { label: "Storniert", customer: "Diese Bestellung wurde storniert.", tone: "danger" },
  returned: { label: "Retourniert", customer: "Ihre Rücksendung ist bei uns eingegangen.", tone: "neutral" },
  partially_returned: { label: "Teilweise retourniert", customer: "Ein Teil Ihrer Bestellung wurde zurückgesendet.", tone: "neutral" },
  refunded: { label: "Erstattet", customer: "Der Betrag wurde erstattet.", tone: "neutral" },
  partially_refunded: { label: "Teilweise erstattet", customer: "Ein Teilbetrag wurde erstattet.", tone: "neutral" },
};

/** Manuell im Admin erlaubte Statuswechsel. Zahlungs- und Erstattungsstatus setzt nur der Webhook. */
export const MANUAL_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending_payment: ["cancelled"],
  paid: ["processing", "packed", "shipped", "cancelled"],
  processing: ["packed", "shipped", "cancelled"],
  packed: ["shipped", "processing", "cancelled"],
  shipped: ["delivered", "returned", "partially_returned"],
  delivered: ["returned", "partially_returned"],
  cancelled: [],
  returned: [],
  partially_returned: ["returned"],
  refunded: [],
  partially_refunded: ["returned", "partially_returned"],
};

export function canTransition(from: OrderStatus, to: OrderStatus) {
  return MANUAL_TRANSITIONS[from].includes(to);
}

/** Fortschritt für die Sendungsanzeige im Kundenkonto. */
export const FULFILLMENT_STEPS: { status: OrderStatus; label: string }[] = [
  { status: "paid", label: "Bezahlt" },
  { status: "processing", label: "In Bearbeitung" },
  { status: "shipped", label: "Versendet" },
  { status: "delivered", label: "Zugestellt" },
];

export function fulfillmentIndex(status: OrderStatus): number {
  switch (status) {
    case "paid":
      return 0;
    case "processing":
    case "packed":
      return 1;
    case "shipped":
      return 2;
    case "delivered":
    case "returned":
    case "partially_returned":
      return 3;
    default:
      return -1;
  }
}

/** Status, in denen Ware reserviert/abgebucht bleibt (Umsatzrelevanz im Dashboard). */
export const REVENUE_STATUSES: OrderStatus[] = [
  "paid",
  "processing",
  "packed",
  "shipped",
  "delivered",
  "partially_returned",
  "partially_refunded",
];
