import { enrichEventsContent } from "./enrich-events-content";
import { siteStructure } from "./site.structure";
import { resolveSiteContent } from "./resolve-site-content";
import type { SiteSource } from "./site.source";
import type { EventCard } from "./types";
import { publicEvents } from "../lib/events/event-dates";

/** Resolved site content — all user-facing text comes from copy.ts (via website-copy.csv). */
const resolved = enrichEventsContent(
    resolveSiteContent(siteStructure) as unknown as SiteSource,
);

/** One public collection: the home grid is a view of the /events list, not a second list. */
const publicEventItems = publicEvents<EventCard>(resolved.pages.events.items);

export const siteContent = {
    ...resolved,
    home: {
        ...resolved.home,
        events: {
            ...resolved.home.events,
            items: publicEventItems,
        },
    },
    pages: {
        ...resolved.pages,
        events: {
            ...resolved.pages.events,
            items: publicEventItems,
        },
    },
};

export type SiteContent = SiteSource;
