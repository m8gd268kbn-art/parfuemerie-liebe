/** Datums-Eingaben im Admin beziehen sich immer auf die Zeitzone der Parfümerie (Europe/Berlin). */
const TZ = "Europe/Berlin";

function offsetMs(date: Date) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hourCycle: "h23", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit" })
      .formatToParts(date)
      .map((p) => [p.type, p.value]),
  );
  const asUtc = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute, +parts.second);
  return asUtc - Math.floor(date.getTime() / 1000) * 1000;
}

/** Date → Wert für `<input type="datetime-local">` in Berliner Zeit. */
export function toBerlinInput(date: Date | null | undefined): string {
  if (!date) return "";
  return new Date(date.getTime() + offsetMs(date)).toISOString().slice(0, 16);
}

/** „2026-10-01T00:00“ (Berliner Zeit) → Date. */
export function fromBerlinInput(value: string): Date {
  const [d, t = "00:00"] = value.split("T");
  const [y, m, day] = d.split("-").map(Number);
  const [h, min] = t.split(":").map(Number);
  const guess = Date.UTC(y, m - 1, day, h, min);
  const first = guess - offsetMs(new Date(guess));
  return new Date(guess - offsetMs(new Date(first)));
}
