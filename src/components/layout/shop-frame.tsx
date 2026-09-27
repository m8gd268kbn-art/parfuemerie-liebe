import { CartDrawer } from "@/features/cart/cart-drawer";
import { ConsentBanner } from "@/features/consent/consent-banner";
import { SearchOverlay } from "@/features/search/search-overlay";
import { ShopProvider } from "@/features/shop/shop-provider";
import { DemoBanner } from "@/components/layout/demo-banner";
import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { MobileMenu } from "@/components/layout/mobile-menu";
import { ServiceBar } from "@/components/layout/service-bar";
import { Toaster } from "@/components/ui/toaster";
import { getBrands, getCatalog, getCategories } from "@/services/catalog";
import { getSettings } from "@/services/settings";

async function searchDefaults() {
  const [catalog, brands, categories] = await Promise.all([getCatalog(), getBrands(), getCategories()]);
  const counts = new Map<string, number>();
  for (const p of catalog) for (const n of p.notes) counts.set(n, (counts.get(n) ?? 0) + 1);
  const notes = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([n]) => n);
  return {
    notes,
    brands: brands.filter((b) => b.featured && b.productCount > 0).slice(0, 6).map((b) => ({ name: b.name, slug: b.slug })),
    categories: categories.filter((c) => c.showInNav).slice(0, 8).map((c) => ({ name: c.name, slug: c.slug })),
  };
}

export async function ShopFrame({ children }: { children: React.ReactNode }) {
  const [settings, defaults] = await Promise.all([getSettings(), searchDefaults()]);
  return (
    <ShopProvider>
      <a href="#inhalt" className="skip-link">
        Zum Inhalt springen
      </a>
      <div className="flex min-h-[100dvh] flex-col">
        <DemoBanner />
        <ServiceBar settings={settings} />
        <Header />
        <main id="inhalt" className="flex-1">
          {children}
        </main>
        <Footer settings={settings} />
      </div>
      <MobileMenu />
      <CartDrawer />
      <SearchOverlay defaults={defaults} />
      <ConsentBanner />
      <Toaster />
    </ShopProvider>
  );
}

