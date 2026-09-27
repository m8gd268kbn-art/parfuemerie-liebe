/**
 * Einwilligungen (DSGVO/TTDSG): notwendig ist immer aktiv, Statistik und Marketing nur nach
 * ausdrücklicher Zustimmung. Speicherung in einem First-Party-Cookie für 12 Monate.
 */
export type Consent = { v: 1; necessary: true; analytics: boolean; marketing: boolean; ts: string };

export const CONSENT_COOKIE = "pl_consent";
export const CONSENT_EVENT = "pl:consent";
export const CONSENT_OPEN_EVENT = "pl:consent-open";

export function readConsent(): Consent | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.split("; ").find((c) => c.startsWith(`${CONSENT_COOKIE}=`));
  if (!match) return null;
  try {
    const value = JSON.parse(decodeURIComponent(match.split("=").slice(1).join("="))) as Consent;
    return value?.v === 1 ? value : null;
  } catch {
    return null;
  }
}

export function writeConsent(choice: { analytics: boolean; marketing: boolean }) {
  const value: Consent = { v: 1, necessary: true, analytics: choice.analytics, marketing: choice.marketing, ts: new Date().toISOString() };
  const secure = location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${CONSENT_COOKIE}=${encodeURIComponent(JSON.stringify(value))}; Path=/; Max-Age=${60 * 60 * 24 * 365}; SameSite=Lax${secure}`;
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: value }));
  return value;
}

export function openConsentSettings() {
  window.dispatchEvent(new Event(CONSENT_OPEN_EVENT));
}
