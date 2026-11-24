import type { EventCard } from "../types";

/** Official Eventbrite page. Single source for every Book Now button for this event. */
export const RANDOM_DANCE_PARTY_BOOKING_URL =
    "https://www.eventbrite.co.uk/e/random-dance-party-k-pop-hip-hop-jazz-urban-tickets-2005306814664";

const IMAGE_DIR = "/images/events/2026/random-dance-party";

/** Supplied photograph (portrait, 1055 x 1491, about 245 KB). Shown whole on the event page; cards use a square crop that keeps both dancers. */
const mainImage = {
    src: `${IMAGE_DIR}/random-dance-party-cover.jpg`,
    alt: "Two dancers face each other on a wooden studio floor while a circle of people watches them",
    width: 1055,
    height: 1491,
    /* Square card crop of a portrait photo: the dancers sit in the lower middle, so the crop slides down to keep both of them. */
    position: "50% 66%",
};

const bookNow = {
    label: "Book Now",
    href: RANDOM_DANCE_PARTY_BOOKING_URL,
    variant: "primary",
    external: true,
} as const;

/**
 * Walk-ins, the advice to book a ticket in advance and coming and going during the afternoon still need the organiser's
 * confirmation. Set this to true once they have confirmed them: the approved wording below is ready and nothing else changes.
 */
export const ATTENDANCE_DETAILS_CONFIRMED = false;

/**
 * Approved public copy. `**` marks bold, `# ` marks a heading. Only the wording the organiser has not yet confirmed depends on `confirmed`.
 * The dash in the approved "stay for the whole afternoon" sentence is written as a full stop, because the site uses no dashes in page copy.
 */
export function randomDancePartyDescription(confirmed: boolean): string[] {
    return [
        "A Sunday afternoon of dancing, music and meeting new people at County Hall.",
        "# Love the song? Join the dance.",
        "Love K-pop, hip-hop, jazz or urban dance? Come and spend Sunday afternoon with us!",
        "**Hear a song you love?** Step onto the dance floor and show us your moves. Dance along to your favourite tracks, cheer each other on and enjoy the music with fellow dance lovers.",
        "**Not a dancer? No problem!** You’re just as welcome to come along, enjoy the music, watch the dancing and soak up the atmosphere. There’s no pressure to join in.",
        "**Fancy a friendly dance battle?** Have a go! There’ll be prizes for the winners.",
        confirmed
            ? "Come with friends or on your own, stay for a little while or enjoy the whole afternoon. It’s a chance to have fun, meet new people and share a love of music and dance."
            : "Come with friends or on your own. It’s a chance to have fun, meet new people and share a love of music and dance.",
        "# Good to know",
        ...(confirmed
            ? [
                  "**Walk-ins welcome:** Admission is free, but we’d recommend booking a ticket in advance as space is limited.",
              ]
            : []),
        confirmed
            ? "**Bring a drink:** It’s a three-hour event, so don’t forget to bring some water or something to drink. You don’t have to stay for the whole afternoon. Just come along whenever suits you."
            : "**Bring a drink:** It’s a three-hour event, so don’t forget to bring some water or something to drink.",
    ];
}

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
    description: randomDancePartyDescription(ATTENDANCE_DETAILS_CONFIRMED),
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
