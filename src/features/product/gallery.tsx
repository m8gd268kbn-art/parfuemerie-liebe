"use client";

import { MagnifyingGlassPlus } from "@phosphor-icons/react/dist/ssr";
import Image from "next/image";
import { useRef, useState } from "react";
import { Modal } from "@/components/ui/dialog";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import type { ImageDTO } from "@/types/catalog";

/** Lupe auf Desktop: Bild folgt dem Zeiger (transform-origin), ohne Lightbox. */
function ZoomFrame({ image, priority, sizes, className }: { image: ImageDTO; priority?: boolean; sizes: string; className?: string }) {
  const [zoom, setZoom] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const move = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect || !imgRef.current) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    imgRef.current.style.transformOrigin = `${x}% ${y}%`;
  };
  return (
    <div
      ref={ref}
      onPointerEnter={(e) => e.pointerType === "mouse" && setZoom(true)}
      onPointerLeave={() => setZoom(false)}
      onPointerMove={move}
      className={cn("relative overflow-hidden bg-porcelain [@media(hover:hover)_and_(pointer:fine)]:cursor-zoom-in", className)}
    >
      <Image
        ref={imgRef}
        src={image.url}
        alt={image.alt}
        fill
        priority={priority}
        sizes={sizes}
        className={cn("object-cover transition-transform duration-300 ease-out", zoom && "scale-[1.9]")}
      />
    </div>
  );
}

export function ProductGallery({ images, name }: { images: ImageDTO[]; name: string }) {
  const [index, setIndex] = useState(0);
  const [zoomOpen, setZoomOpen] = useState(false);
  const track = useRef<HTMLDivElement>(null);
  if (!images.length) return <div className="aspect-[4/5] bg-porcelain" />;

  const [first, ...rest] = images;
  const pairs = rest.slice(0, 2);
  const tail = rest.slice(2);

  return (
    <>
      {/* Desktop: redaktionelles Raster, Info-Spalte bleibt stehen */}
      <div className="hidden flex-col gap-3 md:flex">
        <ZoomFrame image={first} priority sizes="(min-width: 1280px) 50vw, 55vw" className="aspect-[4/5]" />
        {pairs.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {pairs.map((img) => (
              <ZoomFrame key={img.id} image={img} sizes="(min-width: 1280px) 25vw, 28vw" className="aspect-[4/5]" />
            ))}
          </div>
        )}
        {tail.map((img) => (
          <ZoomFrame key={img.id} image={img} sizes="(min-width: 1280px) 50vw, 55vw" className="aspect-[4/5]" />
        ))}
      </div>

      {/* Mobile: Wisch-Galerie mit Positionsanzeige, Tippen öffnet die Vergrößerung */}
      <div className="md:hidden">
        <div
          ref={track}
          onScroll={(e) => {
            const el = e.currentTarget;
            setIndex(Math.round(el.scrollLeft / el.clientWidth));
          }}
          className="no-scrollbar -mx-[var(--gutter)] flex snap-x snap-mandatory overflow-x-auto"
          aria-label={`Bilder von ${name}`}
          role="region"
        >
          {images.map((img, i) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setZoomOpen(true)}
              className="relative aspect-[4/5] w-full shrink-0 snap-center bg-porcelain"
              aria-label={`Bild ${i + 1} von ${images.length} vergrößern`}
            >
              <Image src={img.url} alt={img.alt} fill priority={i === 0} sizes="100vw" className="object-cover" />
            </button>
          ))}
        </div>
        <div className="mt-3 flex items-center justify-between">
          <div className="flex gap-1.5" aria-hidden="true">
            {images.map((img, i) => (
              <span key={img.id} className={cn("h-px w-6 transition-colors duration-200", i === index ? "bg-ink" : "bg-line-strong")} />
            ))}
          </div>
          <span className="numeric text-caption text-muted">
            {index + 1} / {images.length}
          </span>
        </div>
      </div>

      <Modal open={zoomOpen} onOpenChange={setZoomOpen} title={name} className="w-[calc(100vw-1rem)] max-w-none p-3">
        <div className="relative aspect-[4/5] w-full touch-pinch-zoom overflow-auto bg-porcelain">
          <Image src={images[index].url} alt={images[index].alt} fill sizes="100vw" className="object-contain" />
        </div>
        <p className="mt-3 flex items-center gap-2 text-caption text-muted">
          <Icon icon={MagnifyingGlassPlus} size={14} /> Mit zwei Fingern zoomen
        </p>
      </Modal>
    </>
  );
}
