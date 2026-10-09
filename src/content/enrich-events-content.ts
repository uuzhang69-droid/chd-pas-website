import { copy } from "./copy";
import type { SiteSource } from "./site.source";
import type { EventCard, ImageAsset } from "./types";

const DANCE_MEETS_ARTS_GALLERY_IMAGES: ImageAsset[] = Array.from({ length: 16 }, (_, index) => ({
  src: `/images/events/dance-meets-arts/gallery-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: copy["pages.events.items.dance_meets_arts.gallery.alt"],
  width: 1024,
  height: 682,
}));

const FOUR_SEASONS_GALLERY_ALTS = [
  "County Hall and the London Eye beside the River Thames, framed by green leaves",
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
  width: index === 0 ? 1024 : 1920,
  height: index === 0 ? 682 : 1080,
}));

const MEMORY_OF_CHINA_GALLERY_ALTS = [
  "Chinese classical dancer on Members' Terrace with Big Ben in the background",
  "Woodblock printing workshop with red paper prints at Memory of China",
  "Mahjong on the Members' Terrace with the Houses of Parliament behind",
  "Handmade jewelry at the Memory of China makers' market",
  "Chinese fan veil dance performance on the terrace",
  "Traditional crafts and jewelry at the festival market stalls",
  "Miao ethnic dance performance in silver ceremonial dress with Big Ben behind",
  "Yunnan cultural showcase with indigo batik textiles beside the Thames",
  "Festival performers and guests with Chinese flags on Members' Terrace, Big Ben behind",
  "Outdoor yoga session on the lawn at County Hall during the Chinese Yoga Festival",
] as const;

const MEMORY_OF_CHINA_GALLERY: ImageAsset[] = MEMORY_OF_CHINA_GALLERY_ALTS.map((alt, index) => ({
  src: `/images/events/memory-of-china/gallery-${String(index + 1).padStart(2, "0")}.jpg`,
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
          const card = event as EventCard;
          const withCategory: EventCard = {
            ...card,
            listingCategory: card.listingCategory ?? "event",
          };
          if (event.slug === "dance-meets-arts") {
            return {
              ...withCategory,
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
              ...withCategory,
              gallery: FOUR_SEASONS_GALLERY,
            };
          }
          if (event.slug === "memory-of-china") {
            return {
              ...withCategory,
              gallery: MEMORY_OF_CHINA_GALLERY,
            };
          }
          return withCategory;
        }) as typeof source.pages.events.items,
      },
    },
  };
}
