import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { siteContent } from "../src/content/site";
import { programmeModel } from "../src/lib/events/programme";
import { eventJsonLd } from "../src/lib/seo/structured-data";

const items = siteContent.pages.events.items;
const get = (slug: string) => items.find((item) => item.slug === slug)!;
const model = (slug: string) => programmeModel(get(slug), get(slug).sessions ?? []);

test("single-session events show no programme section when the hero already says it all", () => {
    for (const slug of ["county-hall-dance-centre-opening-day", "dance-meets-arts", "halloween-pumpkin-carving-workshop"]) {
        assert.equal(model(slug).hidden, true, slug);
    }
});

test("a single session with its own title, description or booking link keeps its section", () => {
    const base = get("halloween-pumpkin-carving-workshop");
    const [session] = base.sessions!;
    assert.equal(programmeModel(base, [{ ...session, description: ["Bring a pumpkin."] }]).hidden, false);
    assert.equal(programmeModel(base, [{ ...session, bookingUrl: "https://example.org/book" }]).hidden, false);
    assert.equal(programmeModel(base, [{ ...session, title: "Carving and costume show" }]).hidden, false);
});

test("Memory of China: simple multi-day event, venue written once, no repeated titles or organiser", () => {
    const m = model("memory-of-china");
    assert.equal(m.hidden, false);
    assert.equal(m.heading, "Dates & Times");
    assert.deepEqual(m.shared.map((row) => row.key), ["location"]);
    assert.equal(m.items.length, 2);
    for (const item of m.items) {
        assert.equal(item.showTitle, false);
        assert.deepEqual(item.rows, []);
        assert.equal(item.showWhen, true);
    }
});

test("Four Seasons Festival: mixed programme keeps every session, with venues that differ shown per session", () => {
    const m = model("four-seasons-festival");
    assert.equal(m.heading, "Programme");
    assert.equal(m.items.length, 9);
    assert(m.items.every((item) => item.showTitle));
    assert.deepEqual(m.shared, []);
    const venues = new Set(m.items.map((item) => item.rows.find((row) => row.key === "location")?.value));
    assert(venues.size > 1);
    assert(m.items.every((item) => item.rows.some((row) => row.key === "location")));
    /* The organiser is the same for every session and is stated once in Event information, not per session. */
    assert(m.items.every((item) => !item.rows.some((row) => row.key === "organiser")));
    assert.equal(get("four-seasons-festival").organiser, "County Hall Arts");
    /* Collaboration and hosting differences are preserved. */
    assert(m.items.some((item) => item.rows.some((row) => row.key === "partners")));
    assert(!m.items.some((item) => item.rows.some((row) => row.key === "hostedAt")));
});

test("repeated performances use the performance heading", () => {
    const maggie = get("maggies-cats-christmas-family-show");
    assert.equal(programmeModel(maggie, maggie.sessions!).heading, "Performance Dates & Times");
});

test("the school is not named as organiser on its own events, but outside organisers and partners are kept", () => {
    const page = readFileSync("src/app/events/[slug]/page.tsx", "utf8");
    assert.match(page, /event\.organiser !== SCHOOL_NAME/);
    assert.deepEqual(get("memory-of-china").partners?.length, 6);
    assert.equal(get("dance-meets-arts").partners?.[0], "County Hall Arts");
});

test("the Events listing has one title and the new introduction", () => {
    const events = siteContent.pages.events;
    assert.equal(events.hero.title, "What's On");
    assert.equal(events.hero.overline, "");
    assert.equal(events.hero.subtitle, "Discover performances, workshops, dance events and special experiences at County Hall.");
    assert.equal(events.intro, events.hero.subtitle);
    assert.equal(siteContent.home.events.title, siteContent.home.events.title);
});

test("Opening Day no longer states its date three times", () => {
    const event = get("county-hall-dance-centre-opening-day");
    assert.deepEqual(event.description, ["The new centre is a home for dance, creativity and cultural exchange at County Hall on the South Bank."]);
    assert.match(event.excerpt ?? "", /10 September 2026/);
});

test("structured data stays valid for events without a structured venue", () => {
    for (const slug of ["within-one-room-stillness-in-motion", "an-actors-work-with-an-object", "halloween-pumpkin-carving-workshop", "county-hall-dance-centre-opening-day", "memory-of-china"]) {
        const data = eventJsonLd(get(slug)) as { "@type": string; name: string; location: { "@type": string }; startDate: unknown };
        assert.equal(data["@type"], "Event", slug);
        assert.equal(data.name, get(slug).title, slug);
        assert.equal(data.location["@type"], "Place", slug);
        assert.equal(typeof data.startDate, "string", slug);
    }
});

test("hero layout rule: images are centred against the information column; landscape pictures sit beside the text only from the large breakpoint", () => {
    const page = readFileSync("src/app/events/[slug]/page.tsx", "utf8");
    assert.match(page, /"items-center lg:grid-cols-\[minmax\(0,1\.15fr\)_minmax\(0,1fr\)\]"/);
    assert.match(page, /"items-center md:grid-cols-\[minmax\(0,22rem\)_1fr\] lg:grid-cols-\[minmax\(0,24rem\)_1fr\]"/);
    assert.doesNotMatch(page, /items-start md:grid-cols-2/);
});
