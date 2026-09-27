"use server";

import { revalidatePath } from "next/cache";
import { ZodError } from "zod";
import { PAYMENT_METHODS } from "@/config/catalog";
import { fail, ok, zodFieldErrors, type ActionResult } from "@/lib/action-result";
import type { ShopSettings } from "@/lib/settings-schema";
import { requireAdmin } from "@/services/auth/session";
import { getSettingsFresh, updateSettings } from "@/services/settings";
import { storeImage } from "@/services/storage";
import { bool, euro, int, str } from "./form-data";

type S = ActionResult<unknown> | null;
export type SettingsSection = "shop" | "servicebar" | "versand" | "proben" | "zahlung" | "abholung" | "startseite" | "recht" | "social";

const lines = (v: string) => v.split("\n").map((s) => s.trim()).filter(Boolean);
const safeHref = (v: string) => (v.startsWith("/") && !v.startsWith("//") ? v : "/");

async function upload(fd: FormData, key: string): Promise<string | undefined> {
  const file = fd.get(key);
  if (!(file instanceof File) || file.size === 0) return undefined;
  return (await storeImage(file, "shop")).url;
}

function shippingFromForm(fd: FormData, current: ShopSettings["shipping"]): ShopSettings["shipping"] {
  const zones: ShopSettings["shipping"]["zones"] = [];
  const zoneCount = int(fd, "zoneCount") ?? 0;
  for (let z = 0; z <= zoneCount; z++) {
    const p = `zone.${z}.`;
    const name = str(fd, `${p}name`);
    if (!name || bool(fd, `${p}remove`)) continue;
    const methods: ShopSettings["shipping"]["zones"][number]["methods"] = [];
    const methodCount = int(fd, `${p}methodCount`) ?? 0;
    for (let m = 0; m <= methodCount; m++) {
      const mp = `${p}method.${m}.`;
      const mName = str(fd, `${mp}name`);
      if (!mName || bool(fd, `${mp}remove`)) continue;
      const free = euro(fd, `${mp}freeFrom`);
      methods.push({
        id: str(fd, `${mp}id`) || `m${Date.now().toString(36)}${m}`,
        name: mName,
        carrier: str(fd, `${mp}carrier`),
        priceCents: euro(fd, `${mp}price`) ?? 0,
        freeFromCents: free === undefined ? null : free,
        deliveryTime: str(fd, `${mp}deliveryTime`),
        active: bool(fd, `${mp}active`),
      });
    }
    zones.push({
      id: str(fd, `${p}id`) || `z${Date.now().toString(36)}${z}`,
      name,
      countries: str(fd, `${p}countries`).toUpperCase().split(/[\s,;]+/).filter(Boolean),
      active: bool(fd, `${p}active`),
      methods,
    });
  }
  return { ...current, taxRatePercent: int(fd, "taxRatePercent") ?? current.taxRatePercent, zones };
}

/** Speichert einen Bereich der Shop-Einstellungen. Validierung über das zentrale Settings-Schema. */
export async function saveSettingsAction(section: SettingsSection, _prev: S, fd: FormData): Promise<S> {
  await requireAdmin();
  const current = await getSettingsFresh();
  let patch: Partial<ShopSettings>;
  try {
    switch (section) {
      case "shop": {
        const imageUrl = await upload(fd, "image");
        patch = {
          store: {
            ...current.store,
            // Der Name ist fest „Parfümerie Liebe“ und wird hier bewusst nicht geändert.
            legalName: str(fd, "legalName"),
            street: str(fd, "street"),
            postalCode: str(fd, "postalCode"),
            city: str(fd, "city") || "Hannover",
            phone: str(fd, "phone"),
            email: str(fd, "email"),
            supportEmail: str(fd, "supportEmail"),
            vatId: str(fd, "vatId"),
            mapUrl: str(fd, "mapUrl"),
            imageUrl: imageUrl ?? (bool(fd, "removeImage") ? "" : current.store.imageUrl),
            imageAlt: str(fd, "imageAlt"),
            about: str(fd, "about"),
            history: str(fd, "history"),
            directions: str(fd, "directions"),
            services: lines(str(fd, "services")),
            openingHours: current.store.openingHours.map((h, i) => ({ day: h.day, hours: str(fd, `hours.${i}`) })),
            foundedYear: str(fd, "foundedYear"),
            branches: Array.from({ length: (int(fd, "branchCount") ?? 0) + 1 }, (_, i) => ({
              name: str(fd, `branch.${i}.name`),
              street: str(fd, `branch.${i}.street`),
              postalCode: str(fd, `branch.${i}.postalCode`),
              city: str(fd, `branch.${i}.city`),
              phone: str(fd, `branch.${i}.phone`),
              remove: bool(fd, `branch.${i}.remove`),
            }))
              .filter((b) => b.name && b.city && !b.remove)
              .map(({ remove: _remove, ...b }) => b),
          },
        };
        break;
      }
      case "servicebar":
        patch = { serviceBar: { enabled: bool(fd, "enabled"), items: lines(str(fd, "items")).slice(0, 5) } };
        break;
      case "versand":
        patch = { shipping: shippingFromForm(fd, current.shipping), returns: { withdrawalDays: int(fd, "withdrawalDays") ?? 14, summary: str(fd, "returnsSummary") } };
        break;
      case "proben": {
        const min = euro(fd, "minSubtotal");
        patch = { samples: { enabled: bool(fd, "enabled"), maxCount: int(fd, "maxCount") ?? 0, minSubtotalCents: min ?? 0 } };
        break;
      }
      case "zahlung":
        patch = { payments: { methods: PAYMENT_METHODS.map((m) => ({ id: m.id, enabled: bool(fd, `pm.${m.id}`) })) } };
        break;
      case "abholung":
        patch = { pickup: { enabled: bool(fd, "enabled"), label: str(fd, "label"), readyTime: str(fd, "readyTime"), instructions: str(fd, "instructions") } };
        break;
      case "startseite": {
        const heroImageUrl = await upload(fd, "heroImage");
        patch = {
          home: {
            heroHeadline: str(fd, "heroHeadline"),
            heroSubline: str(fd, "heroSubline"),
            heroPrimaryLabel: str(fd, "heroPrimaryLabel"),
            heroPrimaryHref: safeHref(str(fd, "heroPrimaryHref")),
            heroSecondaryLabel: str(fd, "heroSecondaryLabel"),
            heroSecondaryHref: safeHref(str(fd, "heroSecondaryHref")),
            heroImageUrl: heroImageUrl ?? current.home.heroImageUrl,
            heroImageAlt: str(fd, "heroImageAlt"),
          },
        };
        break;
      }
      case "recht":
        patch = { legal: { impressum: str(fd, "impressum"), datenschutz: str(fd, "datenschutz"), agb: str(fd, "agb"), widerruf: str(fd, "widerruf") } };
        break;
      case "social": {
        const url = (k: string) => {
          const v = str(fd, k);
          return v && !/^https:\/\//.test(v) ? "invalid" : v;
        };
        const social = { instagram: url("instagram"), facebook: url("facebook"), tiktok: url("tiktok"), pinterest: url("pinterest") };
        const bad = Object.entries(social).filter(([, v]) => v === "invalid");
        if (bad.length) return fail("Bitte vollständige Links mit https:// angeben.", Object.fromEntries(bad.map(([k]) => [k, "Link muss mit https:// beginnen."])));
        patch = { social };
        break;
      }
      default:
        return fail("Unbekannter Bereich.");
    }
    if (patch.shipping?.zones.some((z) => z.countries.some((c) => !/^[A-Z]{2}$/.test(c)))) {
      return fail("Länder bitte als zweistellige ISO-Codes angeben, z. B. DE, AT.");
    }
    if (patch.samples && patch.samples.maxCount > 10) return fail("Höchstens 10 Proben.", { maxCount: "Höchstens 10." });
    if (patch.shipping?.zones.some((z) => z.methods.some((m) => Number.isNaN(m.priceCents) || (m.freeFromCents != null && Number.isNaN(m.freeFromCents))))) {
      return fail("Bitte Versandpreise wie 4,95 angeben.");
    }
    await updateSettings(patch);
  } catch (e) {
    if (e instanceof ZodError) return fail("Bitte prüfen Sie die Angaben.", zodFieldErrors(e.issues));
    return fail(e instanceof Error ? e.message : "Speichern fehlgeschlagen.");
  }
  revalidatePath("/", "layout");
  return ok(undefined, "Einstellungen gespeichert.");
}
