"use client";

import { CaretLeft, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconButton } from "@/components/ui/button";
import { Icon } from "@/components/ui/icon";

/** Horizontale Produktreihe mit Scroll-Snap; Pfeile nur mit Maus, Wischen auf Touch. */
export function ProductRail({ children, label }: { children: ReactNode; label: string }) {
  const ref = useRef<HTMLUListElement>(null);
  const [edges, setEdges] = useState({ start: true, end: false });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const first = el.firstElementChild;
    const last = el.lastElementChild;
    if (!first || !last) return;
    const io = new IntersectionObserver(
      (entries) => {
        setEdges((prev) => {
          const next = { ...prev };
          for (const e of entries) {
            if (e.target === first) next.start = e.intersectionRatio > 0.95;
            if (e.target === last) next.end = e.intersectionRatio > 0.95;
          }
          return next;
        });
      },
      { root: el, threshold: [0.95] },
    );
    io.observe(first);
    io.observe(last);
    return () => io.disconnect();
  }, []);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  };

  return (
    <div className="relative">
      <ul
        ref={ref}
        aria-label={label}
        className="no-scrollbar -mx-[var(--gutter)] grid snap-x snap-mandatory auto-cols-[68%] grid-flow-col gap-4 overflow-x-auto scroll-px-[var(--gutter)] px-[var(--gutter)] sm:auto-cols-[42%] md:auto-cols-[31%] md:gap-6 xl:auto-cols-[calc((100%-4.5rem)/4)]"
      >
        {children}
      </ul>
      <div className="pointer-events-none absolute -top-16 right-0 hidden gap-1 [@media(hover:hover)_and_(pointer:fine)]:flex">
        <IconButton label="Zurück" onClick={() => scroll(-1)} disabled={edges.start} className="pointer-events-auto border border-line disabled:opacity-35">
          <Icon icon={CaretLeft} size={18} />
        </IconButton>
        <IconButton label="Weiter" onClick={() => scroll(1)} disabled={edges.end} className="pointer-events-auto border border-line disabled:opacity-35">
          <Icon icon={CaretRight} size={18} />
        </IconButton>
      </div>
    </div>
  );
}
