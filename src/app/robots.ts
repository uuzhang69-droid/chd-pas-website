import type { MetadataRoute } from "next";
import { SITE_URL, absoluteUrl, isIndexingEnabled } from "@/lib/seo/site";

export default function robots(): MetadataRoute.Robots {
    // Local, preview and unconfigured hosts must never be crawled.
    if (!isIndexingEnabled()) {
        return { rules: { userAgent: "*", disallow: "/" } };
    }
    return {
        rules: {
            userAgent: "*",
            allow: "/",
            // Internal tools: the CMS studio and API routes.
            disallow: ["/api/", "/studio", "/admin", "/newsletter/"],
        },
        sitemap: absoluteUrl("/sitemap.xml"),
        host: SITE_URL,
    };
}
