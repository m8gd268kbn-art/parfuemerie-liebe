import { env } from "@/config/env";
import { testProvider } from "@/services/payments/test-provider";
import { handlePaymentWebhook } from "@/services/payments/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** Nur aktiv, wenn der Test-Zahlungsanbieter konfiguriert ist (in Produktion gesperrt). */
export async function POST(request: Request) {
  if (env().PAYMENT_PROVIDER !== "test") return new Response("Nicht aktiv", { status: 404 });
  return handlePaymentWebhook(testProvider, request);
}
