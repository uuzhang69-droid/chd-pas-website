import assert from "node:assert/strict";
import { test } from "node:test";
import { siteContent } from "../src/content/site";
import type { EventCard } from "../src/content/types";
import * as robotsModule from "../src/app/robots";
import * as sitemapModule from "../src/app/sitemap";
import { pageMetadata } from "../src/lib/seo/metadata";
import {
    ORGANISATION_NAME,
    SITE_NAME,
    SITE_URL,
    absoluteUrl,
    isIndexingEnabled,
} from "../src/lib/seo/site";
import {
    breadcrumbJsonLd,
    socialProfileUrls,
    eventJsonLd,
    londonIso,
    organisationJsonLd,
} from "../src/lib/seo/structured-data";

/* tsx may wrap a default export in a namespace object, so unwrap it. */
const unwrap = <T,>(mod: unknown): T =>
    ((mod as { default?: unknown }).default &&
    typeof (mod as { default: unknown }).default !== "object"
        ? (mod as { default: T }).default
        : ((mod as { default?: { default?: T } }).default?.default ??
          (mod as T))) as T;
const robots =
    unwrap<() => ReturnType<typeof import("../src/app/robots").default>>(
        robotsModule,
    );
const sitemap =
    unwrap<() => ReturnType<typeof import("../src/app/sitemap").default>>(
        sitemapModule,
    );

const events = siteContent.pages.events.items;
const bySlug = (slug: string) => events.find((event) => event.slug === slug)!;
const withEnv = <T,>(
    env: Record<string, string | undefined>,
    fn: () => T,
): T => {
    const saved = { ...process.env };
    for (const [key, value] of Object.entries(env)) {
        if (value === undefined) delete process.env[key];
        else process.env[key] = value;
    }
    try {
        return fn();
    } finally {
        process.env = saved;
    }
};

test("the production URL is the confirmed domain and never localhost", () => {
    assert.equal(SITE_URL, "https://www.countyhalldancecentre.com");
    assert.equal(
        absoluteUrl("/events/x"),
        "https://www.countyhalldancecentre.com/events/x",
    );
    assert(!SITE_URL.includes("localhost"));
});

test("indexing is only on for Vercel production or an explicit override", () => {
    assert.equal(
        withEnv(
            { SEO_INDEXING: undefined, VERCEL_ENV: undefined },
            isIndexingEnabled,
        ),
        false,
    );
    assert.equal(
        withEnv(
            { SEO_INDEXING: undefined, VERCEL_ENV: "preview" },
            isIndexingEnabled,
        ),
        false,
    );
    assert.equal(
        withEnv(
            { SEO_INDEXING: undefined, VERCEL_ENV: "production" },
            isIndexingEnabled,
        ),
        true,
    );
    assert.equal(
        withEnv(
            { SEO_INDEXING: "enabled", VERCEL_ENV: undefined },
            isIndexingEnabled,
        ),
        true,
    );
    assert.equal(
        withEnv(
            { SEO_INDEXING: "disabled", VERCEL_ENV: "production" },
            isIndexingEnabled,
        ),
        false,
    );
});

test("robots.txt blocks everything unless indexing is enabled, and never lists a sitemap then", () => {
    const off = withEnv(
        { SEO_INDEXING: undefined, VERCEL_ENV: undefined },
        robots,
    );
    assert.deepEqual(off.rules, { userAgent: "*", disallow: "/" });
    assert.equal(off.sitemap, undefined);
    const on = withEnv({ SEO_INDEXING: "enabled" }, robots);
    assert.equal(
        on.sitemap,
        "https://www.countyhalldancecentre.com/sitemap.xml",
    );
    assert.deepEqual((on.rules as { disallow: string[] }).disallow, [
        "/api/",
        "/studio",
        "/admin",
        "/newsletter/",
    ]);
});

test("sitemap lists public pages once, on the production domain only", () => {
    const urls = withEnv({ SEO_INDEXING: "enabled" }, sitemap).map(
        (entry) => entry.url,
    );
    assert.equal(new Set(urls).size, urls.length);
    assert(
        urls.every(
            (url) => url.startsWith(`${SITE_URL}/`) || url === `${SITE_URL}/`,
        ),
    );
    assert(urls.includes(`${SITE_URL}/events/lunchtime-concert-series`));
    // Past events that are still public stay listed.
    assert(urls.includes(`${SITE_URL}/events/dance-meets-arts`));
    // Retired events, redirects, tools and unlinked tester pages are not listed.
    for (const hidden of [
        "/events/milonga-ojo-opening-night",
        "/events/ceramics-workshop-with-yasemin",
        "/classes",
        "/booking",
        "/studio",
        "/tester-classes",
    ])
        assert(!urls.includes(`${SITE_URL}${hidden}`), hidden);
    // Every event in the shared collection has an entry.
    for (const event of events)
        assert(urls.includes(`${SITE_URL}/events/${event.slug}`), event.slug);
});

test("every page metadata helper result has a canonical URL and matching social data", () => {
    const meta = pageMetadata({
        title: "Example",
        description: "A description.",
        path: "/example",
        image: { src: "/a.jpg", alt: "Alt", width: 1200, height: 630 },
    });
    assert.equal(
        (meta.alternates as { canonical: string }).canonical,
        "/example",
    );
    assert.equal((meta.openGraph as { url: string }).url, "/example");
    assert.equal(
        (meta.twitter as { card: string }).card,
        "summary_large_image",
    );
    const portrait = pageMetadata({
        title: "Poster",
        path: "/poster",
        image: { src: "/p.jpg", alt: "Poster", width: 800, height: 1000 },
    });
    assert.equal((portrait.twitter as { card: string }).card, "summary");
});

test("London offsets are correct on both sides of the clock changes", () => {
    assert.equal(londonIso("2026-03-29T00:30"), "2026-03-29T00:30:00+00:00");
    assert.equal(londonIso("2026-03-29T02:30"), "2026-03-29T02:30:00+01:00");
    assert.equal(londonIso("2026-10-24T11:00"), "2026-10-24T11:00:00+01:00");
    assert.equal(londonIso("2026-10-25T20:30"), "2026-10-25T20:30:00+00:00");
    assert.equal(londonIso("2026-11-28T19:30"), "2026-11-28T19:30:00+00:00");
    assert.equal(londonIso("2026-07-01T09:00"), "2026-07-01T09:00:00+01:00");
});

test("single events use confirmed times and invent no offers, URLs or end times", () => {
    const within = eventJsonLd(bySlug("within-one-room-stillness-in-motion"))!;
    assert.equal(within["@type"], "Event");
    assert.equal(within.startDate, "2026-11-28T19:30:00+00:00");
    assert.equal(within.endDate, "2026-11-28T20:00:00+00:00");
    // Free admission is confirmed; booking is not, so the offer has no URL.
    assert.deepEqual(within.offers, {
        "@type": "Offer",
        price: "0",
        priceCurrency: "GBP",
    });
    const acting = eventJsonLd(bySlug("an-actors-work-with-an-object"))!;
    assert.equal(acting.startDate, "2026-11-28T15:00:00+00:00");
    assert.equal(acting.endDate, "2026-11-28T18:00:00+00:00");
    assert.equal("offers" in acting, false);
    // A date-only event gets a date, not a made-up time.
    const opening = eventJsonLd(
        bySlug("county-hall-dance-centre-opening-day"),
    )!;
    assert.equal(opening.startDate, "2026-09-10");
    assert.equal("endDate" in opening, false);
    // Multi-day event: BST at the start, GMT at the end.
    const festival = eventJsonLd(bySlug("four-seasons-festival"))!;
    assert.equal(festival.startDate, "2026-10-24T11:00:00+01:00");
    assert.match(String(festival.endDate), /^2026-10-25T\d\d:\d\d:00\+00:00$/);
});

test("the Lunchtime series is an EventSeries whose concerts appear once each", () => {
    const series = eventJsonLd(bySlug("lunchtime-concert-series"))! as {
        "@type": string;
        startDate?: string;
        subEvent: {
            name: string;
            startDate: string;
            endDate?: string;
            url: string;
        }[];
    };
    assert.equal(series["@type"], "EventSeries");
    assert.equal("startDate" in series, false);
    assert.deepEqual(
        series.subEvent.map((e) => [e.name, e.startDate, e.endDate]),
        [
            ["Encounters", "2026-09-25T13:00:00+01:00", undefined],
            [
                "Fandango! Italian Virtuosity Meets Spanish Dance",
                "2026-10-23T13:00:00+01:00",
                undefined,
            ],
            [
                "The Romantic Heart",
                "2026-11-20T13:00:00+00:00",
                "2026-11-20T14:00:00+00:00",
            ],
        ],
    );
    assert.equal(new Set(series.subEvent.map((e) => e.url)).size, 3);
});

test("organisation data uses only details published on the site", () => {
    const graph = (
        organisationJsonLd() as { "@graph": Record<string, unknown>[] }
    )["@graph"];
    const org = graph[0] as {
        name: string;
        telephone: string;
        email: string;
        address: { postalCode: string };
        sameAs: string[];
        alternateName: string[];
        "@id": string;
    } & Record<string, unknown>;
    // One organisation: the full school name, with the brand and abbreviations as alternate names.
    assert.equal(org.name, "County Hall Dance & Performing Arts School");
    assert.equal(org.name, ORGANISATION_NAME);
    assert.deepEqual(org.alternateName, [
        "County Hall Dance Centre",
        "CHDPAS",
        "CHDC",
    ]);
    // The website brand is the public name, and the website entity uses it.
    assert.equal(SITE_NAME, "County Hall Dance Centre");
    const site = graph[1] as { name: string; publisher: { "@id": string } };
    assert.equal(site.name, "County Hall Dance Centre");
    assert.equal(site.publisher["@id"], org["@id"]);
    assert.equal(
        graph.filter((node) => String(node["@type"]).includes("Organization"))
            .length,
        1,
    );
    assert.equal(org.telephone, siteContent.global.footer.contact.phone);
    assert.equal(org.email, siteContent.global.footer.contact.email);
    assert.equal(org.address.postalCode, "SE1 7PB");
    assert.deepEqual(
        org.sameAs,
        siteContent.global.footer.social.map((item) => item.href),
    );
    assert.equal("openingHours" in org, false);
    assert.equal("aggregateRating" in org, false);
});

test("an event without any date produces no structured data", () => {
    const undated = {
        id: "x",
        slug: "x",
        title: "X",
        date: "",
        image: { src: "/x.jpg", alt: "" },
        bookNow: { label: "", href: "" },
    } as EventCard;
    assert.equal(eventJsonLd(undated), undefined);
});

test("SEO_INDEXING=disabled beats a Vercel production deployment", () => {
    assert.equal(
        withEnv(
            { SEO_INDEXING: "disabled", VERCEL_ENV: "production" },
            isIndexingEnabled,
        ),
        false,
    );
});

test("robots.txt, sitemap and page robots meta agree when indexing is off and on", () => {
    const off = { SEO_INDEXING: undefined, VERCEL_ENV: undefined };
    assert.deepEqual(withEnv(off, robots).rules, {
        userAgent: "*",
        disallow: "/",
    });
    assert.deepEqual(withEnv(off, sitemap), []);
    const noindexOff = withEnv(off, () =>
        pageMetadata({ title: "x", path: "/x", noindex: true }),
    );
    assert.deepEqual(noindexOff.robots, { index: false, follow: false });
    const on = { SEO_INDEXING: "enabled" };
    assert.notEqual(withEnv(on, robots).sitemap, undefined);
    assert(withEnv(on, sitemap).length > 20);
    const noindexOn = withEnv(on, () =>
        pageMetadata({ title: "x", path: "/x", noindex: true }),
    );
    assert.deepEqual(noindexOn.robots, { index: false, follow: true });
});

test("social profiles: the three confirmed accounts, one list, no duplicates", () => {
    const urls = socialProfileUrls();
    assert.deepEqual(urls, [
        "https://www.instagram.com/countyhalldancecentre",
        "https://www.xiaohongshu.com/user/profile/66decbc5000000000d024c8b",
        "https://www.tiktok.com/@county.hall.dance",
    ]);
    // The header and footer lists hold exactly these accounts.
    const { footer, utilityBar } = siteContent.global;
    assert.deepEqual(footer.social.map((i) => i.href).sort(), [...urls].sort());
    assert.deepEqual(
        utilityBar.social.map((i) => i.href).sort(),
        [...urls].sort(),
    );
    // Only those platforms: no Facebook, YouTube, X or LinkedIn.
    assert(
        urls.every((u) =>
            /instagram\.com|xiaohongshu\.com|tiktok\.com/.test(u),
        ),
    );
    // Event organisers never carry social links.
    const festival = eventJsonLd(bySlug("four-seasons-festival"))!;
    assert.equal(JSON.stringify(festival).includes("instagram"), false);
});

test("breadcrumbs: Home first, real parent routes, absolute URLs, positions in order", () => {
    const crumb = breadcrumbJsonLd([
        { name: "What's On", path: "/events" },
        {
            name: "Within One Room",
            path: "/events/within-one-room-stillness-in-motion",
        },
    ]) as {
        "@type": string;
        itemListElement: { position: number; name: string; item: string }[];
    };
    assert.equal(crumb["@type"], "BreadcrumbList");
    assert.deepEqual(
        crumb.itemListElement.map((i) => [i.position, i.name, i.item]),
        [
            [1, "Home", "https://www.countyhalldancecentre.com/"],
            [2, "What's On", "https://www.countyhalldancecentre.com/events"],
            [
                3,
                "Within One Room",
                "https://www.countyhalldancecentre.com/events/within-one-room-stillness-in-motion",
            ],
        ],
    );
});

test("the About page opens with the confirmed brand relationship and avoids legal wording", () => {
    const paragraphs = siteContent.pages.about.story.paragraphs;
    assert.equal(
        paragraphs[0],
        "County Hall Dance Centre (CHDC), also known as County Hall Dance & Performing Arts School (CHDPAS), is a creative space for dance, movement and the performing arts, located at London's iconic County Hall.",
    );
    assert.match(
        paragraphs[1],
        /^We bring together regular dance and movement classes/,
    );
    const text =
        paragraphs.join(" ") + siteContent.pages.about.meta.description;
    for (const banned of ["officially known as", "home to", "part of"])
        assert.equal(text.includes(banned), false, banned);
});

test("page descriptions are distinct and no longer than 160 characters", () => {
    const seen = new Map<string, string>();
    const check = (name: string, description: string | undefined) => {
        if (!description) return;
        assert(
            description.length <= 160,
            `${name} is ${description.length} characters`,
        );
        assert.equal(
            seen.get(description),
            undefined,
            `${name} repeats ${seen.get(description)}`,
        );
        seen.set(description, name);
    };
    check("default", siteContent.meta.defaultDescription);
    for (const [name, page] of Object.entries(siteContent.pages))
        check(
            name,
            (page as { meta?: { description?: string } }).meta?.description,
        );
    check("membership", siteContent.pages.membership.overview.meta.description);
    check("venueHire", siteContent.pages.venueHire.overview.meta.description);
    for (const style of siteContent.pages.classes.styles)
        check(`class:${style.slug}`, style.metaDescription);
    for (const course of siteContent.pages.courses.items)
        check(`course:${course.slug}`, course.metaDescription);
});

test("the retired Space Booking page is not in the sitemap, but the venue hire overview and enquiry page are", () => {
    const urls = withEnv({ SEO_INDEXING: "enabled" }, () =>
        sitemap().map((entry) => entry.url),
    );
    assert.ok(!urls.some((url) => url.includes("space-booking")));
    assert.ok(urls.includes(`${SITE_URL}/venue-hire`));
    assert.ok(urls.includes(`${SITE_URL}/contact`));
});
