import "server-only";
import { z } from "zod";
import { parseEuroToCents } from "@/lib/format";

/** Hilfen zum Lesen von Admin-Formularen (FormData → validierbare Werte). */
export const str = (fd: FormData, key: string) => String(fd.get(key) ?? "").trim();
export const opt = (fd: FormData, key: string) => str(fd, key) || null;
export const bool = (fd: FormData, key: string) => fd.get(key) === "on";
export const list = (fd: FormData, key: string) => fd.getAll(key).map((v) => String(v).trim()).filter(Boolean);
/** Kommagetrennte Eingabe (z. B. Duftnoten) als bereinigte Liste. */
export const csv = (fd: FormData, key: string) =>
  [...new Set(str(fd, key).split(/[,;\n]/).map((s) => s.trim()).filter(Boolean))].slice(0, 40);
export const int = (fd: FormData, key: string) => {
  const v = str(fd, key);
  return v === "" ? null : Number(v);
};
/** Eurobetrag „129,00“ in Cent; `undefined` bei leerer, `NaN` bei ungültiger Eingabe. */
export const euro = (fd: FormData, key: string) => {
  const v = str(fd, key);
  if (!v) return undefined;
  return parseEuroToCents(v) ?? Number.NaN;
};

export const slugField = z
  .string()
  .max(120)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Nur Kleinbuchstaben, Ziffern und einzelne Bindestriche.");
export const centsField = (label: string) =>
  z.number({ error: `${label}: bitte einen Betrag wie 49,90 eingeben.` }).int().min(0).max(10_000_000);
