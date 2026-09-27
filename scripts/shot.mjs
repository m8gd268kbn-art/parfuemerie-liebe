// Screenshots für Design-Reviews: node scripts/shot.mjs /pfad out-prefix [--full]
import { chromium } from "@playwright/test";
const [path = "/", out = "shot", ...flags] = process.argv.slice(2);
const full = flags.includes("--full");
const base = process.env.BASE_URL ?? "http://localhost:3000";
const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
for (const [name, viewport] of [["desktop", { width: 1440, height: 900 }], ["mobile", { width: 390, height: 844 }]]) {
  if (flags.includes("--desktop") && name !== "desktop") continue;
  if (flags.includes("--mobile") && name !== "mobile") continue;
  const ctx = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion: "reduce" });
  await ctx.addCookies([{ name: "pl_consent", value: encodeURIComponent(JSON.stringify({ v: 1, necessary: true, analytics: false, marketing: false, ts: "x" })), url: base }]);
  const page = await ctx.newPage();
  const errors = [];
  page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto(base + path, { waitUntil: "networkidle", timeout: 120000 });
  if (full) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.body.scrollHeight; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForLoadState("networkidle");
  }
  await page.waitForTimeout(600);
  await page.screenshot({ path: `${out}-${name}.png`, fullPage: full });
  if (errors.length) console.log(name, "ERRORS:", errors.slice(0, 5).join(" | "));
  await ctx.close();
}
await browser.close();
