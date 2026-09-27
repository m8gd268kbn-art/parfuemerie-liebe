import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/features/account/auth-shell";
import { LoginForm } from "@/features/account/auth-forms";

export const metadata: Metadata = { title: "Anmelden", robots: { index: false, follow: true } };

export default function LoginPage() {
  return (
    <AuthShell
      title="Anmelden"
      intro="Mit Ihrem Kundenkonto sehen Sie Bestellungen, Adressen und Ihre Wunschliste."
      aside={
        <>
          Noch kein Konto?{" "}
          <Link href="/registrieren" className="text-ink link-underline">
            Jetzt registrieren
          </Link>
          . Bestellen können Sie auch ohne Konto.
        </>
      }
    >
      <Suspense>
        <LoginForm />
      </Suspense>
    </AuthShell>
  );
}
