import assert from "node:assert/strict";
import { test } from "node:test";
import * as sitemapModule from "../src/app/sitemap";
import { buildSearchIndex, getSearchIndex } from "../src/lib/search/build-index";
import { searchDocs, searchSite } from "../src/lib/search/search";
import { queryTerms, stem } from "../src/lib/search/text";
import type { SearchDoc } from "../src/lib/search/types";

const unwrap = <T,>(mod: unknown): T => {
    const m = mod as { default?: unknown };
    const inner = m.default as { default?: unknown } | undefined;
    return (typeof m.default === "function" ? m.default : (inner?.default ?? mod)) as T;
};

const allUrls = (outcome: ReturnType<typeof searchSite>) =>
    [outcome.suggested?.doc.url, ...outcome.results.map((r) => r.doc.url)].filter(Boolean) as string[];
const urls = (query: string) => allUrls(searchSite(query));

/** A small fixed set, so ranking tests do not depend on the live content. */
const doc = (url: string, title: string, type: SearchDoc["type"], extra: Partial<SearchDoc> = {}): SearchDoc => ({
    url, title, type, summary: "", keywords: "", body: "", ...extra,
});
const fixtures: SearchDoc[] = [
    doc("/events", "What's On", "Page", {
        hub: true,
        aliases: ["events", "what's on", "activities"],
        summary: "Events, workshops and performances at County Hall.",
    }),
    doc("/events/tango-fever", "Tango Fever Workshop", "Workshop", {
        keywords: "Event Workshop tango",
        summary: "A weekend of Argentine tango.",
    }),
    doc("/events/jazz-night", "Jazz Night", "Event", { keywords: "Event", summary: "Live music." }),
    doc("/classes/tango", "Tango", "Class", { summary: "Weekly tango classes.", body: "Tango for beginners." }),
    doc("/venue-hire", "Venue Hire", "Venue hire", {
        hub: true,
        aliases: ["studio hire", "venue hire", "hire", "rental"],
        summary: "Hire a studio at County Hall.",
    }),
    doc("/contact", "Contact", "Page", {
        hub: true,
        aliases: ["contact", "phone", "email"],
        summary: "Get in touch.",
        body: "You can hire us for a party. Phone us.",
    }),
];

test("a plain keyword finds the right page and ignores case and punctuation", () => {
    for (const query of ["YOGA", "yoga", "  Yoga!!  ", "yoga?"]) {
        assert.equal(urls(query)[0], "/classes/yoga", query);
    }
});

test("several keywords: pages that match more of the words rank first", () => {
    const outcome = searchDocs(fixtures, "tango workshop");
    assert.equal(outcome.results[0].doc.url, "/events/tango-fever");
    assert.equal(outcome.results[0].coverage, 1);
    assert.ok(outcome.results.some((r) => r.coverage < 1)); // partial matches rank lower
    const scores = outcome.results.map((r) => r.score);
    assert.deepEqual(scores, [...scores].sort((a, b) => b - a));
});

test("plurals, word endings and synonyms meet", () => {
    assert.equal(stem("classes"), stem("class"));
    assert.equal(stem("dancing"), stem("dance"));
    assert.equal(stem("events"), stem("event"));
    assert.deepEqual(queryTerms("The Events!"), ["event"]);
    assert.equal(searchDocs(fixtures, "rental").suggested?.doc.url, "/venue-hire"); // rental ~ hire
    assert.ok(urls("lessons").some((url) => url.startsWith("/classes/"))); // lesson ~ class
    assert.equal(searchDocs(fixtures, "activity").suggested?.doc.url, "/events"); // activity ~ event
});

test("an empty or blank search gives nothing, and a nonsense search gives no results", () => {
    for (const query of ["", "   ", "!!!", "…"]) {
        const outcome = searchSite(query);
        assert.equal(outcome.total, 0, JSON.stringify(query));
        assert.equal(outcome.suggested, undefined);
    }
    const none = searchSite("qwertyuiop");
    assert.equal(none.total, 0);
    assert.equal(none.results.length, 0);
});

test("intent: events, classes, timetable, hire, private lessons, membership and contact", () => {
    const suggested = (query: string) => searchSite(query).suggested?.doc.url;
    assert.equal(suggested("events"), "/events");
    assert.equal(suggested("what's on"), "/events");
    assert.equal(suggested("activities"), "/events");
    assert.equal(suggested("classes"), "/classes-info");
    assert.equal(suggested("dance lessons"), "/classes-info");
    assert.equal(suggested("schedule"), "/timetable");
    assert.equal(suggested("timetable"), "/timetable");
    assert.equal(suggested("studio hire"), "/venue-hire");
    assert.equal(suggested("venue rental"), "/venue-hire");
    assert.equal(suggested("hire"), "/venue-hire");
    assert.equal(suggested("private lesson"), "/private-lessons");
    assert.equal(suggested("membership"), "/membership");
    assert.equal(suggested("phone"), "/contact");
    assert.equal(suggested("contact"), "/contact");
    // A topic is not an intent: it has no suggested page, only results.
    assert.equal(suggested("yoga"), undefined);
    assert.equal(suggested("tango"), undefined);
});

test("a general Events page does not push out an event that really matches", () => {
    const outcome = searchDocs(fixtures, "tango events");
    assert.equal(outcome.suggested?.doc.url, "/events"); // offered, not forced
    assert.equal(outcome.results[0].doc.url, "/events/tango-fever");
    assert.ok(outcome.results.some((r) => r.doc.url === "/events/jazz-night"));
    // In the live content a tango search still leads with the tango class, and yoga reaches the timetable.
    assert.ok(urls("tango events").includes("/classes/tango"));
    assert.ok(searchSite("yoga").results.some((r) => r.doc.url === "/timetable"));
});

test("hire puts venue hire information first", () => {
    const outcome = searchDocs(fixtures, "hire");
    assert.equal(outcome.suggested?.doc.url, "/venue-hire");
    // "contact" mentions hire in its text but is only an ordinary result.
    assert.equal(outcome.results[0].doc.url, "/contact");
});

test("one result per URL", () => {
    const duplicated = [...fixtures, ...fixtures, doc("/events", "What's On again", "Page", { summary: "events events" })];
    const outcome = searchDocs(duplicated, "events", 1, 50);
    const all = allUrls(outcome);
    assert.equal(new Set(all).size, all.length);
    const live = allUrls(searchSite("class"));
    assert.equal(new Set(live).size, live.length);
});

test("results are paged", () => {
    const many = Array.from({ length: 25 }, (_, i) =>
        doc(`/events/e${i}`, `Spring Show ${i}`, "Event", { keywords: "Event" }),
    );
    const one = searchDocs(many, "spring", 1);
    assert.equal(one.results.length, 10);
    assert.equal(one.pageCount, 3);
    const last = searchDocs(many, "spring", 99); // past the end is clamped
    assert.equal(last.page, 3);
    assert.equal(last.results.length, 5);
});

test("only real public pages are indexed: every result is in the sitemap, and nothing private appears", () => {
    const sitemap = unwrap<() => Array<{ url: string }>>(sitemapModule);
    const previous = process.env.SEO_INDEXING;
    process.env.SEO_INDEXING = "enabled";
    const publicPaths = new Set(sitemap().map((entry) => new URL(entry.url).pathname));
    if (previous === undefined) delete process.env.SEO_INDEXING;
    else process.env.SEO_INDEXING = previous;

    const index = buildSearchIndex();
    for (const entry of index) {
        assert.ok(publicPaths.has(entry.url), `${entry.url} is not a public sitemap page`);
        assert.ok(entry.title && entry.summary.length + entry.body.length >= 30, `${entry.url} has no content`);
        assert.ok(!/^\/(admin|api|newsletter|privacy|studio|tester-classes|search)/.test(entry.url), entry.url);
    }
    for (const path of publicPaths) assert.ok(index.some((entry) => entry.url === path), `${path} is missing from search`);
    assert.equal(new Set(index.map((entry) => entry.url)).size, index.length);

    for (const query of ["admin", "unsubscribe", "privacy policy draft", "service role"])
        for (const found of urls(query)) assert.ok(publicPaths.has(found), `${query} -> ${found}`);
    // The retired Space Booking page and the "coming soon" event category pages are not offered.
    assert.ok(!index.some((entry) => entry.url.includes("space-booking")));
    assert.ok(!index.some((entry) => /^\/events\/(milonga|workshops|masterclasses)$/.test(entry.url)));
});

test("people and facts on a page can be found: instructors, event categories, timetable names", () => {
    const index = getSearchIndex();
    const tango = index.find((entry) => entry.url === "/classes/tango")!;
    const instructorName = tango.keywords.split(" ").slice(0, 2).join(" ");
    assert.ok(instructorName.length > 2);
    assert.ok(urls(instructorName).includes("/classes/tango"));
    assert.ok(urls("workshop").some((url) => url.startsWith("/events/")));
    assert.ok(urls("vinyasa").includes("/timetable"));
});

test("user text cannot break out of the page: the query is plain data", () => {
    const hostile = `<script>alert(1)</script>"'`;
    const outcome = searchSite(hostile);
    assert.equal(outcome.query, hostile.slice(0, 100)); // returned as typed; React escapes it on the page
    assert.ok(outcome.results.every((r) => r.doc.url.startsWith("/")));
    assert.equal(searchSite("a".repeat(5000)).query.length, 100);
});
