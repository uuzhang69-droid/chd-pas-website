import type { EventCard } from "../types";
import { publicSessionsForEvent } from "../event-sessions";
import { latestSession, longDate } from "../../lib/events/series";

const SLUG = "lunchtime-concert-series";

const sessions = publicSessionsForEvent(SLUG);
const latest = latestSession(sessions);

/** Card text follows the newest published concert, so adding a session updates it. */
const date = latest?.date
    ? `Monthly series · Latest concert: ${longDate(latest.date)}${latest.start ? `, ${latest.start}` : ""}`
    : "Monthly series";

const image = {
    src: "/images/events/2026/lunchtime-concert-series/lunchtime-concert-series-cover.jpg",
    alt: "County Hall Quartet lunchtime concert with cellist Meera Priyanka Raja",
};

const viewDetails = {
    label: "View Details",
    href: `/events/${SLUG}`,
    variant: "primary",
} as const;

/** Full series page. Concerts come from `event-sessions.ts` (eventSlug "lunchtime-concert-series"). */
export const lunchtimeConcertSeriesEvent: EventCard = {
    id: "event-3",
    slug: SLUG,
    listingCategory: "event",
    isSeries: true,
    title: "Lunchtime Concert Series",
    date,
    /* Shown on the page and in lists. Ordering is derived from the sessions, see event-dates.ts. */
    dateIso: latest?.date,
    excerpt: "Enjoy a relaxed lunchtime concert with the County Hall Quartet.",
    description: [
        "The County Hall Quartet presents informal afternoon concerts of classical music at County Hall. Each month brings a new programme, where music becomes our common language.",
        "# The County Hall Quartet",
        "The County Hall Quartet comprises four acclaimed and award-winning musicians: Stefano Marzanni (Piano), Emma Arizza (Violin), Natalia Solis Paredes (Viola) and Meera Priyanka Raja (Cello).",
        "# Venue",
        "Please check each concert listing for its confirmed venue and arrival details.",
    ],
    sessions,
    image,
    bookingPending: true,
    bookNow: viewDetails,
};
