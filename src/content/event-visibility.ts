/** Retain original records/media, but retire these specific standalone public pages. */
export const retiredEventSlugs = new Set([
    "milonga-ojo-opening-night",
    "ceramics-workshop-with-yasemin",
]);

export function isPublicEvent(slug: string): boolean {
    return !retiredEventSlugs.has(slug);
}
