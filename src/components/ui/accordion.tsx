"use client";

import * as RA from "@radix-ui/react-accordion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function Accordion({ children, defaultValue, className }: { children: ReactNode; defaultValue?: string[]; className?: string }) {
  return (
    <RA.Root type="multiple" defaultValue={defaultValue} className={cn("border-t border-line", className)}>
      {children}
    </RA.Root>
  );
}

export function AccordionItem({ value, title, children }: { value: string; title: ReactNode; children: ReactNode }) {
  return (
    <RA.Item value={value} className="border-b border-line">
      <RA.Header>
        <RA.Trigger className="group flex w-full items-center justify-between gap-6 py-5 text-left text-body font-medium text-ink transition-colors duration-150 hover:text-accent">
          {title}
          <span aria-hidden="true" className="relative size-3 shrink-0">
            <span className="absolute top-1/2 left-0 h-px w-3 -translate-y-1/2 bg-current" />
            <span className="absolute top-0 left-1/2 h-3 w-px -translate-x-1/2 bg-current transition-transform duration-200 ease-out group-data-[state=open]:scale-y-0" />
          </span>
        </RA.Trigger>
      </RA.Header>
      <RA.Content className="accordion-content overflow-hidden">
        <div className="pb-6 text-body text-ink-soft">{children}</div>
      </RA.Content>
    </RA.Item>
  );
}
