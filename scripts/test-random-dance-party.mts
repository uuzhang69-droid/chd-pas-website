import assert from "node:assert/strict";
import { existsSync, readFileSync, statSync } from "node:fs";
import { test } from "node:test";
import { siteContent } from "../src/content/site";
import {
    RANDOM_DANCE_PARTY_BOOKING_URL,
    randomDancePartyEvent,
} from "../src/content/events/random-dance-party";
import { calendarSessionsForEvents } from "../src/lib/class-calendar/sessions";
import { eventWindow, isEventEnded, sortEventsForListing } from "../src/lib/events/event-dates";
import { eventJsonLd } from "../src/lib/seo/structured-data";

const items = siteContent.pages.events.items;
const event = items.find((item) => item.slug === "random-dance-party")!;

test("Random Dance Party is listed exactly once, as an event, with its own page and the supplied cover", () => {
    assert(event);
    assert.equal(items.filter((item) => item.slug === "random-dance-party").length, 1);
    assert.equal(event.title, "Random Dance Party");
    assert.equal(event.subtitle, "K-pop, Hip-hop, Jazz & Urban");
    assert.equal(event.schemaName, "Random Dance Party: K-pop, Hip-hop, Jazz & Urban");
    assert.equal(event.listingCategory, "event");
    assert.equal(event.date, "Sunday 29 November 2026, 2:00pm to 5:00pm");
    assert.equal(event.image.src, "/images/events/2026/random-dance-party/random-dance-party-cover.jpg");
    assert(existsSync(`public${event.image.src}`));
    assert.match(event.image.alt, /dancers/);
    assert.equal(event.timeLabel, "2:00 PM to 5:00 PM");
});

test("it sits between the 28 November events and Maggie’s Cats, and the home page uses the same list", () => {
    const order = sortEventsForListing(items).map((item) => item.slug);
    const at = order.indexOf("random-dance-party");
    assert(order.indexOf("maggies-cats-christmas-family-show") < at);
    assert(at < order.indexOf("within-one-room-stillness-in-motion"));
    assert.equal(siteContent.home.events.items, siteContent.pages.events.items);
});

test("it runs 14:00 to 17:00 London time on 29 November and is still upcoming until 17:00", () => {
    const window = eventWindow(event)!;
    assert.deepEqual([window.startKey, window.endKey], ["2026-11-29T14:00", "2026-11-29T17:00"]);
    assert.equal(isEventEnded(event, "2026-11-29T00:01"), false);
    assert.equal(isEventEnded(event, "2026-11-29T14:30"), false);
    assert.equal(isEventEnded(event, "2026-11-29T16:59"), false);
    assert.equal(isEventEnded(event, "2026-11-29T17:01"), true);
});

test("the calendar shows one entry on 29 November, 14:00 to 17:00, linking to the event page", () => {
    const entries = calendarSessionsForEvents(items).filter((entry) => entry.id.includes("random-dance-party"));
    assert.equal(entries.length, 1);
    const [entry] = entries;
    assert.equal(entry.date, "2026-11-29");
    assert.equal(entry.start, "14:00");
    assert.equal(entry.end, "17:00");
    assert.equal(entry.href, "/events/random-dance-party");
    assert.equal(entry.name, "Random Dance Party");
    assert.equal(entry.admission, "Free admission");
});

test("the Eventbrite URL is defined once and used by the booking button", () => {
    const url = "https://www.eventbrite.co.uk/e/random-dance-party-k-pop-hip-hop-jazz-urban-tickets-2005306814664";
    assert.equal(RANDOM_DANCE_PARTY_BOOKING_URL, url);
    assert.equal(randomDancePartyEvent.bookingUrl, url);
    assert.equal(randomDancePartyEvent.bookNow.href, url);
    assert.equal(randomDancePartyEvent.bookNow.external, true);
    assert.equal(readFileSync("src/content/events/random-dance-party.ts", "utf8").split("eventbrite.co.uk").length - 1, 1);
});

test("structured data: start and end in London time, free admission, no invented details", () => {
    const data = eventJsonLd(event) as Record<string, unknown>;
    assert.equal(data["@type"], "Event");
    assert.equal(data.name, "Random Dance Party: K-pop, Hip-hop, Jazz & Urban");
    assert.deepEqual(data.location, {
        "@type": "Place",
        name: "County Hall Dance & Performing Arts School",
        address: {
            "@type": "PostalAddress",
            streetAddress: "2nd Floor, Riverside Building, Belvedere Road",
            addressLocality: "London",
            postalCode: "SE1 7PB",
            addressCountry: "GB",
        },
    });
    assert.equal(data.startDate, "2026-11-29T14:00:00+00:00");
    assert.equal(data.endDate, "2026-11-29T17:00:00+00:00");
    const offers = data.offers as Record<string, unknown>;
    assert.equal(offers.price, "0");
    assert.equal(offers.priceCurrency, "GBP");
    assert.equal(offers.url, RANDOM_DANCE_PARTY_BOOKING_URL);
    assert.doesNotMatch(JSON.stringify(data), /availability|performer|aggregateRating/);
});

test("copy has no dashes in prose, no emoji and no unconfirmed promises; SEO text is set", () => {
    const prose = [event.subtitle, event.excerpt, ...(event.description ?? []), event.seo?.description].join("\n");
    const body = (event.description ?? []).join("\n");
    assert.doesNotMatch(body, /29 November|Belvedere|Free admission|free afternoon/i);
    assert.doesNotMatch(body, /About the Event/);
    assert.doesNotMatch(prose, /[–—]/);
    assert.doesNotMatch(prose, /\p{Extended_Pictographic}/u);
    assert.doesNotMatch(prose, /\b(judges?|age|aged|under 1\d|over 1\d|wheelchair|accessible|refund|cancel|£\d)/i);
    assert.equal(event.seo!.title, "Random Dance Party: K-pop, Hip-hop, Jazz & Urban in London");
    assert(event.seo!.description.length <= 160);
});

test("the page uses the final approved copy: bold openings, two Good to know items, prizes only for battle winners", () => {
    assert.deepEqual(event.description, [
        "A Sunday afternoon of dancing, music and meeting new people at County Hall.",
        "# Love the song? Join the dance.",
        "Into K-pop, hip-hop, jazz or urban dance? Come and spend Sunday afternoon with us!",
        "**Hear a song you love?** Come and join in! Follow the original choreography, mix up different styles or make up your own moves. It’s all about enjoying the music and dancing your way.",
        "**Not a dancer? No problem!** You’re just as welcome to come along, enjoy the music and soak up the atmosphere. And if you feel like dancing along without joining the main group, go for it! There’s no pressure to perform or take part in a battle.",
        "**Fancy a friendly dance battle?** Give it a go! There’ll be prizes for the winners.",
        "Come with friends or on your own, stay for a little while or spend the whole afternoon with us. Enjoy the music, have fun and maybe make a few new friends along the way.",
        "# Good to know",
        "**Walk-ins welcome:** You can just turn up, although we’d recommend booking a free ticket in advance as space is limited.",
        "**Bring a drink:** Don’t forget to bring some water or something to drink, especially if you’re planning to dance!",
    ]);
    const body = (event.description ?? []).join("\n");
    /* Bold markers come in pairs and wrap exactly the three question openings and the two Good to know labels. */
    assert.deepEqual(body.match(/\*\*[^*]+\*\*/g), [
        "**Hear a song you love?**",
        "**Not a dancer? No problem!**",
        "**Fancy a friendly dance battle?**",
        "**Walk-ins welcome:**",
        "**Bring a drink:**",
    ]);
    assert.equal(body.split("**").length % 2, 1);
    assert.doesNotMatch(body, /voucher|class(es)? (pass|voucher)|complimentary/i);
    assert.doesNotMatch(body, /everyone (gets|receives|wins)|prizes for (all|everyone)/i);
    assert.doesNotMatch(body, /unforgettable|electrifying|something for everyone|dance the day away|lasting memories/i);
    assert.equal((body.match(/prizes?/gi) ?? []).length, 1);
    /* Casual, creative participation only: no illustrative style mixes and no battle rules or judging. */
    assert.doesNotMatch(body, /ballet|contemporary|tango|salsa|rules?\b|judg|criteria|unrestricted|freestyle battle/i);
    /* Free admission and the times are shown above; the Good to know items do not repeat them, and there is no separate stay-as-long-as-you-like item. */
    assert.doesNotMatch(body, /Admission is free|2:00 to 5:00|full three hours|Stay as long as you like/i);
    const lines = event.description ?? [];
    assert.equal(lines.filter((line) => line === "# Good to know").length, 1);
    assert.equal(lines.length - lines.indexOf("# Good to know") - 1, 2);
    /* The old confirmation switch is gone. */
    const source = readFileSync("src/content/events/random-dance-party.ts", "utf8");
    assert.doesNotMatch(source, /ATTENDANCE_DETAILS_CONFIRMED|randomDancePartyDescription/);
});

test("the cover is the supplied portrait photograph, declared at its real size, and the page renders bold markers", async () => {
    const { withImageSizes } = await import("../src/lib/events/image-dimensions");
    const [image] = withImageSizes([{ ...event.image, width: undefined, height: undefined }]);
    assert.deepEqual([image.width, image.height], [1055, 1491]);
    assert.deepEqual([event.image.width, event.image.height], [1055, 1491]);
    assert(statSync(`public${event.image.src}`).size < 400_000);
    const page = readFileSync("src/app/events/[slug]/page.tsx", "utf8");
    assert.match(page, /withEmphasis\(paragraph\)/);
});

test("free admission is stated once: the tag under the subtitle, with no separate admission field", () => {
    assert.equal(event.freeAdmission, true);
    assert.equal(event.admission, undefined);
    const page = readFileSync("src/app/events/[slug]/page.tsx", "utf8");
    assert.match(page, /event\.freeAdmission \? undefined : event\.admission/);
});
