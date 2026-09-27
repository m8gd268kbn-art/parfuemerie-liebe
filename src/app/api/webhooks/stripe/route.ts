import { env } from "@/config/env";
import { stripeProvider } from "@/services/payments/stripe";
import { handlePaymentWebhook } from "@/services/payments/webhook";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (env().PAYMENT_PROVIDER !== "stripe") return new Response("Nicht aktiv", { status: 404 });
  return handlePaymentWebhook(stripeProvider, request);
}
