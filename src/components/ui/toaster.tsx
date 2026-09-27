"use client";

import { Toaster as Sonner } from "sonner";

/** Toasts (Sonner von Emil Kowalski) im Stil der Parfümerie: Anthrazit, knapp, unten rechts. */
export function Toaster() {
  return (
    <Sonner
      position="bottom-right"
      duration={3600}
      gap={10}
      offset={20}
      mobileOffset={12}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-sm bg-ink px-4 py-3.5 text-small text-paper shadow-overlay sm:w-[22rem]",
          title: "leading-snug",
          description: "text-caption text-white/70",
          actionButton: "ml-auto shrink-0 text-small font-semibold underline underline-offset-4",
          error: "bg-danger",
          success: "bg-ink",
        },
      }}
    />
  );
}
