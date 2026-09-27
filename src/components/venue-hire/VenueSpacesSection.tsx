"use client";

import Image from "next/image";
import { useState } from "react";
import { Container } from "@/components/ui/Container";
import type { ImageAsset } from "@/content/types";

type VenueSpace = {
  id: string;
  title: string;
  size: string;
  floor: string;
  idealFor: string;
  body: string;
  image: ImageAsset;
};

type VenueSpacesSectionProps = {
  title: string;
  items: readonly VenueSpace[];
  wholeVenue: string;
};

export function VenueSpacesSection({ title, items, wholeVenue }: VenueSpacesSectionProps) {
  const [activeId, setActiveId] = useState(items[0]?.id ?? "");
  const activeSpace = items.find((space) => space.id === activeId) ?? items[0];

  if (!activeSpace) return null;

  return (
    <section className="py-16 md:py-24">
      <Container>
        <h2 className="text-h2 text-charcoal">{title}</h2>
        <div className="mt-8 grid gap-8 lg:grid-cols-2 lg:items-stretch">
          <div className="flex flex-col gap-6 rounded-sm border border-rose/25 bg-ivory p-6 md:p-8">
            {items.map((space) => {
              const isActive = space.id === activeId;
              return (
                <article
                  key={space.id}
                  className={`cursor-pointer rounded-sm border p-5 transition-colors md:p-6 ${
                    isActive
                      ? "border-rose bg-rose/5 shadow-sm"
                      : "border-transparent hover:border-rose/30 hover:bg-rose/[0.03]"
                  }`}
                  onClick={() => setActiveId(space.id)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActiveId(space.id);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isActive}
                  aria-label={`Show photo of ${space.title}`}
                >
                  <h3 className="text-h3 text-charcoal">{space.title}</h3>
                  <p className="text-small mt-3 font-semibold text-rose">
                    {space.size} · {space.floor}
                  </p>
                  <p className="text-small mt-2 text-charcoal/65">
                    Ideal for: {space.idealFor}
                  </p>
                  <p className="text-body mt-4 text-charcoal/80">{space.body}</p>
                </article>
              );
            })}
            <p className="text-body-lg text-charcoal/80">{wholeVenue}</p>
          </div>

          <div className="relative min-h-[280px] overflow-hidden rounded-sm border border-taupe/30 bg-blush/20 shadow-sm sm:min-h-[320px] lg:min-h-full lg:h-full">
            <Image
              key={activeSpace.id}
              src={activeSpace.image.src}
              alt={activeSpace.image.alt}
              fill
              className="object-cover transition-opacity duration-300"
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
            <p className="absolute bottom-0 left-0 right-0 bg-charcoal/55 px-4 py-2 text-small text-ivory">
              {activeSpace.title}
            </p>
          </div>
        </div>
      </Container>
    </section>
  );
}
