import type { Metadata } from "next";
import type { ImageAsset } from "@/content/types";
import { withImageSizes } from "@/lib/events/image-dimensions";
import {
    DEFAULT_DESCRIPTION,
    DEFAULT_SHARE_IMAGE,
    SITE_LOCALE,
    SITE_NAME,
    isIndexingEnabled,
} from "./site";

type PageMetadataInput = {
    /** A plain title uses the layout template ("Title | Site name"). */
    title: string | { absolute: string };
    description?: string;
    /** Site path such as "/events/example"; becomes the canonical URL. */
    path: string;
    /** Falls back to the brand image. Relative paths resolve against `metadataBase`. */
    image?: ImageAsset;
    type?: "website" | "article";
    noindex?: boolean;
};

/**
 * One helper so every page has a canonical URL plus matching Open Graph and Twitter data.
 * Open Graph and Twitter objects replace the layout's, so they are always complete here.
 */
export function pageMetadata({
    title,
    description = DEFAULT_DESCRIPTION,
    path,
    image,
    type = "website",
    noindex = false,
}: PageMetadataInput): Metadata {
    const plainTitle = typeof title === "string" ? title : title.absolute;
    const [shareImage] = withImageSizes([
        image ?? { src: DEFAULT_SHARE_IMAGE.src, alt: DEFAULT_SHARE_IMAGE.alt },
    ]);
    const images = [
        {
            url: shareImage.src,
            alt: shareImage.alt,
            ...(shareImage.width && shareImage.height
                ? { width: shareImage.width, height: shareImage.height }
                : {}),
        },
    ];
    /* A wide picture suits the large card; portrait posters and the square logo use the small one. */
    const wide =
        shareImage.width && shareImage.height
            ? shareImage.width / shareImage.height >= 1.4
            : false;

    return {
        title,
        description,
        alternates: { canonical: path },
        openGraph: {
            title: plainTitle,
            description,
            url: path,
            siteName: SITE_NAME,
            locale: SITE_LOCALE,
            type,
            images,
        },
        twitter: {
            card: wide ? "summary_large_image" : "summary",
            title: plainTitle,
            description,
            images: images.map(({ url, alt }) => ({ url, alt })),
        },
        ...(noindex
            ? { robots: { index: false, follow: isIndexingEnabled() } }
            : {}),
    };
}
