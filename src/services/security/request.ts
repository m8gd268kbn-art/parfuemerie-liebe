import "server-only";
import { headers } from "next/headers";
import { sha256 } from "./crypto";

/** Anonymisierter Client-Schlüssel (gehashte IP) für Rate Limiting. */
export async function clientKey(): Promise<string> {
  const h = await headers();
  const ip = h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "unknown";
  return sha256(`ip:${ip}`).slice(0, 32);
}

export async function userAgent(): Promise<string | null> {
  const h = await headers();
  return h.get("user-agent")?.slice(0, 300) ?? null;
}
