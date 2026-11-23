import { siteContent } from "@/content/site";
import type { EventCard, EventSession } from "@/content/types";
import { venueAddress, venueName } from "@/content/venues";
import { eventWindow, londonNowKey } from "@/lib/events/event-dates";
import { sessionsNewestFirst } from "@/lib/events/series";
import {
    ORGANISATION_ABBREVIATION,
    ORGANISATION_ID,
    ORGANISATION_NAME,
    SITE_ABBREVIATION,
    SITE_NAME,
    SITE_URL,
    absoluteUrl,
} from "./site";

type JsonObject = Record<string, unknown>;

const SCHEMA = "https://schema.org";

/** Removes undefined values so only confirmed data is written. */
function compact(value: JsonObject): JsonObject {
    return Object.fromEntries(
        Object.entries(value).filter(([, item]) => item !== undefined),
    );
}

/**
 * "2026-11-28T19:30" (London wall-clock) to "2026-11-28T19:30:00+00:00" or "+01:00",
 * so GMT and BST are both correct whatever the server's time zone.
 */
export function londonIso(key: string): string {
    const wall = Date.parse(`${key}:00Z`);
    for (const offsetMinutes of [60, 0]) {
        const instant = new Date(wall - offsetMinutes * 60_000);
        if (londonNowKey(instant) === key) {
            const sign = offsetMinutes < 0 ? "-" : "+";
            const hours = String(
                Math.floor(Math.abs(offsetMinutes) / 60),
            ).padStart(2, "0");
            return `${key}:00${sign}${hours}:00`;
        }
    }
    // A wall-clock time skipped by the spring clock change: treat it as GMT.
    return `${key}:00+00:00`;
}

/**
 * An organiser that is the school itself points at the one organisation entity,
 * so no second, competing Organization is described. Other organisers stay by name.
 */
function organiserOf(name: string | undefined): JsonObject | undefined {
    if (!name) return undefined;
    if (name === ORGANISATION_NAME || name === SITE_NAME) {
        return {
            "@type": "Organization",
            "@id": ORGANISATION_ID,
            name: ORGANISATION_NAME,
            url: SITE_URL,
        };
    }
    return { "@type": "Organization", name };
}

function place(
    name: string | undefined,
    address?: string,
): JsonObject | undefined {
    if (!name) return undefined;
    return compact({ "@type": "Place", name, address });
}

function sessionLocation(session: EventSession): JsonObject | undefined {
    return place(venueName(session.venueId), venueAddress(session.venueId));
}

const base = {
    eventStatus: `${SCHEMA}/EventScheduled`,
    eventAttendanceMode: `${SCHEMA}/OfflineEventAttendanceMode`,
};

/** One concert (or other session) belonging to a series. */
function sessionEvent(
    session: EventSession,
    pageUrl: string,
): JsonObject | undefined {
    if (!session.date) return undefined;
    const hasStart = Boolean(session.start);
    const hasEnd = hasStart && Boolean(session.end);
    return compact({
        "@type": "Event",
        name: session.title,
        description: session.description?.[0],
        startDate: hasStart
            ? londonIso(`${session.date}T${session.start}`)
            : session.date,
        endDate: hasEnd
            ? londonIso(`${session.date}T${session.end}`)
            : undefined,
        ...base,
        location: sessionLocation(session),
        organizer: organiserOf(session.organiser),
        url: `${pageUrl}#session-${session.id}`,
    });
}

/**
 * Event structured data from the shared Events data.
 * - A series becomes one EventSeries whose concerts are `subEvent`s, never a single Event.
 * - Single events use the confirmed start and end only; a missing end time is omitted.
 * - `offers` appears only for free admission. No price or URL is invented.
 */
export function eventJsonLd(event: EventCard): JsonObject | undefined {
    const pageUrl = absoluteUrl(`/events/${event.slug}`);
    const image = event.image?.src ? [absoluteUrl(event.image.src)] : undefined;

    if (event.isSeries) {
        const subEvents = sessionsNewestFirst(event.sessions)
            .map((session) => sessionEvent(session, pageUrl))
            .filter((item): item is JsonObject => Boolean(item))
            .reverse();
        return {
            "@context": SCHEMA,
            ...compact({
                "@type": "EventSeries",
                name: event.title,
                description: event.excerpt,
                image,
                url: pageUrl,
                subEvent: subEvents.length > 0 ? subEvents : undefined,
            }),
        };
    }

    /* A run of separate performances: one EventSeries, each performance its own Event. Start times only; no end, availability or rating is invented. */
    if (event.isPerformanceRun) {
        const offers = event.ticketOffers?.map((ticket) =>
            compact({
                "@type": "Offer",
                name: ticket.name,
                description: ticket.description,
                price: ticket.price.toFixed(2),
                priceCurrency: "GBP",
                url: event.bookingUrl,
            }),
        );
        /* Credited cast only: names, no roles, contact details or images. */
        const performers = event.showPage?.cast.members.map((member) => ({
            "@type": "Person",
            name: member.name,
        }));
        const performances = [...sessionsNewestFirst(event.sessions)]
            .reverse()
            .map((session) => {
                const item = sessionEvent(session, pageUrl);
                if (!item) return undefined;
                return {
                    ...item,
                    name: event.title,
                    image,
                    location: place(
                        event.location,
                        event.showPage?.directions.address,
                    ),
                    performer: performers,
                    offers,
                };
            })
            .filter((item): item is NonNullable<typeof item> => Boolean(item));
        return {
            "@context": SCHEMA,
            ...compact({
                "@type": "EventSeries",
                name: event.title,
                description: event.excerpt,
                image,
                url: pageUrl,
                subEvent: performances.length > 0 ? performances : undefined,
            }),
        };
    }

    const window = eventWindow(event);
    if (!window) return undefined;
    const startDate = window.startTime
        ? londonIso(window.startKey)
        : window.startDate;
    let endDate: string | undefined;
    if (window.endTime) endDate = londonIso(window.endKey);
    else if (window.endDate !== window.startDate) endDate = window.endDate;

    const sessions = sessionsNewestFirst(event.sessions);
    const venues = new Set(sessions.map((session) => session.venueId));
    const organisers = new Set(sessions.map((session) => session.organiser));
    /* Use a session's venue or organiser only when every session agrees; otherwise fall back to the event's own text. */
    const location =
        (venues.size === 1 && sessions[0]
            ? sessionLocation(sessions[0])
            : undefined) ?? place(event.location);
    const organiser =
        event.organiser ??
        (organisers.size === 1 ? sessions[0]?.organiser : undefined);

    return {
        "@context": SCHEMA,
        ...compact({
            "@type": "Event",
            name: event.schemaName ?? event.title,
            description: event.excerpt,
            image,
            startDate,
            endDate,
            ...base,
            location: event.venue
                ? {
                      "@type": "Place",
                      name: event.venue.name,
                      address: {
                          "@type": "PostalAddress",
                          ...event.venue.address,
                      },
                  }
                : location,
            organizer: organiserOf(organiser),
            offers: event.freeAdmission
                ? compact({
                      "@type": "Offer",
                      price: "0",
                      priceCurrency: "GBP",
                      url: event.bookingUrl,
                  })
                : undefined,
            url: pageUrl,
        }),
    };
}

/**
 * Brand profiles confirmed on the site: Instagram, TikTok and RedNote (Xiaohongshu).
 * The header and footer lists are the same accounts, so they are merged by URL.
 * RedNote and Xiaohongshu are one platform and appear once.
 */
export function socialProfileUrls(): string[] {
    const { footer, utilityBar } = siteContent.global;
    return [
        ...new Set(
            [...footer.social, ...utilityBar.social].map((item) => item.href),
        ),
    ];
}

export type BreadcrumbStep = { name: string; path: string };

/** BreadcrumbList for a page whose parents are real, existing routes. Home is added first. */
export function breadcrumbJsonLd(steps: BreadcrumbStep[]): JsonObject {
    const all = [{ name: "Home", path: "/" }, ...steps];
    return {
        "@context": SCHEMA,
        "@type": "BreadcrumbList",
        itemListElement: all.map((step, index) => ({
            "@type": "ListItem",
            position: index + 1,
            name: step.name,
            item: absoluteUrl(step.path),
        })),
    };
}

/** Organisation and website, using only details already published on the site. */
export function organisationJsonLd(): JsonObject {
    const { contact } = siteContent.global.footer;
    const [street, ...rest] = contact.address;
    const [locality, postcode] = (rest.at(-1) ?? "").split(/\s+(.*)/);
    return {
        "@context": SCHEMA,
        "@graph": [
            compact({
                "@type": ["EducationalOrganization", "LocalBusiness"],
                "@id": ORGANISATION_ID,
                name: ORGANISATION_NAME,
                alternateName: [
                    SITE_NAME,
                    ORGANISATION_ABBREVIATION,
                    SITE_ABBREVIATION,
                ],
                url: SITE_URL,
                logo: absoluteUrl(siteContent.global.logo.src),
                image: absoluteUrl(siteContent.global.logo.src),
                description: siteContent.meta.defaultDescription,
                email: contact.email,
                telephone: contact.phone,
                address: {
                    "@type": "PostalAddress",
                    streetAddress: [street, rest.slice(0, -1).join(", ")]
                        .filter(Boolean)
                        .join(", "),
                    addressLocality: locality,
                    postalCode: postcode,
                    addressCountry: "GB",
                },
                sameAs: socialProfileUrls(),
            }),
            {
                "@type": "WebSite",
                "@id": `${SITE_URL}/#website`,
                url: SITE_URL,
                name: SITE_NAME,
                inLanguage: "en-GB",
                publisher: { "@id": ORGANISATION_ID },
            },
        ],
    };
}
