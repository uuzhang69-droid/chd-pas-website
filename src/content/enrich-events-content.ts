import { copy } from "./copy";
import type { SiteSource } from "./site.source";
import type { ImageAsset } from "./types";

const DANCE_MEETS_ARTS_GALLERY_IMAGES: ImageAsset[] = Array.from({ length: 16 }, (_, index) => ({
  src: `/images/events/dance-meets-arts/gallery-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: copy["pages.events.items.dance_meets_arts.gallery.alt"],
  width: 1024,
  height: 682,
}));

const FOUR_SEASONS_GALLERY: ImageAsset[] = [
  {
    src: "/images/events/four-seasons-festival/gallery-01.jpg",
    alt: "Concert in the County Hall atrium during the Four Seasons Festival",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-02.webp",
    alt: "Saxophone and accordion performance beside colourful sculptures at County Hall",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-03.jpg",
    alt: "Musicians and dancers with programme booklets at the Four Seasons Festival",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-04.webp",
    alt: "Guided tour near the South Bank Lion with Big Ben in the background",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-05.jpg",
    alt: "Visitors adding paper leaves to a tree mural at the Four Seasons Festival",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-06.webp",
    alt: "Outdoor dance and flute performance for Under the Same Sun at County Hall",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-07.webp",
    alt: "Storytelling and craft workshop with author Vivian French at the festival",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-08.webp",
    alt: "Flute and harp performance in the County Hall atrium",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-09.jpg",
    alt: "Homemade cakes and treats served during the Four Seasons Festival",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-10.webp",
    alt: "Short film screening as part of Seeds of Change at County Hall",
  },
  {
    src: "/images/events/four-seasons-festival/gallery-11.jpg",
    alt: "Flute, piano and cello trio performing at the Four Seasons Festival",
  },
];

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
          if (event.slug === "memory-of-china") {
            return {
              ...event,
              gallery: MEMORY_OF_CHINA_GALLERY,
            };
          }
          return event;
        }) as typeof source.pages.events.items,
      },
    },
  };
}
