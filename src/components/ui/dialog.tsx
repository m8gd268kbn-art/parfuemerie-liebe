"use client";

import * as RD from "@radix-ui/react-dialog";
import { X } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { IconButton } from "./button";
import { Icon } from "./icon";

type DrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  side?: "left" | "right";
  width?: string;
  children: ReactNode;
  footer?: ReactNode;
  headerExtra?: ReactNode;
  hideTitle?: boolean;
};

/** Seitliches Panel (Warenkorb, Filter, Menü) mit Fokusfalle, Escape und Scroll-Sperre (Radix). */
export function Drawer({ open, onOpenChange, title, description, side = "right", width = "min(28rem, 100vw)", children, footer, headerExtra, hideTitle }: DrawerProps) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="overlay fixed inset-0 z-[60] bg-ink/30" />
        <RD.Content
          data-side={side}
          style={{ width }}
          className={cn(
            "drawer fixed top-0 bottom-0 z-[60] flex flex-col bg-paper shadow-overlay outline-none",
            side === "right" ? "right-0" : "left-0",
          )}
        >
          <div className="flex h-16 shrink-0 items-center justify-between gap-4 border-b border-line pr-2 pl-6">
            <RD.Title className={cn("font-display text-h3", hideTitle && "sr-only")}>{title}</RD.Title>
            {headerExtra}
            <RD.Close asChild>
              <IconButton label="Schließen">
                <Icon icon={X} />
              </IconButton>
            </RD.Close>
          </div>
          {description ? <RD.Description className="sr-only">{description}</RD.Description> : <RD.Description className="sr-only">{typeof title === "string" ? title : "Dialog"}</RD.Description>}
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
          {footer && <div className="shrink-0 border-t border-line bg-paper">{footer}</div>}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}

type ModalProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function Modal({ open, onOpenChange, title, description, children, className }: ModalProps) {
  return (
    <RD.Root open={open} onOpenChange={onOpenChange}>
      <RD.Portal>
        <RD.Overlay className="overlay fixed inset-0 z-[70] bg-ink/35" />
        <RD.Content
          className={cn(
            "modal fixed top-1/2 left-1/2 z-[70] max-h-[88dvh] w-[min(34rem,calc(100vw-2rem))] -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-sm bg-paper p-8 shadow-overlay outline-none",
            className,
          )}
        >
          <div className="mb-5 flex items-start justify-between gap-6">
            <RD.Title className="font-display text-h3">{title}</RD.Title>
            <RD.Close asChild>
              <IconButton label="Schließen" className="-mt-2 -mr-3">
                <Icon icon={X} />
              </IconButton>
            </RD.Close>
          </div>
          <RD.Description className={description ? "mb-5 text-small text-ink-soft" : "sr-only"}>
            {description ?? (typeof title === "string" ? title : "Dialog")}
          </RD.Description>
          {children}
        </RD.Content>
      </RD.Portal>
    </RD.Root>
  );
}

export const DialogClose = RD.Close;
