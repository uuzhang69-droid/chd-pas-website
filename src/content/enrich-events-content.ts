import { copy } from "./copy";
import type { SiteSource } from "./site.source";
import type { ImageAsset } from "./types";

const DANCE_MEETS_ARTS_GALLERY_IMAGES: ImageAsset[] = Array.from({ length: 16 }, (_, index) => ({
  src: `/images/events/dance-meets-arts/gallery-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: copy["pages.events.items.dance_meets_arts.gallery.alt"],
  width: 1024,
  height: 682,
}));

export function enrichEventsContent(source: SiteSource): SiteSource {
  return {
    ...source,
    pages: {
      ...source.pages,
      events: {
        ...source.pages.events,
        items: source.pages.events.items.map((event) => {
          if (event.slug !== "dance-meets-arts") return event;
          return {
            ...event,
            inlineGalleries: [
              {
                beforeHeading: "Programme",
                variant: "autoplay" as const,
                images: DANCE_MEETS_ARTS_GALLERY_IMAGES,
              },
            ],
          };
        }) as typeof source.pages.events.items,
      },
    },
  };
}
