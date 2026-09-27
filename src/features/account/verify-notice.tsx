"use client";

import { useState, useTransition } from "react";
import { resendVerificationAction } from "./actions";

export function VerifyNotice() {
  const [msg, setMsg] = useState<string | null>(null);
  const [pending, start] = useTransition();
  return (
    <div className="flex flex-wrap items-center justify-between gap-4 rounded-sm border border-warning/30 bg-warning-soft px-5 py-4 text-small">
      <p>{msg ?? "Bitte bestätigen Sie Ihre E-Mail-Adresse über den Link, den wir Ihnen gesendet haben."}</p>
      {!msg && (
        <button type="button" disabled={pending} onClick={() => start(async () => { const r = await resendVerificationAction(); setMsg(r.ok ? r.message ?? "Gesendet." : r.error); })} className="link-underline">
          Link erneut senden
        </button>
      )}
    </div>
  );
}
