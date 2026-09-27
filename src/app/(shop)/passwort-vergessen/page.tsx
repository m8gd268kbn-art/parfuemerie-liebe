import type { Metadata } from "next";
import { AuthShell } from "@/features/account/auth-shell";
import { ForgotPasswordForm } from "@/features/account/auth-forms";

export const metadata: Metadata = { title: "Passwort vergessen", robots: { index: false, follow: false } };

export default function ForgotPage() {
  return (
    <AuthShell title="Passwort vergessen" intro="Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, mit dem Sie ein neues Passwort festlegen.">
      <ForgotPasswordForm />
    </AuthShell>
  );
}
