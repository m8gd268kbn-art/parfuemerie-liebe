import "server-only";
import { PAYMENT_METHODS } from "@/config/catalog";
import { env } from "@/config/env";
import type { ShopSettings } from "@/lib/settings-schema";
import { stripeProvider } from "./stripe";
import { testProvider } from "./test-provider";
import type { PaymentProvider } from "./types";

export function getPaymentProvider(): PaymentProvider {
  return env().PAYMENT_PROVIDER === "stripe" ? stripeProvider : testProvider;
}

export function providerById(id: string): PaymentProvider | null {
  if (id === "stripe") return env().PAYMENT_PROVIDER === "stripe" ? stripeProvider : null;
  if (id === "test") return env().PAYMENT_PROVIDER === "test" ? testProvider : null;
  return null;
}

/**
 * Nur Zahlarten, die im Admin aktiviert sind UND vom aktiven Provider unterstützt werden.
 * So wird nie eine Zahlart angeboten, die technisch nicht angebunden ist.
 */
export function availablePaymentMethods(settings: ShopSettings) {
  const enabled = new Set(settings.payments.methods.filter((m) => m.enabled).map((m) => m.id));
  return PAYMENT_METHODS.filter((m) => enabled.has(m.id));
}

export function paymentMethodLabel(id: string) {
  return PAYMENT_METHODS.find((m) => m.id === id)?.label ?? id;
}
