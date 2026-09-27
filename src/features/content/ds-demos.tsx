"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity";

/** Interaktive Beispiele für die interne Design-System-Seite. */
export function QuantityDemo() {
  const [n, setN] = useState(1);
  return <QuantityStepper value={n} max={5} onChange={setN} label="Menge (Beispiel)" />;
}

export function LoadingDemo() {
  const [loading, setLoading] = useState(false);
  return (
    <Button
      loading={loading}
      loadingLabel="Wird gespeichert"
      onClick={() => {
        setLoading(true);
        setTimeout(() => setLoading(false), 1600);
      }}
    >
      Ladezustand zeigen
    </Button>
  );
}

export function ToastDemo() {
  return (
    <Button variant="secondary" onClick={() => toast("In den Warenkorb gelegt.")}>
      Hinweis anzeigen
    </Button>
  );
}
