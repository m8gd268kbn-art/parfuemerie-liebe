"use server";

import { and, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { fail, ok, zodFieldErrors } from "@/lib/action-result";
import { addressSchema } from "@/lib/validation/checkout";
import * as auth from "@/services/auth/service";
import { getCurrentUser } from "@/services/auth/session";
import { mergeGuestCart } from "@/services/cart";
import { db } from "@/services/db";
import { addresses } from "@/services/db/schema";
import { newsletterStatusFor, subscribeNewsletter, unsubscribeByEmail } from "@/services/newsletter";

/** Nur interne Rücksprungziele erlauben (kein Open Redirect). */
function safeNext(next: unknown, fallback = "/konto") {
  const n = typeof next === "string" ? next : "";
  return n.startsWith("/") && !n.startsWith("//") && !n.startsWith("/\\") ? n : fallback;
}

export async function loginAction(input: unknown, next?: string) {
  const result = await auth.login(input);
  if (!result.ok) return result;
  await mergeGuestCart(result.data.userId);
  return ok({ redirectTo: safeNext(next, result.data.role === "admin" ? "/admin" : "/konto") });
}

export async function registerAction(input: unknown, next?: string) {
  const result = await auth.register(input);
  if (!result.ok) return result;
  await mergeGuestCart(result.data.userId);
  if (typeof input === "object" && input && (input as { newsletter?: boolean }).newsletter) {
    await subscribeNewsletter(String((input as { email?: string }).email ?? ""), "account").catch(() => undefined);
  }
  return ok({ redirectTo: safeNext(next) }, result.message);
}

export async function logoutAction() {
  await auth.logout();
  redirect("/");
}

export async function forgotPasswordAction(input: unknown) {
  return auth.requestPasswordReset(input);
}

export async function resetPasswordAction(input: unknown) {
  return auth.resetPassword(input);
}

export async function resendVerificationAction() {
  return auth.resendVerification();
}

export async function updateProfileAction(input: unknown) {
  return auth.updateProfile(input);
}

export async function changePasswordAction(input: unknown) {
  return auth.changePassword(input);
}

export async function setNewsletterAction(subscribe: boolean) {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melden Sie sich an.");
  if (subscribe) return subscribeNewsletter(user.email, "account");
  await unsubscribeByEmail(user.email);
  return ok(undefined, "Sie sind vom Newsletter abgemeldet.");
}

export async function newsletterStatusAction() {
  const user = await getCurrentUser();
  return user ? newsletterStatusFor(user.email) : null;
}

export async function saveAddressAction(input: unknown, id?: string) {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melden Sie sich an.");
  const parsed = addressSchema.safeParse(input);
  if (!parsed.success) return fail("Bitte prüfen Sie die Adresse.", zodFieldErrors(parsed.error.issues));
  const flags = input as { isDefaultShipping?: boolean };
  const values = { ...parsed.data, userId: user.id, isDefaultShipping: Boolean(flags.isDefaultShipping) };
  if (values.isDefaultShipping) await db.update(addresses).set({ isDefaultShipping: false }).where(eq(addresses.userId, user.id));
  if (id) {
    await db.update(addresses).set(values).where(and(eq(addresses.id, id), eq(addresses.userId, user.id)));
  } else {
    const count = await db.$count(addresses, eq(addresses.userId, user.id));
    if (count >= 10) return fail("Sie können bis zu 10 Adressen speichern.");
    await db.insert(addresses).values({ ...values, isDefaultShipping: values.isDefaultShipping || count === 0 });
  }
  return ok(undefined, "Adresse gespeichert.");
}

export async function deleteAddressAction(id: string) {
  const user = await getCurrentUser();
  if (!user) return fail("Bitte melden Sie sich an.");
  await db.delete(addresses).where(and(eq(addresses.id, String(id)), eq(addresses.userId, user.id)));
  return ok(undefined, "Adresse gelöscht.");
}
