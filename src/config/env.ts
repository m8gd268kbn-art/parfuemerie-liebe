import "server-only";
import { z } from "zod";

const bool = z
  .enum(["true", "false", "1", "0", ""])
  .optional()
  .transform((v) => v === "true" || v === "1");

const schema = z
  .object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    DATABASE_URL: z.string().min(1, "DATABASE_URL fehlt"),
    NEXT_PUBLIC_SITE_URL: z.string().url().default("http://localhost:3000"),

    PAYMENT_PROVIDER: z.enum(["stripe", "test"]).default("test"),
    ALLOW_TEST_PAYMENTS: bool,
    STRIPE_SECRET_KEY: z.string().optional(),
    STRIPE_WEBHOOK_SECRET: z.string().optional(),
    TEST_PAYMENT_SECRET: z.string().min(16).optional(),

    EMAIL_PROVIDER: z.enum(["resend", "outbox"]).default("outbox"),
    RESEND_API_KEY: z.string().optional(),
    EMAIL_FROM: z.string().default("Parfümerie Liebe <shop@example.invalid>"),

    STORAGE_PROVIDER: z.enum(["local", "supabase"]).default("local"),
    SUPABASE_URL: z.string().url().optional(),
    SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
    SUPABASE_STORAGE_BUCKET: z.string().default("product-images"),

    NEXT_PUBLIC_DEMO_MODE: bool,
    /** Schützt /api/cron/maintenance (Vercel Cron sendet „Authorization: Bearer <CRON_SECRET>“). */
    CRON_SECRET: z.string().min(16).optional(),
  })
  .superRefine((env, ctx) => {
    if (env.PAYMENT_PROVIDER === "stripe") {
      if (!env.STRIPE_SECRET_KEY) ctx.addIssue({ code: "custom", message: "STRIPE_SECRET_KEY fehlt" });
      if (!env.STRIPE_WEBHOOK_SECRET) ctx.addIssue({ code: "custom", message: "STRIPE_WEBHOOK_SECRET fehlt" });
    }
    if (env.PAYMENT_PROVIDER === "test" && env.NODE_ENV === "production" && !env.ALLOW_TEST_PAYMENTS) {
      ctx.addIssue({
        code: "custom",
        message: "Test-Zahlungen sind in Produktion gesperrt. PAYMENT_PROVIDER=stripe setzen.",
      });
    }
    if (env.EMAIL_PROVIDER === "resend" && !env.RESEND_API_KEY) {
      ctx.addIssue({ code: "custom", message: "RESEND_API_KEY fehlt" });
    }
    if (env.STORAGE_PROVIDER === "supabase" && (!env.SUPABASE_URL || !env.SUPABASE_SERVICE_ROLE_KEY)) {
      ctx.addIssue({ code: "custom", message: "SUPABASE_URL und SUPABASE_SERVICE_ROLE_KEY fehlen" });
    }
  });

export type Env = z.infer<typeof schema>;

let cached: Env | undefined;

/** Validierte Server-Umgebung. Secrets verlassen den Server nie. */
export function env(): Env {
  if (!cached) {
    const parsed = schema.safeParse(process.env);
    if (!parsed.success) {
      const issues = parsed.error.issues.map((i) => `- ${i.path.join(".") || "env"}: ${i.message}`).join("\n");
      throw new Error(`Ungültige Umgebungsvariablen:\n${issues}`);
    }
    cached = parsed.data;
  }
  return cached;
}

/** Geheimnis für den Test-Zahlungsanbieter (nur Entwicklung/Test). */
export function testPaymentSecret(): string {
  return env().TEST_PAYMENT_SECRET ?? "dev-only-test-payment-secret-change-me";
}
