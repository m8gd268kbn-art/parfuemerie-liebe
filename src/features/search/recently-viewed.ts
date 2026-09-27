"use client";

import { useEffect, useState } from "react";

export type RecentItem = { id: string; slug: string; name: string; brand: string; image: string | null };

const KEY = "pl.recent";
const EVENT = "pl:recent";

export function readRecent(): RecentItem[] {
  try {
    const parsed = JSON.parse(window.localStorage.getItem(KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.slice(0, 12) : [];
  } catch {
    return [];
  }
}

/** Zuletzt angesehene Produkte (nur lokal im Browser, für Gäste und Angemeldete). */
export function rememberViewed(item: RecentItem) {
  try {
    const next = [item, ...readRecent().filter((r) => r.id !== item.id)].slice(0, 12);
    window.localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new Event(EVENT));
  } catch {
    // Speicher nicht verfügbar – dann eben ohne Verlauf.
  }
}

export function useRecentlyViewed(excludeId?: string) {
  const [items, setItems] = useState<RecentItem[]>([]);
  useEffect(() => {
    const update = () => setItems(readRecent().filter((r) => r.id !== excludeId));
    update();
    window.addEventListener(EVENT, update);
    return () => window.removeEventListener(EVENT, update);
  }, [excludeId]);
  return items;
}
