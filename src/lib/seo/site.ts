import { siteContent } from "@/content/site";

/**
 * Single place for production SEO facts. The domain is the confirmed production
 * address; nothing else in the code base should hard-code it.
 */
export const SITE_URL = "https://www.countyhalldancecentre.com";
/** Public brand: used for the title template, Open Graph site name and the WebSite entity. */
export const SITE_NAME = siteContent.meta.siteName;
export const SITE_ABBREVIATION = "CHDC";
/** Full organisation name. The brand and this name refer to the same organisation. */
export const ORGANISATION_NAME = "County Hall Dance & Performing Arts School";
export const ORGANISATION_ABBREVIATION = "CHDPAS";
/** One organisation entity shared by every JSON-LD block. */
export const ORGANISATION_ID = `${SITE_URL}/#organisation`;
export const DEFAULT_DESCRIPTION = siteContent.meta.defaultDescription;
export const SITE_LOCALE = "en_GB";
/** Existing brand image, reused as the default share preview. */
export const DEFAULT_SHARE_IMAGE = {
    src: "/logo.png",
    alt: siteContent.global.logo.alt,
};

/** "/events/x" becomes "https://www.countyhalldancecentre.com/events/x". */
export function absoluteUrl(path: string): string {
    return new URL(path, SITE_URL).toString();
}

/**
 * Search engines may index only the real production site.
 * - `SEO_INDEXING=enabled` forces indexing on (use this on a host other than Vercel, once live).
 * - `SEO_INDEXING=disabled` forces it off.
 * - Otherwise indexing is on only for a Vercel production deployment.
 * Local development, Vercel previews and any unconfigured host stay noindex.
 */
export function isIndexingEnabled(): boolean {
    const override = process.env.SEO_INDEXING;
    if (override === "enabled") return true;
    if (override === "disabled") return false;
    return process.env.VERCEL_ENV === "production";
}
