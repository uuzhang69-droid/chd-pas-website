import Image from "next/image";
import type { ImageAsset } from "@/content/types";

type EventInlineGalleryProps = {
  images: readonly ImageAsset[];
  label: string;
};

export function EventInlineGallery({ images, label }: EventInlineGalleryProps) {
  if (images.length === 0) return null;

  return (
    <div
      className="grid gap-4 sm:grid-cols-2"
      role="group"
      aria-label={label}
    >
      {images.map((image) => (
        <div
          key={image.src}
          className="overflow-hidden rounded-sm border border-taupe/25 bg-white shadow-sm"
        >
          <Image
            src={image.src}
            alt={image.alt}
            width={1200}
            height={1600}
            className="h-auto w-full object-contain"
            sizes="(max-width: 640px) 100vw, 50vw"
          />
        </div>
      ))}
    </div>
  );
}
