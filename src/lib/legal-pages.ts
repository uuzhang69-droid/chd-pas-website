/**
 * Legal pages that are approved and live. The footer links to a page only when it is listed here,
 * so a visitor never lands on a 404 or an unapproved draft. Add a path only after the organisation
 * has approved the page text and the route is published.
 */
export const PUBLISHED_LEGAL_PAGES: readonly string[] = [];

export function isLegalPagePublished(href: string): boolean {
    return PUBLISHED_LEGAL_PAGES.includes(href);
}
