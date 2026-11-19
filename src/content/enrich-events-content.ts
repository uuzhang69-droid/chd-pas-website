import { copy } from "./copy";
import type { SiteSource } from "./site.source";
import type { ImageAsset } from "./types";

const DANCE_MEETS_ARTS_GALLERY_IMAGES: ImageAsset[] = Array.from({ length: 16 }, (_, index) => ({
  src: `/images/events/2026/dance-meets-arts/gallery-${String(index + 1).padStart(2, "0")}.jpg`,
  alt: copy["pages.events.items.dance_meets_arts.inlinegalleries.0.images.0.alt"],
  width: 1024,
  height: 682,
}));

const FOUR_SEASONS_GALLERY: ImageAsset[] = [
  {
    src: "/images/events/2026/four-seasons-festival/gallery-01.jpg",
    alt: "Concert in the County Hall atrium during the Four Seasons Festival",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-02.jpg",
    alt: "Saxophone and accordion performance beside colourful sculptures at County Hall",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-03.jpeg",
    alt: "Musicians and dancers with programme booklets at the Four Seasons Festival",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-04.jpg",
    alt: "Guided tour near the South Bank Lion with Big Ben in the background",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-05.jpg",
    alt: "Visitors adding paper leaves to a tree mural at the Four Seasons Festival",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-06.jpeg",
    alt: "Outdoor dance and flute performance for Under the Same Sun at County Hall",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-07.jpeg",
    alt: "Storytelling and craft workshop with author Vivian French at the festival",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-08.jpg",
    alt: "Flute and harp performance in the County Hall atrium",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-09.jpeg",
    alt: "Homemade cakes and treats served during the Four Seasons Festival",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-10.jpeg",
    alt: "Short film screening as part of Seeds of Change at County Hall",
  },
  {
    src: "/images/events/2026/four-seasons-festival/gallery-11.jpg",
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
  src: `/images/events/2026/memory-of-china/gallery-${String(index + 1).padStart(2, "0")}.jpg`,
  alt,
  width: 1920,
  height: 1080,
}));

/**
 * One short sentence per event for the listing cards. The longer excerpt stays for the event page and search.
 * Kept here, in code, because these cards are a display choice and not part of the copy workbook.
 */
const CARD_EXCERPTS: Record<string, string> = {
  "within-one-room-stillness-in-motion":
    "Painting, dance, live music and more come together in one live performance.",
  "an-actors-work-with-an-object":
    "An intensive acting workshop and live performance with Oleg Mirochnikov.",
  "halloween-pumpkin-carving-workshop":
    "Pumpkin carving, a costume show and special awards, with fun for all ages.",
  "memory-of-china":
    "A two-day celebration of traditional Chinese arts and culture at County Hall.",
  "four-seasons-festival":
    "A seasonal celebration of music, dance, art, film and workshops at County Hall.",
  "dance-meets-arts":
    "Free live dance, music and visual arts on London’s South Bank.",
  "county-hall-dance-centre-opening-day":
    "County Hall Dance Centre opened its doors on 10 September 2026.",
};

/** Where the square card crop is centred when the middle of the picture is not the subject (CSS object-position). */
const CARD_IMAGE_POSITIONS: Record<string, string> = {
  /* Portrait painting with a caption strip at the bottom: keep the top of the picture. */
  "within-one-room-stillness-in-motion": "50% 0%",
};

function withCardFields<T extends { slug: string; image: ImageAsset }>(event: T): T {
  const cardExcerpt = CARD_EXCERPTS[event.slug];
  const position = CARD_IMAGE_POSITIONS[event.slug];
  return {
    ...event,
    ...(cardExcerpt ? { cardExcerpt } : {}),
    ...(position ? { image: { ...event.image, position } } : {}),
  };
}

export function enrichEventsContent(source: SiteSource): SiteSource {
  return {
    ...source,
    pages: {
      ...source.pages,
      events: {
        ...source.pages.events,
        items: source.pages.events.items.map((original) => {
          const event = withCardFields(original);
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
