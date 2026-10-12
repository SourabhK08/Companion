"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Camera } from "lucide-react";
import { cn } from "cn";

export interface CarouselImage {
  id?: string;
  url: string;
  thumbnailUrl?: string | null;
  title?: string;
  isProfilePhoto?: boolean;
}

interface ImageCarouselModalProps {
  isOpen: boolean;
  onClose: () => void;
  images: CarouselImage[];
  currentIndex: number;
  onNavigate: (index: number) => void;
}

export function ImageCarouselModal({
  isOpen,
  onClose,
  images,
  currentIndex,
  onNavigate,
}: ImageCarouselModalProps) {
  const total = images.length;
  const current = images[currentIndex];

  const handlePrev = useCallback(() => {
    if (total <= 1) return;
    onNavigate((currentIndex - 1 + total) % total);
  }, [currentIndex, total, onNavigate]);

  const handleNext = useCallback(() => {
    if (total <= 1) return;
    onNavigate((currentIndex + 1) % total);
  }, [currentIndex, total, onNavigate]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === "ArrowRight") handleNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    // Prevent body scrolling while modal is open
    document.body.style.overflow = "hidden";

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || total === 0 || !current) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image Carousel Viewer"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-2 sm:p-4 select-none animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Top Bar: Counter & Close */}
      <div
        className="absolute top-4 inset-x-4 flex items-center justify-between z-20"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-2">
          <span className="rounded-full bg-white/20 backdrop-blur-sm px-3 py-1 text-xs font-semibold text-white">
            {currentIndex + 1} / {total}
          </span>
          {current.isProfilePhoto && (
            <span className="rounded-full bg-berry px-3 py-1 text-xs font-bold text-white shadow-xs">
              Avatar
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Close viewer"
          className="flex size-10 items-center justify-center rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-sm transition-transform active:scale-95 cursor-pointer"
        >
          <X className="size-5" />
        </button>
      </div>

      {/* Main Image Container */}
      <div
        className="relative max-h-[85vh] max-w-[90vw] sm:max-w-[80vw] flex items-center justify-center"
        onClick={(e) => e.stopPropagation()}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={current.url}
          alt={current.title || `Photo ${currentIndex + 1}`}
          className="max-h-[80vh] max-w-full rounded-2xl object-contain shadow-2xl transition-all duration-300"
        />

        {/* Previous Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Previous photo"
            className="absolute left-2 sm:-left-12 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/50 sm:bg-white/20 hover:bg-black/70 sm:hover:bg-white/30 text-white backdrop-blur-sm shadow-md transition-transform active:scale-95 cursor-pointer z-10"
          >
            <ChevronLeft className="size-6" />
          </button>
        )}

        {/* Next Button */}
        {total > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Next photo"
            className="absolute right-2 sm:-right-12 top-1/2 -translate-y-1/2 flex size-10 sm:size-12 items-center justify-center rounded-full bg-black/50 sm:bg-white/20 hover:bg-black/70 sm:hover:bg-white/30 text-white backdrop-blur-sm shadow-md transition-transform active:scale-95 cursor-pointer z-10"
          >
            <ChevronRight className="size-6" />
          </button>
        )}
      </div>

      {/* Bottom Thumbnail Strip */}
      {total > 1 && (
        <div
          className="absolute bottom-4 inset-x-4 flex items-center justify-center gap-2 overflow-x-auto py-2 z-20"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((img, idx) => {
            const isActive = idx === currentIndex;
            return (
              <button
                key={img.id || idx}
                type="button"
                onClick={() => onNavigate(idx)}
                className={cn(
                  "relative size-12 sm:size-14 shrink-0 overflow-hidden rounded-xl border-2 transition-all cursor-pointer",
                  isActive
                    ? "border-berry ring-2 ring-berry/50 scale-105"
                    : "border-white/40 opacity-60 hover:opacity-100"
                )}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={img.thumbnailUrl || img.url}
                  alt={`Thumbnail ${idx + 1}`}
                  className="size-full object-cover"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
