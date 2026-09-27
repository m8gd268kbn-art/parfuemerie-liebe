/**
 * Rendert neutrale Platzhalter-Produktbilder (Glasflakons in Duftfarbe) mit three.js in
 * Headless-Chromium und speichert sie als WebP unter public/media/.
 *
 *   npm run images:render                 – alle fehlenden Bilder
 *   npm run images:render -- --force      – alle neu rendern
 *   npm run images:render -- --only=slug  – nur ein Produkt
 *
 * Die Bilder sind keine Abbildungen der Originalflakons und werden im Alt-Text als Platzhalter
 * ausgewiesen. Provenienz: docs/MEDIA.md.
 */
import { chromium } from "@playwright/test";
import { createReadStream, existsSync } from "node:fs";
import { mkdir, stat, writeFile } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import sharp from "sharp";
import { FAMILIES } from "../src/config/catalog";
import { DEMO_PRODUCTS } from "./demo-catalog";

const ROOT = process.cwd();
const OUT = path.join(ROOT, "public", "media");
const force = process.argv.includes("--force");
const only = process.argv.find((a) => a.startsWith("--only="))?.split("=")[1];
const heroOnly = process.argv.includes("--hero");
const cutoutsOnly = process.argv.includes("--cutouts");

/**
 * Freisteller für die Startseite (Hero und Kategorie-Band): jeweils ein Flakon mit echter Transparenz.
 * Zusammengesetzt aus zwei Renderings vor Weiß und Schwarz (Differenz-Matting).
 */
const CUTOUTS = [
  { file: "hero.webp", width: 1400, height: 2000, bottle: { shape: "tall-rect", cap: "gold", liquid: "#e7b39a", glass: "#f3e7df" }, rotY: -0.32 },
  { file: "damen.webp", width: 1000, height: 1250, bottle: { shape: "round", cap: "gold", liquid: "#eab8c0", glass: "#f6ecee" }, rotY: -0.2 },
  { file: "herren.webp", width: 1000, height: 1250, bottle: { shape: "tall-rect", cap: "black", liquid: "#8aa4c2", glass: "#3f5a7a" }, rotY: -0.3 },
  { file: "unisex.webp", width: 1000, height: 1250, bottle: { shape: "cylinder", cap: "black", liquid: "#e6d6b8", glass: "#eef1f0" }, rotY: -0.2 },
  { file: "nische.webp", width: 1000, height: 1250, bottle: { shape: "stepped", cap: "glass", liquid: "#b67b58", glass: "#efe6dd" }, rotY: -0.45 },
] as const;

/** Differenz-Matting: alpha = 1 - (weiß - schwarz), Farbe = schwarz / alpha (je Kanal gemittelt). */
async function matte(whiteUrl: string, blackUrl: string, target: string, width: number) {
  const decode = async (u: string) => sharp(Buffer.from(u.split(",")[1], "base64")).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  const [w, b] = await Promise.all([decode(whiteUrl), decode(blackUrl)]);
  const { width: W, height: H } = w.info;
  const out = Buffer.alloc(W * H * 4);
  for (let i = 0, j = 0; i < w.data.length; i += 3, j += 4) {
    const diff = (w.data[i] - b.data[i] + w.data[i + 1] - b.data[i + 1] + w.data[i + 2] - b.data[i + 2]) / 3;
    const a = Math.max(0, Math.min(255, 255 - diff));
    out[j + 3] = a;
    if (a > 0) for (let c = 0; c < 3; c++) out[j + c] = Math.min(255, Math.round((b.data[i + c] * 255) / a));
  }
  await mkdir(path.dirname(target), { recursive: true });
  const webp = await sharp(out, { raw: { width: W, height: H, channels: 4 } })
    .trim({ threshold: 1 })
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 86, alphaQuality: 90, effort: 5 })
    .toBuffer();
  await writeFile(target, webp);
}

const MIME: Record<string, string> = { ".js": "text/javascript", ".html": "text/html" };

function serve(): Promise<{ url: string; close: () => void }> {
  const html = `<!doctype html><html><head><meta charset="utf-8">
<script type="importmap">{"imports":{"three":"/three/build/three.module.js","three/addons/":"/three/examples/jsm/"}}</script>
<style>html,body{margin:0;background:#fff}canvas{display:block}</style></head>
<body><script type="module" src="/scene.js"></script></body></html>`;
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://x");
    let file: string | null = null;
    if (url.pathname === "/") {
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(html);
      return;
    }
    if (url.pathname === "/scene.js") file = path.join(ROOT, "scripts/render/scene.js");
    else if (url.pathname.startsWith("/three/")) file = path.join(ROOT, "node_modules", url.pathname.slice(1));
    if (!file || !existsSync(file)) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": MIME[path.extname(file)] ?? "application/octet-stream" });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const addr = server.address() as { port: number };
      resolve({ url: `http://127.0.0.1:${addr.port}/`, close: () => server.close() });
    });
  });
}

async function exists(file: string) {
  try {
    await stat(file);
    return true;
  } catch {
    return false;
  }
}

async function save(dataUrl: string, target: string, width: number) {
  await mkdir(path.dirname(target), { recursive: true });
  const png = Buffer.from(dataUrl.split(",")[1], "base64");
  const webp = await sharp(png).resize({ width, withoutEnlargement: true }).webp({ quality: 84, effort: 5 }).toBuffer();
  await writeFile(target, webp);
}

async function main() {
  const server = await serve();
  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH ?? "/opt/pw-browsers/chromium",
    args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader", "--ignore-gpu-blocklist"],
  });
  const page = await browser.newPage({ viewport: { width: 800, height: 600 } });
  page.on("pageerror", (e) => console.error("Seitenfehler:", e.message));
  await page.goto(server.url);
  await page.waitForFunction(() => (window as unknown as { __ready?: boolean }).__ready === true, null, { timeout: 60_000 });

  const render = (spec: unknown) =>
    page.evaluate((s) => (window as unknown as { renderScene: (x: unknown) => Promise<string> }).renderScene(s), spec);

  // Freisteller (Startseite: Hero vor dem großen Schriftzug, Kategorie-Band)
  for (const c of CUTOUTS) {
    const target = path.join(OUT, "cutouts", c.file);
    if (!force && !cutoutsOnly && (await exists(target))) continue;
    const t = Date.now();
    const base = { view: "cutout", width: c.width, height: c.height, bottle: c.bottle, rotY: c.rotY };
    const white = await render({ ...base, matte: "#ffffff" });
    const black = await render({ ...base, matte: "#000000" });
    await matte(white, black, target, c.width);
    console.log(`Freisteller ${c.file} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
  }
  if (cutoutsOnly) {
    await browser.close();
    server.close();
    return;
  }

  // Hero: drei Flakons auf Stein im Streiflicht
  const heroTarget = path.join(OUT, "hero", "hero.webp");
  if (force || heroOnly || !(await exists(heroTarget))) {
    const t = Date.now();
    const url = await render({
      view: "hero",
      width: 2000,
      height: 2000,
      fov: 22,
      caustics: true,
      ground: "#cdc6ba",
      keyFrom: [-10, 5, 4],
      cameraPos: [0.25, 4.7, 26.5],
      lookAt: [0.25, 2.45, 0],
      bottles: [
        { shape: "tall-rect", cap: "gold", liquid: "#e7b39a", glass: "#f3e7df", place: [-2.6, 0.35, 0.22] },
        { shape: "round", cap: "glass", liquid: "#d9a860", glass: "#eef2f2", place: [0.2, -0.55, -0.18] },
        { shape: "cylinder", cap: "black", liquid: "#e6d6b8", glass: "#eef1f0", place: [2.9, 0.75, 0] },
      ],
    });
    await save(url, heroTarget, 2000);
    console.log(`hero (${((Date.now() - t) / 1000).toFixed(1)} s)`);
  }
  if (heroOnly) {
    await browser.close();
    server.close();
    return;
  }

  // Duftwelten: Flakon mit Flüssigkeit der Familie
  for (const [i, f] of FAMILIES.entries()) {
    const target = path.join(OUT, "worlds", `${f.key}.webp`);
    if (!force && (await exists(target))) continue;
    const shapes = ["round", "flask", "cylinder", "square", "tall-rect", "stepped"] as const;
    const url = await render({
      view: "lifestyle",
      width: 1200,
      height: 1500,
      ground: "#d3ccc0",
      bottle: { shape: shapes[i % shapes.length], cap: i % 2 ? "black" : "glass", liquid: f.liquid, glass: "#f1f4f4" },
    });
    await save(url, target, 1200);
    console.log(`Duftwelt ${f.key}`);
  }

  // Produkte
  const views = [
    { view: "front", file: "front.webp" },
    { view: "side", file: "side.webp" },
    { view: "detail", file: "detail.webp" },
    { view: "lifestyle", file: "lifestyle.webp" },
  ] as const;
  for (const p of DEMO_PRODUCTS) {
    if (only && p.slug !== only) continue;
    for (const v of views) {
      const target = path.join(OUT, "products", p.slug, v.file);
      if (!force && (await exists(target))) continue;
      const t = Date.now();
      const url = await render({ view: v.view, width: 1600, height: 2000, bottle: { ...p.bottle, liquid: p.liquid } });
      await save(url, target, 1600);
      console.log(`${p.slug}/${v.file} (${((Date.now() - t) / 1000).toFixed(1)} s)`);
    }
  }

  await browser.close();
  server.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
