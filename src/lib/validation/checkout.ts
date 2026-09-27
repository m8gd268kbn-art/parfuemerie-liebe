import { z } from "zod";
import { emailSchema } from "./auth";

const req = (msg: string, max = 120) => z.string().trim().min(1, msg).max(max, "Diese Angabe ist zu lang.");
const opt = (max = 120) =>
  z
    .string()
    .trim()
    .max(max, "Diese Angabe ist zu lang.")
    .optional()
    .transform((v) => (v ? v : null));

export const addressSchema = z
  .object({
    firstName: req("Bitte geben Sie den Vornamen ein.", 80),
    lastName: req("Bitte geben Sie den Nachnamen ein.", 80),
    company: opt(120),
    street: req("Bitte geben Sie die Straße ein."),
    houseNumber: req("Bitte geben Sie die Hausnummer ein.", 20),
    addressLine2: opt(120),
    postalCode: req("Bitte geben Sie die Postleitzahl ein.", 12),
    city: req("Bitte geben Sie den Ort ein.", 80),
    country: z
      .string()
      .trim()
      .length(2, "Bitte wählen Sie ein Land.")
      .transform((v) => v.toUpperCase()),
    phone: opt(40),
  })
  .superRefine((a, ctx) => {
    if (a.country === "DE" && !/^\d{5}$/.test(a.postalCode)) {
      ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Bitte geben Sie eine fünfstellige Postleitzahl ein." });
    }
    if ((a.country === "AT" || a.country === "CH") && !/^\d{4}$/.test(a.postalCode)) {
      ctx.addIssue({ code: "custom", path: ["postalCode"], message: "Bitte geben Sie eine vierstellige Postleitzahl ein." });
    }
  });

export type AddressInput = z.infer<typeof addressSchema>;

export const checkoutSchema = z
  .object({
    email: emailSchema,
    phone: opt(40),
    fulfillment: z.enum(["shipping", "pickup"]),
    shippingAddress: addressSchema.nullable(),
    billingSameAsShipping: z.boolean(),
    billingAddress: addressSchema.nullable(),
    shippingMethodId: z.string().max(60).nullable(),
    paymentMethod: z.string().min(1, "Bitte wählen Sie eine Zahlungsart.").max(40),
    customerNote: opt(500),
    acceptTerms: z.literal(true, { error: "Bitte bestätigen Sie die AGB und die Widerrufsbelehrung." }),
    newsletterOptIn: z.boolean().default(false),
  })
  .superRefine((v, ctx) => {
    if (v.fulfillment === "shipping") {
      if (!v.shippingAddress) ctx.addIssue({ code: "custom", path: ["shippingAddress"], message: "Bitte geben Sie eine Lieferadresse ein." });
      if (!v.shippingMethodId) ctx.addIssue({ code: "custom", path: ["shippingMethodId"], message: "Bitte wählen Sie eine Versandart." });
    }
    const needsBilling = v.fulfillment === "pickup" || !v.billingSameAsShipping;
    if (needsBilling && !v.billingAddress) {
      ctx.addIssue({ code: "custom", path: ["billingAddress"], message: "Bitte geben Sie eine Rechnungsadresse ein." });
    }
  });

export type CheckoutInput = z.infer<typeof checkoutSchema>;
