import type { Metadata } from "next";
import { ButtonLink } from "@/components/ui/button";
import { AuthShell } from "@/features/account/auth-shell";
import { ResetPasswordForm } from "@/features/account/auth-forms";

export const metadata: Metadata = { title: "Neues Passwort", robots: { index: false, follow: false } };

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const token = (await searchParams).token ?? "";
  return (
    <AuthShell title="Neues Passwort festlegen">
      {token ? <ResetPasswordForm token={token} /> : (
        <div className="flex flex-col items-start gap-4">
          <p className="text-body text-ink-soft">Dieser Link ist unvollständig. Bitte fordern Sie einen neuen an.</p>
          <ButtonLink href="/passwort-vergessen" variant="secondary">Neuen Link anfordern</ButtonLink>
        </div>
      )}
    </AuthShell>
  );
}
