import { MAGGIES_CATS_SLUG, publicSessionsForEvent } from "../event-sessions";
import type { CastMember, EventCard } from "../types";

/**
 * Official Eventbrite page. Single source for every Book Tickets button for this event:
 * the detail page (hero, tickets, final call to action) reads it, and the listing card and calendar link to the detail page.
 * There are no per-date links.
 */
export const MAGGIES_CATS_BOOKING_URL =
    "https://www.eventbrite.co.uk/e/maggies-cats-a-christmas-family-show-tickets-2005092157619?aff=oddtdtcreator";

export const MAGGIES_CATS_TITLE = "Maggie’s Cats: A Christmas Family Show";

const IMAGE_DIR = "/images/events/2026/maggies-cats";

/** The one supplied artwork (2:1, no text on it). It is shown in full on the event page; title, dates and venue are written on the page. */
const mainImage = {
    src: `${IMAGE_DIR}/maggies-cats-cover.jpg`,
    alt: "Illustrated Christmas scene with three cat characters and Santa beside a decorated tree, overlooking the Thames and Big Ben.",
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

/**
 * Cast, as credited by the organiser. To add a headshot later, give a member an `image`
 * (for example { src: `${IMAGE_DIR}/hannah-spiteri.jpg`, alt: "Hannah Spiteri", width: 600, height: 800 }).
 * The card then shows the photo at 3:4 instead of the "Photo coming soon" placeholder. No email addresses or pronouns here.
 */
export const MAGGIES_CATS_CAST: CastMember[] = [
    { name: "Hannah Spiteri", role: "Vivi Cat" },
    { name: "Mae Meadows", role: "Kiki Cat" },
    { name: "Ayana Mon", role: "Mika Cat" },
    { name: "Mark Janicello", role: "Santa Claus" },
];

const ABOUT = [
    "Christmas preparations are underway, and Vivi, Kiki and Mika are determined to make this year’s celebrations something special.",
    "Vivi has everything under control. Or at least, that’s the plan. Kiki has plenty of ideas, although whether they’re particularly helpful is another question entirely. And Mika is just happy to be spending Christmas with her friends.",
    "With three such different personalities, preparing for Christmas was never going to be completely straightforward. There are decorations to arrange, plans to make and plenty of opportunities for things to go a little off course.",
    "Maggie’s Cats is a playful outdoor Christmas family show filled with humour, friendship and moments of tenderness.",
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
        title: "Maggie’s Cats Christmas Family Show 2026 | London",
        description:
            "Join Maggie’s Cats for an outdoor Christmas family show at County Hall, London. Performances on 5, 6, 12, 13, 19 and 20 December 2026.",
    },
    description: ["# Christmas Is Coming, and the Cats Have Plans!", ...ABOUT.map((text) => text.replaceAll("**", ""))],
    image: mainImage,
    sessions: publicSessionsForEvent(MAGGIES_CATS_SLUG),
    ticketOffers: MAGGIES_CATS_TICKETS.map((ticket) => ({ ...ticket })),
    showPage: {
        headline: "Three cats. One Christmas. What could possibly go wrong?",
        intro: [
            "Christmas is just around the corner, and Vivi, Kiki and Mika have something special planned.",
            "Join three very different cats as they get ready for the big day, with plenty of laughter, unexpected surprises and a little Christmas mischief along the way.",
        ],
        facts: [
            { label: "Dates", value: "5, 6, 12, 13, 19 & 20 December 2026" },
            { label: "Times", value: "11:00 AM, 1:00 PM & 3:00 PM" },
            { label: "Venue", value: "County Hall Members’ Terrace, London" },
            { label: "Performance", value: "Outdoor Christmas family show" },
        ],
        about: {
            heading: "Christmas Is Coming, and the Cats Have Plans!",
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
            heading: "Dates and Performance Times",
            intro: "Join us at County Hall Members’ Terrace across three weekends in December.",
            datesHeading: "Dates",
            timesHeading: "Daily performance times",
            times: ["11:00 AM", "1:00 PM", "3:00 PM"],
            closing: "There are 18 performances in total. Choose the date and time that works best for your family.",
        },
        tickets: {
            heading: "Tickets and Family Offers",
            intro: "Whether you’re visiting with one child or bringing the whole family, there are several ticket options available.",
            individualHeading: "Individual Tickets",
            familyHeading: "Family Tickets",
            familyNote: "Each family ticket admits the number of adults and children shown.",
            group: {
                heading: "Group Bookings",
                paragraphs: [
                    "Planning a visit for a school, community group or a larger party?",
                    "Tickets are **£5 per person for groups of 15 or more**.",
                    "Please contact us to discuss group bookings. Private performances or special arrangements may also be possible, subject to confirmation.",
                ],
                contactLabel: "Contact Us About Group Bookings",
                contactHref: "/contact?subject=events",
            },
            button: "Book Your Tickets",
        },
        cast: {
            heading: "Meet the Cast",
            intro: "Meet the performers bringing Maggie’s Cats to life this Christmas.",
            members: MAGGIES_CATS_CAST,
            creativeTeam: { heading: "Creative Team", name: "Roarrr Theatre" },
        },
        venue: {
            heading: "Christmas at County Hall",
            paragraphs: [
                "There’s something rather special about watching live theatre with London as your backdrop.",
                "Maggie’s Cats takes place outdoors at County Hall Members’ Terrace, overlooking the River Thames, with views towards Big Ben and the Houses of Parliament.",
                "It’s a lovely spot for a family outing in the run-up to Christmas. Just remember to dress for the weather!",
            ],
        },
        directions: {
            heading: "How to Find Us",
            name: "County Hall Members’ Terrace",
            address: "County Hall, South Bank, London",
            paragraphs: [
                "Please enter via **Queen’s Walk**, on the riverside of County Hall.",
                "Look for the gate leading to the staircase signposted for **Peacock Restaurant**. The entrance is between **the London Dungeon** and **Shrek’s Adventure**.",
                "Please follow the signs to the terrace.",
            ],
        },
        /* Cancellation, refund, seating, toilet, accessibility, duration and age details are not confirmed, so they are deliberately left out. */
        visit: {
            heading: "Before You Visit",
            items: [
                {
                    title: "Wrap Up Warm",
                    paragraphs: [
                        "Maggie’s Cats is an outdoor performance, and December in London can be very chilly, especially beside the river.",
                        "We recommend warm coats, scarves, hats and gloves. If you’re bringing young children, a few extra layers are a good idea.",
                    ],
                },
                {
                    title: "Bring Your Own Water",
                    paragraphs: [
                        "Please bring your own drinking water. You’re also welcome to bring refreshments, subject to venue rules.",
                    ],
                },
            ],
            contact: {
                before: "Have a question about the show? Please email ",
                email: "info@countyhalldancecentre.com",
                after: " and we’ll be happy to help.",
            },
        },
        finalCta: {
            heading: "Come and Join the Cats!",
            paragraphs: [
                "Vivi, Kiki and Mika are getting ready for Christmas. All that’s missing is you!",
                "Bring the family, wrap up warm and join us for a little Christmas fun on London’s South Bank.",
            ],
            button: "Book Your Tickets",
        },
    },
    bookingUrl: MAGGIES_CATS_BOOKING_URL,
    bookNow: bookTickets,
};
