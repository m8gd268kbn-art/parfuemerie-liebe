import { NewsletterToggle, PasswordForm, ProfileForm } from "@/features/account/profile-forms";
import { requireUser } from "@/services/auth/session";
import { newsletterStatusFor } from "@/services/newsletter";

export default async function ProfilePage() {
  const user = await requireUser("/konto/profil");
  const status = await newsletterStatusFor(user.email);
  return (
    <div className="flex flex-col gap-14">
      <section aria-labelledby="p-title">
        <h2 id="p-title" className="mb-6 font-display text-h2">Profil</h2>
        <ProfileForm firstName={user.firstName} lastName={user.lastName} email={user.email} />
      </section>
      <section aria-labelledby="pw-title">
        <h2 id="pw-title" className="mb-6 font-display text-h3">Passwort</h2>
        <PasswordForm />
      </section>
      <section aria-labelledby="nl-title">
        <h2 id="nl-title" className="mb-4 font-display text-h3">Newsletter</h2>
        <NewsletterToggle status={status} />
      </section>
    </div>
  );
}
