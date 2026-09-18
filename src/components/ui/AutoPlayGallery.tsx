"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import type { ImageAsset } from "@/content/types";

type AutoPlayGalleryProps = {
  images: ImageAsset[];
  intervalMs?: number;
  className?: string;
  label: string;
};

export function AutoPlayGallery({
  images,
  intervalMs = 5000,
  className = "",
  label,
}: AutoPlayGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (images.length <= 1 || isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % images.length);
    }, intervalMs);
    return () => window.clearInterval(timer);
  }, [images.length, intervalMs, isPaused]);

  if (images.length === 0) return null;

  return (
    <div
      className={`relative aspect-[4/3] overflow-hidden rounded-sm bg-blush/30 shadow-sm ${className}`}
      aria-roledescription="carousel"
      aria-label={label}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {images.map((image, index) => (
        <div
          key={`${image.src}-${index}`}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          aria-hidden={index !== activeIndex}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority={index === 0}
          />
        </div>
      ))}
      {images.length > 1 && (
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {images.map((image, index) => (
            <button
              key={`dot-${image.src}-${index}`}
              type="button"
              className={`h-2 w-2 rounded-full transition-colors ${
                index === activeIndex ? "bg-ivory" : "bg-ivory/50"
              }`}
              aria-label={`Show image ${index + 1} of ${images.length}`}
              onClick={() => setActiveIndex(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
