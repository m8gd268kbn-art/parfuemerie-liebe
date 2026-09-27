"use client";

import { Button } from "@/components/ui/button";
import { useShop } from "@/features/shop/shop-provider";

export function SearchLauncher() {
  const { setSearchOpen } = useShop();
  return (
    <Button variant="ghost" onClick={() => setSearchOpen(true)}>
      Suchen
    </Button>
  );
}
