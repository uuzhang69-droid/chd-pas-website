import { siteStructure } from "./site.structure";
import { resolveSiteContent } from "./resolve-site-content";
import type { SiteSource } from "./site.source";

/** Resolved site content — all user-facing text comes from copy.ts (via website-copy.csv). */
export const siteContent = resolveSiteContent(siteStructure) as unknown as SiteSource;

export type SiteContent = SiteSource;
