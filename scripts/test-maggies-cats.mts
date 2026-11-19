import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { test } from "node:test";
import { siteContent } from "../src/content/site";
import {
    MAGGIES_CATS_BOOKING_URL,
    MAGGIES_CATS_TICKETS,
    maggiesCatsEvent,
} from "../src/content/events/maggies-cats-christmas-family-show";
import {
    calendarSessionsForEvents,
    sessionsForDates,
} from "../src/lib/class-calendar/sessions";
import { isEventEnded, sortEventsForListing } from "../src/lib/events/event-dates";
import { eventJsonLd } from "../src/lib/seo/structured-data";

const event = siteContent.pages.events.items.find(
    (item) => item.slug === "maggies-cats-christmas-family-show",
)!;

const EXPECTED_DATES = ["2026-12-05", "2026-12-06", "2026-12-12", "2026-12-13", "2026-12-19", "2026-12-20"];
const EXPECTED_TIMES = ["11:00", "13:00", "15:00"];

/** Every public string of the event, for copy checks. */
function publicText(): string[] {
    const out: string[] = [];
    const walk = (value: unknown, key = "") => {
        if (typeof value === "string") {
            if (!["src", "href", "id", "slug", "dateIso", "contactHref", "variant"].includes(key)) out.push(value);
        } else if (Array.isArray(value)) value.forEach((item) => walk(item, key));
        else if (value && typeof value === "object")
            for (const [k, v] of Object.entries(value)) if (k !== "sessions") walk(v, k);
    };
    walk(event);
    return out;
}

test("the event is in the What's On list once and shows as upcoming", () => {
    assert(event, "event listed");
    assert.equal(siteContent.pages.events.items.filter((item) => item.slug === event.slug).length, 1);
    assert(sortEventsForListing(siteContent.pages.events.items).some((item) => item.slug === event.slug));
    assert.equal(isEventEnded(event, "2026-11-19T12:00"), false);
    assert.equal(isEventEnded(event, "2026-12-20T16:00"), false);
    assert.equal(isEventEnded(event, "2026-12-21T00:01"), true);
    assert.equal(event.listingCategory, "event");
    assert.equal(event.cardCtaLabel, "Find Out More");
    assert.equal(event.date, "5, 6, 12, 13, 19 & 20 December 2026");
});

test("six dates times three start times make 18 performances with no invented end time", () => {
    const sessions = event.sessions ?? [];
    assert.equal(sessions.length, 18);
    assert.deepEqual([...new Set(sessions.map((s) => s.date))].toSorted(), EXPECTED_DATES);
    for (const date of EXPECTED_DATES)
        assert.deepEqual(sessions.filter((s) => s.date === date).map((s) => s.start).toSorted(), EXPECTED_TIMES);
    assert.equal(new Set(sessions.map((s) => s.id)).size, 18);
    for (const session of sessions) {
        assert.equal(session.end, undefined);
        assert.equal(session.endUnconfirmed, true);
        assert.equal(session.venueId, "members-terrace");
    }
});

test("the calendar lists 18 separate occurrences, start only, linking to the event page", () => {
    const calendar = calendarSessionsForEvents(siteContent.pages.events.items).filter((s) =>
        s.id.startsWith("maggies-cats-"),
    );
    assert.equal(calendar.length, 18);
    for (const item of calendar) {
        assert.equal(item.end, "");
        assert.equal(item.name, "Maggie’s Cats");
        assert.match(item.href ?? "", /^\/events\/maggies-cats-christmas-family-show#session-maggies-cats-/);
    }
    const weekend = sessionsForDates(
        { classes: [] },
        [new Date("2026-12-05T00:00:00Z")],
        calendar,
    ).filter((s) => s.id.startsWith("maggies-cats-"));
    assert.deepEqual(weekend.map((s) => s.start), EXPECTED_TIMES);
});

test("prices match the confirmed list", () => {
    assert.deepEqual(
        MAGGIES_CATS_TICKETS.map((t) => [t.name, t.price]),
        [
            ["Adult", 10],
            ["Child", 8],
            ["Family ticket: 1 Adult + 1 Child", 15],
            ["Family ticket: 2 Adults + 1 Child", 23],
            ["Family ticket: 2 Adults + 2 Children", 25],
        ],
    );
    const text = publicText().join("\n");
    assert.match(text, /£5 per person for groups of 15 or more/);
});

test("the Eventbrite URL is defined once and used by every booking button", () => {
    const url =
        "https://www.eventbrite.co.uk/e/maggies-cats-a-christmas-family-show-tickets-2005092157619?aff=oddtdtcreator";
    assert.equal(MAGGIES_CATS_BOOKING_URL, url);
    assert.equal(maggiesCatsEvent.bookingUrl, url);
    assert.equal(maggiesCatsEvent.bookNow.href, url);
    assert.equal(maggiesCatsEvent.bookNow.external, true);
    assert.equal(maggiesCatsEvent.bookNow.label, "Book Tickets");
    assert.equal(event.showPage?.finalCta.button, "Book Your Tickets");
    assert.equal(event.showPage?.tickets.button, "Book Your Tickets");
    const page = readFileSync("src/components/events/ChristmasShowPage.tsx", "utf8");
    assert(!page.includes("eventbrite"), "page component holds no URL of its own");
    const source = readFileSync("src/content/events/maggies-cats-christmas-family-show.ts", "utf8");
    assert.equal(source.split("eventbrite.co.uk").length - 1, 1);
});

test("copy is spoiler free, has no dashes and no unconfirmed promises", () => {
    const text = publicText().join("\n");
    const sessionText = (event.sessions ?? []).map((s) => s.title).join("\n");
    const alt = event.image.alt;
    for (const word of [/meow/i, /magic(al)? box/i, /secret/i, /accident/i, /rescue/i, /pantomime/i, /meet.and.greet/i, /grotto/i, /\bfree entry\b/i, /refund/i, /cancel/i, /\bparking\b/i, /wheelchair/i, /\bseat(s|ing|ed)\b/i, /\bhot (drinks|food)\b/i]) {
        assert.doesNotMatch(text, word, `copy must not match ${word}`);
        assert.doesNotMatch(alt + sessionText, word);
    }
    /* The listing date field is the only place a range is written; the page prose never uses a dash. */
    const prose = publicText().filter((line) => line !== event.seo?.title || true).join("\n");
    assert.doesNotMatch(prose, /[–—]/);
});

test("SEO and card text use the supplied wording", () => {
    assert.equal(event.seo?.title, "Maggie’s Cats | Christmas Family Show in London | County Hall");
    assert.equal(
        event.seo?.description,
        "Join Vivi, Kiki and Mika for Maggie’s Cats, a playful outdoor Christmas family show at County Hall on London’s South Bank. Selected dates in December 2026.",
    );
    assert.equal(event.title, "Maggie’s Cats: A Christmas Family Show");
    assert.match(event.excerpt ?? "", /^Three very different cats get ready for Christmas in a playful outdoor family show.$/);
});

test("structured data lists 18 performances with confirmed prices and no end time", () => {
    const data = eventJsonLd(event) as Record<string, unknown>;
    assert.equal(data["@type"], "EventSeries");
    const subs = data.subEvent as Record<string, unknown>[];
    assert.equal(subs.length, 18);
    assert.equal(subs[0].startDate, "2026-12-05T11:00:00+00:00");
    assert.equal(subs[17].startDate, "2026-12-20T15:00:00+00:00");
    for (const sub of subs) {
        assert.equal(sub.endDate, undefined);
        assert.equal(sub.eventStatus, "https://schema.org/EventScheduled");
        assert.equal((sub.offers as unknown[]).length, 5);
    }
    assert.doesNotMatch(JSON.stringify(data), /availability|aggregateRating|InStock/);
});

test("the promotional image is present at 2:1, is the only image, and the card uses a square crop", () => {
    const file = `public${event.image.src}`;
    assert(existsSync(file));
    assert.equal(event.image.width! / event.image.height!, 2);
    assert.match(event.image.src, /maggies-cats-cover.jpg$/);
    assert.equal(JSON.stringify(event).split("/images/").length - 1, 1);
    const card = readFileSync("src/components/events/EventSummaryCard.tsx", "utf8");
    assert.match(card, /aspect-square/);
    assert.doesNotMatch(card, /aspect-video/);
});
