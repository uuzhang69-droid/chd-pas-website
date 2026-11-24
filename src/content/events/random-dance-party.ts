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
    /* `**` marks bold and `# ` marks a heading. Free admission and the time are in the facts above; the Good to know items give the practical advice. */
    description: [
        "A Sunday afternoon of dancing, music and meeting new people at County Hall.",
        "# Love the song? Join the dance.",
        "Love K-pop, hip-hop, jazz or urban dance? Come and spend Sunday afternoon with us!",
        "**Hear a song you love?** Step onto the dance floor and show us your moves. Dance along to your favourite tracks, cheer each other on and enjoy the music with fellow dance lovers.",
        "**Not a dancer? No problem!** You’re just as welcome to come along, enjoy the music and soak up the atmosphere. And if you feel like dancing along without stepping into the spotlight, go for it! There’s no pressure to perform or join a battle.",
        "**Fancy a friendly dance battle?** Have a go! There’ll be prizes for the winners.",
        "Come with friends or on your own, stay for a little while or spend the whole afternoon with us. Just enjoy the music, have fun and maybe make a few new friends along the way.",
        "# Good to know",
        "**Walk-ins welcome:** Admission is free! You can just turn up, although we recommend booking a free ticket in advance as space is limited.",
        "**Bring a drink:** Don’t forget to bring some water or something to drink, especially if you’re planning to dance!",
        "**Stay as long as you like:** The event runs from 2:00 to 5:00 PM, but there’s no need to stay for the full three hours.",
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
