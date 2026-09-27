/**
 * § 11 PAngV: Bei einer Preisermäßigung ist der niedrigste Gesamtpreis anzugeben, den der
 * Händler innerhalb der letzten 30 Tage vor der Ermäßigung angewendet hat.
 */
export type HistoryRow = { variantId: string; priceCents: number; changedAt: Date };

/**
 * Niedrigster Preis der 30 Tage vor der aktuellen Preissenkung (§ 11 PAngV).
 * Berücksichtigt den zu Beginn des Zeitraums gültigen Preis und alle Änderungen danach.
 */
export function lowestPriceBeforeReduction(history: HistoryRow[], currentPrice: number): number | null {
  if (!history.length) return null;
  const sorted = [...history].sort((a, b) => a.changedAt.getTime() - b.changedAt.getTime());
  const current = sorted[sorted.length - 1];
  if (current.priceCents !== currentPrice) return null;
  const windowStart = current.changedAt.getTime() - 30 * 86_400_000;
  const before = sorted.slice(0, -1);
  const candidates: number[] = [];
  let lastBeforeWindow: HistoryRow | undefined;
  for (const row of before) {
    if (row.changedAt.getTime() < windowStart) lastBeforeWindow = row;
    else candidates.push(row.priceCents);
  }
  if (lastBeforeWindow) candidates.push(lastBeforeWindow.priceCents);
  return candidates.length ? Math.min(...candidates) : null;
}

