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
    assert.equal(event.seo?.title, "Maggie’s Cats Christmas Family Show 2026 | London");
    assert.equal(
        event.seo?.description,
        "Join Maggie’s Cats for an outdoor Christmas family show at County Hall, London. Performances on 5, 6, 12, 13, 19 and 20 December 2026.",
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

test("exactly three booking buttons: hero, after the ticket prices, and the final section", () => {
    const page = readFileSync("src/components/events/ChristmasShowPage.tsx", "utf8");
    assert.equal(page.split("{...book}").length - 1, 3);
    const hero = page.indexOf("{...book}");
    const tickets = page.indexOf("{...book}", hero + 1);
    const final = page.indexOf("{...book}", tickets + 1);
    assert(page.indexOf('id="tickets"') < tickets && tickets < page.indexOf('id="meet-the-cast"'));
    assert(page.indexOf('id="final-cta"') < final);
    assert.equal(event.showPage?.tickets.group.contactHref, "/contact?subject=events");
});

test("sections follow the agreed order and the page has one h1", () => {
    const page = readFileSync("src/components/events/ChristmasShowPage.tsx", "utf8");
    const ids = ["about-the-show", "meet-the-cats", "dates-and-times", "tickets", "meet-the-cast", "venue", "how-to-find-us", "before-you-visit", "final-cta"];
    const positions = ids.map((id) => page.indexOf('<Section id="' + id + '"'));
    assert(positions.every((p) => p > 0));
    assert.deepEqual([...positions].sort((a, b) => a - b), positions);
    assert.equal(page.split("<h1").length - 1, 1);
});

test("cast: four credited performers, no Swing, no contact details, optional headshot", () => {
    const cast = event.showPage!.cast;
    assert.deepEqual(
        cast.members.map((m) => [m.name, m.role]),
        [
            ["Hannah Spiteri", "Vivi Cat"],
            ["Mae Meadows", "Kiki Cat"],
            ["Ayana Mon", "Mika Cat"],
            ["Mark Janicello", "Santa Claus"],
        ],
    );
    assert.equal(cast.creativeTeam.name, "Roarrr Theatre");
    const json = JSON.stringify(cast);
    assert.doesNotMatch(json, /swing|@|she\/her|he\/him|they\/them/i);
    for (const member of cast.members) assert.equal(member.image, undefined);
    const page = readFileSync("src/components/events/ChristmasShowPage.tsx", "utf8");
    assert.match(page, /aspect-\[3\/4\]/);
    assert.match(page, /Photo coming soon/);
    assert.match(page, /grid-cols-2[^"]*lg:grid-cols-4/);
});

test("directions use the supplied wording and make no accessibility claim", () => {
    const text = event.showPage!.directions.paragraphs.join(" ");
    assert.match(text, /Queen’s Walk/);
    assert.match(text, /Peacock Restaurant/);
    assert.match(text, /London Dungeon/);
    assert.match(text, /Shrek’s Adventure/);
    assert.doesNotMatch(JSON.stringify(event.showPage), /step-free|accessible|wheelchair|lift/i);
});

test("structured data names the venue address and credited cast, with no end time", () => {
    const data = eventJsonLd(event) as Record<string, unknown>;
    const first = (data.subEvent as Record<string, unknown>[])[0];
    assert.deepEqual(first.location, {
        "@type": "Place",
        name: "County Hall Members’ Terrace",
        address: "County Hall, South Bank, London",
    });
    assert.equal((first.performer as unknown[]).length, 4);
    assert.equal(first.endDate, undefined);
    assert.equal(first.startDate, "2026-12-05T11:00:00+00:00");
});

test("no emoji anywhere on the page, and cat name and role are separate elements", () => {
    const emoji = /\p{Extended_Pictographic}/u;
    assert.doesNotMatch(JSON.stringify(event), emoji);
    const page = readFileSync("src/components/events/ChristmasShowPage.tsx", "utf8");
    assert.doesNotMatch(page, emoji);
    assert.match(page, /<h3 className="text-h3 text-charcoal">\{cat\.name\}<\/h3>\s*<p className="text-overline[^"]*">\{cat\.role\}<\/p>/);
});

test("all six dates are listed with the daily times, and ticket rows are description left, price right", () => {
    const page = readFileSync("src/components/events/ChristmasShowPage.tsx", "utf8");
    assert.match(page, /dateLabel\(date\)/);
    assert.deepEqual(event.showPage?.schedule.times, ["11:00 AM", "1:00 PM", "3:00 PM"]);
    assert.equal(event.showPage?.schedule.datesHeading, "Dates");
    assert.equal(page.split("flex items-baseline justify-between").length - 1, 2);
    assert.match(page, /sm:grid-cols-2 lg:grid-cols-3/);
    assert.doesNotMatch(page, /<ol/);
});

test("approved introduction, hero alt text and water wording are used exactly", () => {
    const about = event.showPage!.about.paragraphs;
    assert.equal(about.length, 5);
    assert.equal(about[0], "Christmas preparations are underway, and Vivi, Kiki and Mika are determined to make this year’s celebrations something special.");
    assert.equal(about[1], "Vivi has everything under control. Or at least, that’s the plan. Kiki has plenty of ideas, although whether they’re particularly helpful is another question entirely. And Mika is just happy to be spending Christmas with her friends.");
    assert.equal(about[3], "Maggie’s Cats is a playful outdoor Christmas family show filled with humour, friendship and moments of tenderness.");
    assert.equal(event.image.alt, "Illustrated Christmas scene with three cat characters and Santa beside a decorated tree, overlooking the Thames and Big Ben.");
    const water = event.showPage!.visit.items.find((item) => item.title === "Bring Your Own Water")!;
    assert.deepEqual(water.paragraphs, ["Please bring your own drinking water. You’re also welcome to bring refreshments, subject to venue rules."]);
    assert.doesNotMatch(JSON.stringify(event), /localhost/);
});

test("public copy uses curly apostrophes, and the contact sentence links to the info mailbox", () => {
    const strings: string[] = [];
    const walk = (value: unknown, key = "") => {
        if (typeof value === "string") {
            if (!["src", "href", "id", "slug", "dateIso", "contactHref", "variant", "email"].includes(key)) strings.push(value);
        } else if (Array.isArray(value)) value.forEach((item) => walk(item, key));
        else if (value && typeof value === "object")
            for (const [k, v] of Object.entries(value)) if (k !== "sessions") walk(v, k);
    };
    walk({ title: event.seo?.title, description: event.seo?.description, showPage: event.showPage, excerpt: event.excerpt, alt: event.image.alt });
    for (const text of strings) assert.doesNotMatch(text, /'/, `straight apostrophe in: ${text}`);
    const contact = event.showPage!.visit.contact!;
    assert.equal(contact.email, "info@countyhalldancecentre.com");
    assert.equal(contact.before + contact.email + contact.after, "Have a question about the show? Please email info@countyhalldancecentre.com and we’ll be happy to help.");
    const page = readFileSync("src/components/events/ChristmasShowPage.tsx", "utf8");
    assert.match(page, /href=\{`mailto:\$\{show\.visit\.contact\.email\}`\}/);
    assert.doesNotMatch(JSON.stringify(event.showPage), /refund|cancel|seating|toilet|accessib|duration|age restriction/i);
});
