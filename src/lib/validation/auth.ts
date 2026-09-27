import { z } from "zod";

export const emailSchema = z
  .string()
  .trim()
  .min(1, "Bitte geben Sie Ihre E-Mail-Adresse ein.")
  .max(254, "Diese E-Mail-Adresse ist zu lang.")
  .email("Bitte geben Sie eine gültige E-Mail-Adresse ein.")
  .transform((v) => v.toLowerCase());

export const passwordSchema = z
  .string()
  .min(10, "Das Passwort muss mindestens 10 Zeichen lang sein.")
  .max(128, "Das Passwort darf höchstens 128 Zeichen lang sein.");

const name = (label: string) =>
  z.string().trim().min(1, `Bitte geben Sie Ihren ${label} ein.`).max(80, `Der ${label} ist zu lang.`);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Bitte geben Sie Ihr Passwort ein.").max(128),
});

export const registerSchema = z.object({
  firstName: name("Vornamen"),
  lastName: name("Nachnamen"),
  email: emailSchema,
  password: passwordSchema,
  newsletter: z.boolean().optional(),
});

export const forgotPasswordSchema = z.object({ email: emailSchema });

export const resetPasswordSchema = z
  .object({
    token: z.string().min(20).max(200),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Die Passwörter stimmen nicht überein.",
  });

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Bitte geben Sie Ihr aktuelles Passwort ein."),
    password: passwordSchema,
    passwordConfirm: z.string(),
  })
  .refine((v) => v.password === v.passwordConfirm, {
    path: ["passwordConfirm"],
    message: "Die Passwörter stimmen nicht überein.",
  });

export const profileSchema = z.object({
  firstName: name("Vornamen"),
  lastName: name("Nachnamen"),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
