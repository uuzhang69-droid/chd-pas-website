import type { MetadataRoute } from "next";
import {
    getAllClassSlugs,
    getAllCourseSlugs,
    getAllEventSlugs,
} from "@/content/helpers";
import { isLegalPagePublished } from "@/lib/legal-pages";
import { absoluteUrl, isIndexingEnabled } from "@/lib/seo/site";

/**
 * Public pages that render real content. Left out on purpose:
 * - redirects (/classes, /booking, /venue-hire/space-booking, retired events) and the CMS studio, API and tester pages;
 * - event category pages, which are not linked from the site yet.
 * Past events stay listed while their pages are public. No lastModified is given because
 * no reliable per-page modification date exists.
 */
const STATIC_PATHS = [
    "/",
    "/timetable",
    "/events",
    "/classes-info",
    "/class-booking",
    "/private-lessons",
    "/membership",
    "/courses",
    "/venue-hire",
    "/about",
    "/contact",
];

export default function sitemap(): MetadataRoute.Sitemap {
    // robots.txt disallows everything while indexing is off, so list nothing.
    if (!isIndexingEnabled()) return [];
    const paths = [
        ...STATIC_PATHS,
        // Legal pages are listed only once the organisation has approved and published them (src/lib/legal-pages.ts).
        ...(isLegalPagePublished("/privacy") ? ["/privacy"] : []),
        ...getAllClassSlugs().map((slug) => `/classes/${slug}`),
        ...getAllCourseSlugs().map((slug) => `/courses/${slug}`),
        // Already limited to public events; retired events are filtered out upstream.
        ...getAllEventSlugs().map((slug) => `/events/${slug}`),
    ];
    return [...new Set(paths)].map((path) => ({ url: absoluteUrl(path) }));
}
