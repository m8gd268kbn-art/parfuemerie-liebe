import "server-only";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { env } from "@/config/env";
import { randomToken } from "@/services/security/crypto";

const ALLOWED: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};
const MAX_BYTES = 8 * 1024 * 1024;

/** Prüft Bilddateien anhand der tatsächlichen Signatur (nicht nur des angegebenen MIME-Typs). */
function sniff(buffer: Buffer): string | null {
  if (buffer.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff]))) return "image/jpeg";
  if (buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))) return "image/png";
  if (buffer.subarray(0, 4).toString() === "RIFF" && buffer.subarray(8, 12).toString() === "WEBP") return "image/webp";
  if (buffer.subarray(4, 12).toString().startsWith("ftypavi")) return "image/avif";
  return null;
}

/**
 * Speichert ein hochgeladenes Bild und gibt die öffentliche URL zurück.
 * `local`: public/uploads (nur Entwicklung – auf serverlosen Plattformen nicht persistent).
 * `supabase`: Supabase Storage (öffentlicher Bucket).
 */
export async function storeImage(file: File, folder = "products"): Promise<{ url: string }> {
  if (file.size > MAX_BYTES) throw new Error("Die Datei ist größer als 8 MB.");
  const buffer = Buffer.from(await file.arrayBuffer());
  const type = sniff(buffer);
  if (!type || !ALLOWED[type]) throw new Error("Bitte laden Sie ein JPG-, PNG-, WebP- oder AVIF-Bild hoch.");
  const name = `${folder}/${new Date().toISOString().slice(0, 10)}-${randomToken(9)}.${ALLOWED[type]}`;

  const e = env();
  if (e.STORAGE_PROVIDER === "supabase") {
    const base = e.SUPABASE_URL!.replace(/\/$/, "");
    const res = await fetch(`${base}/storage/v1/object/${e.SUPABASE_STORAGE_BUCKET}/${name}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${e.SUPABASE_SERVICE_ROLE_KEY}`, "Content-Type": type, "x-upsert": "false" },
      body: buffer,
    });
    if (!res.ok) throw new Error(`Upload fehlgeschlagen (${res.status}).`);
    return { url: `${base}/storage/v1/object/public/${e.SUPABASE_STORAGE_BUCKET}/${name}` };
  }

  const target = path.join(process.cwd(), "public", "uploads", name);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, buffer);
  return { url: `/uploads/${name}` };
}
