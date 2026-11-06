"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { ImageAsset } from "@/content/types";

type EventPhotoCarouselProps = {
    images: readonly ImageAsset[];
    label: string;
    className?: string;
};

/** Scroll-snap photo strip with arrows, touch swipe and a "1 / N" indicator. */
export function EventPhotoCarousel({
    images,
    label,
    className = "",
}: EventPhotoCarouselProps) {
    const trackRef = useRef<HTMLUListElement>(null);
    const [active, setActive] = useState(0);

    const updateActive = useCallback(() => {
        const track = trackRef.current;
        if (!track) return;
        const slides = Array.from(track.children) as HTMLElement[];
        let nearest = 0;
        let best = Number.POSITIVE_INFINITY;
        slides.forEach((slide, index) => {
            const distance = Math.abs(slide.offsetLeft - track.scrollLeft);
            if (distance < best) {
                best = distance;
                nearest = index;
            }
        });
        const atEnd = track.scrollLeft + track.clientWidth >= track.scrollWidth - 2;
        setActive(atEnd ? slides.length - 1 : nearest);
    }, []);

    useEffect(() => {
        const track = trackRef.current;
        if (!track) return;
        track.addEventListener("scroll", updateActive, { passive: true });
        return () => track.removeEventListener("scroll", updateActive);
    }, [updateActive]);

    const goTo = (index: number) => {
        const track = trackRef.current;
        if (!track) return;
        const next = Math.max(0, Math.min(images.length - 1, index));
        const slide = track.children[next] as HTMLElement | undefined;
        if (slide) {
            track.scrollTo({ left: slide.offsetLeft, behavior: "smooth" });
        }
    };

    if (images.length === 0) return null;

    const arrowClass =
        "inline-flex h-10 w-10 items-center justify-center rounded-full border border-taupe/40 bg-ivory text-charcoal transition-colors hover:border-rose hover:text-rose focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-burgundy disabled:cursor-default disabled:opacity-40 disabled:hover:border-taupe/40 disabled:hover:text-charcoal";

    return (
        <section
            className={className}
            aria-roledescription="carousel"
            aria-label={label}
        >
            <ul
                ref={trackRef}
                className="relative -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto scroll-smooth px-4 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden"
                tabIndex={0}
                aria-label={`${label}, swipe or use the arrows`}
            >
                {images.map((image, index) => (
                    <li
                        key={image.src}
                        className="relative aspect-[3/2] w-[88%] shrink-0 snap-start overflow-hidden rounded-sm bg-blush/30 sm:w-[82%] lg:w-[78%]"
                        aria-roledescription="slide"
                        aria-label={`${index + 1} of ${images.length}`}
                    >
                        <Image
                            src={image.src}
                            alt={image.alt}
                            fill
                            className="object-cover"
                            sizes="(max-width: 640px) 88vw, (max-width: 1024px) 82vw, 780px"
                        />
                    </li>
                ))}
            </ul>
            <div className="mt-3 flex items-center gap-3">
                <button
                    type="button"
                    className={arrowClass}
                    onClick={() => goTo(active - 1)}
                    disabled={active === 0}
                    aria-label="Previous photo"
                >
                    <span aria-hidden="true">←</span>
                </button>
                <button
                    type="button"
                    className={arrowClass}
                    onClick={() => goTo(active + 1)}
                    disabled={active === images.length - 1}
                    aria-label="Next photo"
                >
                    <span aria-hidden="true">→</span>
                </button>
                <p
                    className="text-small text-charcoal/60"
                    aria-live="polite"
                >
                    {active + 1} / {images.length}
                </p>
            </div>
        </section>
    );
}
