import { copy } from "./copy";
import type { SiteSource } from "./site.source";
import type { ImageAsset } from "./types";

const DANCE_MEETS_ARTS_GALLERY_IMAGES: ImageAsset[] = Array.from({ length: 16 }, (_, index) => ({
  src: `/images/events/dance-meets-arts/gallery-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: copy["pages.events.items.dance_meets_arts.gallery.alt"],
  width: 1024,
  height: 682,
}));

const FOUR_SEASONS_GALLERY_ALTS = [
  "Four Seasons Festival concert in the County Hall courtyard with audience seated in orange chairs",
  "Saxophone and accordion performance beside colourful sculptures at County Hall",
  "Clay workshop during the Four Seasons Festival at County Hall",
  "Guided tour near the South Bank Lion with Big Ben in the background",
  "Children's creative workshop at the Four Seasons Festival",
  "Outdoor dance and flute performance for Under the Same Sun at County Hall",
  "Storytelling and craft workshop with author Vivian French at the festival",
  "Flute and harp performance in the County Hall atrium",
  "Sitar performance during Afternoon Chai at the Four Seasons Festival",
  "Short film screening as part of Seeds of Change at County Hall",
  "Young musician performing violin at the Four Seasons Festival",
] as const;

const FOUR_SEASONS_GALLERY: ImageAsset[] = FOUR_SEASONS_GALLERY_ALTS.map((alt, index) => ({
  src: `/images/events/four-seasons-festival/gallery-${String(index + 1).padStart(2, "0")}.webp`,
  alt,
  width: 1920,
  height: 1080,
}));

export function enrichEventsContent(source: SiteSource): SiteSource {
  return {
    ...source,
    pages: {
      ...source.pages,
      events: {
        ...source.pages.events,
        items: source.pages.events.items.map((event) => {
          if (event.slug === "dance-meets-arts") {
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
          }
          if (event.slug === "four-seasons-festival") {
            return {
              ...event,
              gallery: FOUR_SEASONS_GALLERY,
            };
          }
          return event;
        }) as typeof source.pages.events.items,
      },
    },
  };
}
