"use client";

import { useEffect } from "react";
import { Button, ButtonLink } from "@/components/ui/button";

/** Freundliche Fehlerseite; technische Details werden nur serverseitig protokolliert. */
export default function ShopError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);
  return (
    <div className="container-page flex flex-col items-start gap-6 py-24">
      <h1 className="font-display text-h1">Etwas ist schiefgelaufen.</h1>
      <p className="max-w-lg text-body-lg text-ink-soft">Bitte versuchen Sie es erneut. Wenn das Problem bleibt, schreiben Sie uns gern.</p>
      {error.digest && <p className="numeric text-caption text-muted">Fehlercode {error.digest}</p>}
      <div className="flex flex-wrap gap-3">
        <Button onClick={reset}>Erneut versuchen</Button>
        <ButtonLink href="/kontakt" variant="ghost">Kontakt</ButtonLink>
      </div>
    </div>
  );
}
