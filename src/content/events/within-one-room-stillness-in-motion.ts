import type { EventCard } from "../types";

const SLUG = "within-one-room-stillness-in-motion";
const IMAGE_DIR = "/images/events/2026/within-one-room-stillness-in-motion";

/** Megan Xiong painting used as the page hero (artwork is not cropped). */
const mainImage = {
    src: `${IMAGE_DIR}/megan-xiong-painting-hero-trimmed.jpg`,
    alt: "Painting by Megan Xiong of a woman in a blue Chinese-style robe beside two painted cabinets against a red-orange wall",
    width: 1190,
    height: 1467,
};

/**
 * Official booking page. Not supplied yet: set this one value and the detail page
 * switches to a real Book Now button (cards always say View Details).
 */
export const WITHIN_ONE_ROOM_BOOKING_URL: string | undefined = undefined;

const bookNow: EventCard["bookNow"] = WITHIN_ONE_ROOM_BOOKING_URL
    ? {
          label: "Book Now",
          href: WITHIN_ONE_ROOM_BOOKING_URL,
          variant: "primary",
          external: true,
      }
    : {
          label: "View Details",
          href: `/events/${SLUG}`,
          variant: "secondary",
      };

/** Full event page for the 28 November 2026 evening performance. */
export const withinOneRoomEvent: EventCard = {
    id: "2026-within-one-room-stillness-in-motion",
    slug: SLUG,
    listingCategory: "event",
    title: "Within One Room · Stillness in Motion",
    subtitle: "One room. Six art forms. An evening to stir the senses.",
    category: "Art & Performance",
    date: "Saturday 28 November 2026, 7:30pm – 8:00pm",
    dateIso: "2026-11-28",
    time: "19:30–20:00",
    location:
        "County Hall Dance Centre, 2nd Floor, County Hall, Riverside Building, Belvedere Road, London SE1 7PB",
    excerpt:
        "Painting, dance, live music, floral art, tea ceremony and incense meet in one live performance, inspired by Megan Xiong’s Within One Room series.",
    description: [
        "# About the Event",
        "One room. Six art forms. An evening to stir the senses.",
        "Step into Within One Room · Stillness in Motion at County Hall Dance Centre, where painting, dance, live music, floral art, tea ceremony and incense meet in a live performance.",
        "Inspired by artist Megan Xiong’s Within One Room series, this collaboration brings the world of her paintings to life, weaving everyday emotions with a quiet thread of Eastern philosophy.",
        "What happens when these worlds meet? Join us to find out.",
    ],
    image: mainImage,
    photoCarousel: {
        label: "Event gallery",
        display: "natural",
        images: [
            {
                src: `${IMAGE_DIR}/event-poster.jpg`,
                alt: "Event poster for Within One Room · Stillness in Motion, Art & Performance, 28 November 2026, 7:30 PM, County Hall Dance Centre",
                width: 1080,
                height: 1350,
            },
            {
                src: `${IMAGE_DIR}/tea-ceremony-seven-steps.jpg`,
                alt: "Tea set with four cups and a teapot on a linen runner, with the title Seven Steps to Mindful Tea",
                width: 722,
                height: 917,
            },
            {
                src: `${IMAGE_DIR}/floral-art-table.jpg`,
                alt: "Floral art arrangements in glass and bamboo vases with scissors on a long wooden table",
                width: 1170,
                height: 761,
            },
            {
                src: `${IMAGE_DIR}/guzheng-live-music.jpg`,
                alt: "A musician playing the guzheng in a sunlit room beside a gong, singing bowls and candles",
                width: 809,
                height: 1176,
            },
        ],
    },
    teacherBio: {
        heading: "About the Artist",
        name: "Megan Xiong",
        role: "Mixed media artist and storyteller",
        paragraphs: [
            "Megan Xiong is a mixed media artist and storyteller creating richly layered worlds — where everyday emotions, private thoughts, and human encounters unfold through imaginative visual narratives.",
            "Within One Room is her series of paintings, and the inspiration for this evening. In this collaboration her paintings come to life, weaving everyday emotions with a quiet thread of Eastern philosophy.",
        ],
        image: {
            src: `${IMAGE_DIR}/megan-xiong-at-exhibition.jpg`,
            alt: "Megan Xiong standing in front of her framed paintings at an exhibition",
            width: 1024,
            height: 646,
        },
    },
    calendar: {
        name: "Within One Room",
        label: "Art & Performance",
        style: "Art & Performance",
        type: "event",
        admission: "Free admission",
    },
    admission: "Free · 30-minute performance",
    freeAdmission: true,
    bookingUrl: WITHIN_ONE_ROOM_BOOKING_URL,
    bookingPending: !WITHIN_ONE_ROOM_BOOKING_URL,
    bookNow,
};
