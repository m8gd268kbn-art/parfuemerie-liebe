import type { Metadata, Viewport } from "next";
import { Bodoni_Moda, Mona_Sans } from "next/font/google";
import "./globals.css";

const bodoni = Bodoni_Moda({
  subsets: ["latin", "latin-ext"],
  axes: ["opsz"],
  style: ["normal", "italic"],
  variable: "--font-bodoni",
  display: "swap",
});

const mona = Mona_Sans({
  subsets: ["latin", "latin-ext"],
  axes: ["wdth"],
  variable: "--font-mona",
  display: "swap",
});

const siteUrl = (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Parfümerie Liebe Hannover · Parfum und Nischendüfte online",
    template: "%s | Parfümerie Liebe",
  },
  description:
    "Die Parfümerie Liebe aus Hannover jetzt online: Parfums, Nischendüfte und Marken entdecken, nach Duftfamilie und Duftnote suchen und bequem bestellen.",
  applicationName: "Parfümerie Liebe",
  openGraph: { type: "website", locale: "de_DE", siteName: "Parfümerie Liebe" },
  twitter: { card: "summary_large_image" },
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  themeColor: "#fafaf7",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="de" className={`${bodoni.variable} ${mona.variable}`}>
      <body>{children}</body>
    </html>
  );
}
