import type { Metadata } from "next";
import Link from "next/link";
import { Suspense } from "react";
import { AuthShell } from "@/features/account/auth-shell";
import { RegisterForm } from "@/features/account/auth-forms";

export const metadata: Metadata = { title: "Registrieren", robots: { index: false, follow: true } };

export default function RegisterPage() {
  return (
    <AuthShell
      title="Kundenkonto anlegen"
      intro="Bestellungen verfolgen, Adressen speichern und Ihre Wunschliste auf allen Geräten nutzen."
      aside={
        <>
          Bereits registriert?{" "}
          <Link href="/anmelden" className="text-ink link-underline">
            Anmelden
          </Link>
        </>
      }
    >
      <Suspense>
        <RegisterForm />
      </Suspense>
    </AuthShell>
  );
}
