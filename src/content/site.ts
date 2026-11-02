import { enrichEventsContent } from "./enrich-events-content";
import { siteStructure } from "./site.structure";
import { resolveSiteContent } from "./resolve-site-content";
import type { SiteSource } from "./site.source";
import { isPublicEvent } from "./event-visibility";

/** Resolved site content — all user-facing text comes from copy.ts (via website-copy.csv). */
const resolved = enrichEventsContent(
    resolveSiteContent(siteStructure) as unknown as SiteSource,
);

export const siteContent = {
    ...resolved,
    home: {
        ...resolved.home,
        events: {
            ...resolved.home.events,
            items: resolved.home.events.items.filter((event) =>
                isPublicEvent(event.slug),
            ),
        },
    },
    pages: {
        ...resolved.pages,
        events: {
            ...resolved.pages.events,
            items: resolved.pages.events.items.filter((event) =>
                isPublicEvent(event.slug),
            ),
        },
    },
};

export type SiteContent = SiteSource;
