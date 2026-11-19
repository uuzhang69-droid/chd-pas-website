import { MAGGIES_CATS_SLUG, publicSessionsForEvent } from "../event-sessions";
import type { EventCard } from "../types";

/**
 * Official Eventbrite page. Single source for every Book Tickets button for this event:
 * the detail page (hero, dates, prices, final call to action) reads it, and the listing card and calendar link to the detail page.
 * There are no per-date links.
 */
export const MAGGIES_CATS_BOOKING_URL =
    "https://www.eventbrite.co.uk/e/maggies-cats-a-christmas-family-show-tickets-2005092157619?aff=oddtdtcreator";

export const MAGGIES_CATS_TITLE = "Maggie’s Cats: A Christmas Family Show";

const IMAGE_DIR = "/images/events/2026/maggies-cats";

/** The one supplied artwork (2:1, no text on it). It is shown in full on the event page; title, dates and venue are written on the page. */
const mainImage = {
    src: `${IMAGE_DIR}/maggies-cats-cover.jpg`,
    alt: "Three children in cat ears and tails and Santa sit on a rug in a snowy park beside a lit Christmas tree, looking across the Thames towards Big Ben and the Houses of Parliament at sunset",
    width: 1774,
    height: 887,
    /* Square card crop: keeps Big Ben, the lamp and all three cats; the snowy tree and most of Santa are trimmed on the right. */
    position: "22% 50%",
};

const bookTickets = {
    label: "Book Tickets",
    href: MAGGIES_CATS_BOOKING_URL,
    variant: "primary",
    external: true,
} as const;

/** Verified prices in GBP. Family tickets cover the stated combination of people, not one person. */
export const MAGGIES_CATS_TICKETS = [
    { name: "Adult", price: 10 },
    { name: "Child", price: 8 },
    { name: "Family ticket: 1 Adult + 1 Child", price: 15, description: "1 Adult + 1 Child" },
    { name: "Family ticket: 2 Adults + 1 Child", price: 23, description: "2 Adults + 1 Child" },
    { name: "Family ticket: 2 Adults + 2 Children", price: 25, description: "2 Adults + 2 Children" },
] as const;

export const MAGGIES_CATS_GROUP_RATE = {
    price: 5,
    minimumPeople: 15,
} as const;

const ABOUT = [
    "Christmas preparations are underway, and Vivi, Kiki and Mika are determined to make this year’s celebrations something special.",
    "Vivi has everything under control. Or at least, that’s the plan. She likes things neat, tidy and properly organised, and she would much rather everyone followed the arrangements she’s carefully made.",
    "Kiki sees things a little differently. Full of energy and curiosity, she’s always ready to try something new. She has plenty of ideas, although whether they’re particularly helpful is another question entirely.",
    "And then there’s Mika. She’s quieter than the other two, happiest when she’s with her friends and often content to let them take the lead. But that doesn’t mean she has nothing to contribute. She has her own way of seeing things, even if she doesn’t always make herself heard.",
    "With three such different personalities, preparing for Christmas was never going to be completely straightforward.",
    "There are decorations to arrange, plans to make and plenty of opportunities for things to go a little off course. As the three friends work together, they discover that Christmas doesn’t always have to turn out exactly as planned.",
    "Maggie’s Cats is a playful Christmas family stage show filled with humour, friendship and moments of tenderness. At its heart is a simple idea: we don’t all have to be the same to belong.",
    "Whether you’re coming with young children or bringing the whole family along, it’s a chance to enjoy a little live theatre together in the run-up to Christmas.",
];

/** Full event page for the December 2026 outdoor family show. */
export const maggiesCatsEvent: EventCard = {
    id: "2026-maggies-cats-christmas-family-show",
    slug: MAGGIES_CATS_SLUG,
    listingCategory: "event",
    isPerformanceRun: true,
    title: MAGGIES_CATS_TITLE,
    subtitle: "A Christmas Family Show",
    category: "Family Show",
    date: "5, 6, 12, 13, 19 & 20 December 2026",
    dateIso: "2026-12-05",
    location: "County Hall Members’ Terrace",
    excerpt:
        "Three very different cats get ready for Christmas in a playful outdoor family show.",
    cardCtaLabel: "Find Out More",
    seo: {
        title: "Maggie’s Cats | Christmas Family Show in London | County Hall",
        description:
            "Join Vivi, Kiki and Mika for Maggie’s Cats, a playful outdoor Christmas family show at County Hall on London’s South Bank. Selected dates in December 2026.",
    },
    description: ["# Christmas is coming, and the cats have plans!", ...ABOUT],
    image: mainImage,
    sessions: publicSessionsForEvent(MAGGIES_CATS_SLUG),
    ticketOffers: MAGGIES_CATS_TICKETS.map((ticket) => ({ ...ticket })),
    showPage: {
        headline: "Three cats. One Christmas. What could possibly go wrong?",
        intro: [
            "Christmas is just around the corner, and Vivi, Kiki and Mika have something special planned.",
            "Join three very different cats as they get ready for the big day, with plenty of laughter, a few unexpected surprises and a little Christmas mischief along the way.",
        ],
        facts: [
            { label: "Dates", value: "5, 6, 12, 13, 19 & 20 December 2026" },
            { label: "Times", value: "11:00 AM, 1:00 PM & 3:00 PM" },
            { label: "Where", value: "County Hall Members’ Terrace, London" },
            { label: "Outdoors", value: "Outdoor family performance" },
        ],
        about: {
            heading: "Christmas is coming, and the cats have plans!",
            paragraphs: ABOUT,
        },
        cats: {
            heading: "Meet Vivi, Kiki and Mika",
            intro: "Three friends, three very different personalities, and quite a lot to organise before Christmas!",
            items: [
                {
                    name: "Vivi",
                    role: "The Organiser",
                    paragraphs: [
                        "Vivi likes things done properly. Everything has its place, every plan has a purpose, and there’s really no reason why anyone should make a mess.",
                        "She’s the sort of cat who would probably have Christmas organised weeks in advance, right down to the last decoration.",
                        "Unfortunately for Vivi, her friends don’t always share her enthusiasm for following instructions.",
                    ],
                },
                {
                    name: "Kiki",
                    role: "The Adventurer",
                    paragraphs: [
                        "If there’s something new to explore, Kiki will be the first to investigate.",
                        "She’s curious, energetic and always coming up with another idea. Sitting still isn’t really her thing, and she has a wonderful talent for turning even the simplest activity into something unexpected.",
                        "Her enthusiasm is infectious, although Vivi might occasionally wish she’d slow down just a little.",
                    ],
                },
                {
                    name: "Mika",
                    role: "The Quiet Dreamer",
                    paragraphs: [
                        "Mika is the gentlest and quietest of the three.",
                        "She doesn’t rush to be the centre of attention and is often happiest simply being with her friends, watching everything that’s going on around her.",
                        "Thoughtful and a little shy, Mika sometimes needs more time to find her confidence. But there’s more to this quiet little cat than first meets the eye.",
                    ],
                },
            ],
        },
        schedule: {
            heading: "When Can You See Maggie’s Cats?",
            intro: "We’re bringing Maggie’s Cats to County Hall Members’ Terrace across three weekends in December, with three performances each day.",
            timesLabel: "Daily performance times",
            total: "There are 18 performances in total.",
            support: "Choose the date and time that suits your family and book your tickets through Eventbrite.",
        },
        tickets: {
            heading: "Tickets and Family Offers",
            intro: "Coming with the family? We’ve put together a few ticket options to make planning your visit easier.",
            familyNote: "Each family ticket admits the number of adults and children shown in the ticket description.",
            group: {
                heading: "Group Bookings",
                paragraphs: [
                    "Bringing a bigger group? Tickets are available at £5 per person for groups of 15 or more.",
                    "If you’re organising a visit for a school, community group or larger party, please get in touch to discuss the arrangements.",
                    "Private performances or special group arrangements may be possible, subject to confirmation.",
                ],
                contactLabel: "Contact us about group bookings",
                contactHref: "/contact?subject=events",
            },
            button: "Book Your Tickets",
        },
        venue: {
            heading: "Christmas at County Hall",
            paragraphs: [
                "Maggie’s Cats will be performed outdoors at County Hall Members’ Terrace, on London’s South Bank.",
                "Set beside the River Thames, with views towards Big Ben and the Houses of Parliament, it’s a lovely place to spend some time with the family during the Christmas season.",
                "There’s something rather special about watching a performance with London as the backdrop. Just remember that December can be chilly, so make sure everyone is dressed for the weather!",
            ],
            name: "County Hall Members’ Terrace",
            address: "County Hall, South Bank, London",
        },
        /* Refreshment, weather, seating and accessibility details are not confirmed, so they are deliberately left out. */
        visit: {
            heading: "A Few Things to Know Before You Come",
            intro: "We’re looking forward to welcoming you to Maggie’s Cats! Here’s something to bear in mind when planning your visit.",
            items: [
                {
                    title: "Wrap Up Warm",
                    paragraphs: [
                        "This is an outdoor performance, and December in London can get pretty cold.",
                        "We recommend warm coats, scarves, hats and gloves, especially for younger visitors. A few extra layers are always a good idea.",
                    ],
                },
            ],
        },
        finalCta: {
            heading: "Come and Join the Cats!",
            paragraphs: [
                "Vivi, Kiki and Mika are getting ready for Christmas, and they’d love you to join them.",
                "Bring the family, wrap up warm and come along for a little Christmas fun on London’s South Bank.",
                "We hope to see you there!",
            ],
            button: "Book Your Tickets",
        },
    },
    bookingUrl: MAGGIES_CATS_BOOKING_URL,
    bookNow: bookTickets,
};
