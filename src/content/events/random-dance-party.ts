import type { EventCard } from "../types";

/** Official Eventbrite page. Single source for every Book Now button for this event. */
export const RANDOM_DANCE_PARTY_BOOKING_URL =
    "https://www.eventbrite.co.uk/e/random-dance-party-k-pop-hip-hop-jazz-urban-tickets-2005306814664";

const IMAGE_DIR = "/images/events/2026/random-dance-party";

/** Supplied photograph (3:2, 2000 x 1333). Shown whole on the event page; cards use a square crop that keeps both dancers. */
const mainImage = {
    src: `${IMAGE_DIR}/random-dance-party-cover.jpg`,
    alt: "Two dancers moving towards each other along a sunny pavement, one in a black top and checked shirt, the other in a white T-shirt and black joggers, both smiling with their arms out",
    width: 2000,
    height: 1333,
    /* Square card crop: the two dancers sit right of centre, so shift the crop to the right. */
    position: "62% 50%",
};

const bookNow = {
    label: "Book Now",
    href: RANDOM_DANCE_PARTY_BOOKING_URL,
    variant: "primary",
    external: true,
} as const;

/** Full event page for the free dance afternoon on Sunday 29 November 2026. */
export const randomDancePartyEvent: EventCard = {
    id: "2026-random-dance-party",
    slug: "random-dance-party",
    listingCategory: "event",
    title: "Random Dance Party",
    /* Structured data carries the full name, so search results show the dance styles too. */
    schemaName: "Random Dance Party: K-pop, Hip-hop, Jazz & Urban",
    subtitle: "K-pop, Hip-hop, Jazz & Urban",
    category: "Dance Party",
    date: "Sunday 29 November 2026, 2:00pm to 5:00pm",
    dateIso: "2026-11-29",
    time: "14:00 to 17:00",
    timeLabel: "2:00 PM to 5:00 PM",
    location:
        "County Hall Dance & Performing Arts School, 2nd Floor, Riverside Building, Belvedere Road, London SE1 7PB",
    venue: {
        name: "County Hall Dance & Performing Arts School",
        lines: ["2nd Floor, Riverside Building", "Belvedere Road", "London SE1 7PB"],
        address: {
            streetAddress: "2nd Floor, Riverside Building, Belvedere Road",
            addressLocality: "London",
            postalCode: "SE1 7PB",
            addressCountry: "GB",
        },
    },
    excerpt:
        "A free afternoon of K-pop, hip-hop, jazz and urban dance at County Hall.",
    seo: {
        title: "Random Dance Party: K-pop, Hip-hop, Jazz & Urban in London",
        description:
            "Join a free K-pop, hip-hop, jazz and urban random dance party at County Hall, London, on 29 November 2026. Music, friendly battles and surprise prizes.",
    },
    description: [
        "A Sunday afternoon of dancing, music and meeting new people at County Hall.",
        "# Love the song? Join the dance.",
        "If K-pop, hip-hop, jazz or urban dance is your thing, come and spend Sunday afternoon with us.",
        "When a song you recognise comes on, step in and show us your moves. Join your favourite tracks, cheer on other dancers and have a go at the friendly battles if you fancy it.",
        "There’ll be surprise gifts to win, plenty of music and a chance to meet new people who love dancing just as much as you do.",
        "Come with friends or make some new ones. Just bring your energy and enjoy the afternoon!",
    ],
    image: mainImage,
    /* Free admission is shown once, under the subtitle. */
    freeAdmission: true,
    calendar: {
        name: "Random Dance Party",
        label: "Dance Party",
        style: "Dance",
        type: "event",
        admission: "Free admission",
    },
    bookingUrl: RANDOM_DANCE_PARTY_BOOKING_URL,
    bookNow,
};
