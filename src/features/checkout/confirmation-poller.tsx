"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { track } from "@/features/consent/analytics";

/** Wartet auf die Webhook-Bestätigung (die Weiterleitung allein bestätigt keine Zahlung). */
export function ConfirmationPoller({ pending, orderNumber, total }: { pending: boolean; orderNumber: string; total: number }) {
  const router = useRouter();
  useEffect(() => {
    if (!pending) {
      track("purchase", { order: orderNumber, value: total / 100 });
      return;
    }
    let n = 0;
    const id = setInterval(() => {
      n += 1;
      router.refresh();
      if (n > 20) clearInterval(id);
    }, 2000);
    return () => clearInterval(id);
  }, [pending, router, orderNumber, total]);
  return null;
}
