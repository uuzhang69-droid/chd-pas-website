import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { publicSessionsForEvent } from "../src/content/event-sessions";
import { siteContent } from "../src/content/site";
import type { EventCard, EventSession } from "../src/content/types";
import {
    calendarSessionsForEvents,
    eventCalendarSessions,
    sessionsForDates,
    type ScheduleData,
} from "../src/lib/class-calendar/sessions";
import {
    eventWindow,
    isEventEnded,
    londonNowKey,
    publicEvents,
    sortEventsForListing,
} from "../src/lib/events/event-dates";
import { latestSession, sessionsNewestFirst } from "../src/lib/events/series";

const card = (overrides: Partial<EventCard> & { slug: string }): EventCard =>
    ({
        id: overrides.slug,
        title: overrides.slug,
        date: "",
        image: { src: "/x.jpg", alt: "" },
        bookNow: { label: "View Details", href: `/events/${overrides.slug}` },
        ...overrides,
    }) as EventCard;

const session = (
    id: string,
    date: string,
    start?: string,
    end?: string,
): EventSession => ({
    id,
    eventSlug: "series",
    title: id,
    date,
    start,
    end,
    type: "event",
    published: true,
});

const slugs = (events: EventCard[]) => events.map((event) => event.slug);
const NOW = "2026-11-13T10:00";

test("single events sort by start date and time, newest first", () => {
    const events = [
        card({ slug: "c", dateIso: "2026-12-05", time: "10:00–11:00" }),
        card({ slug: "a", dateIso: "2026-11-15", time: "10:00–11:00" }),
        card({ slug: "b", dateIso: "2026-11-20", time: "10:00–11:00" }),
    ];
    assert.deepEqual(slugs(sortEventsForListing(events)), ["c", "b", "a"]);
});

test("same-day events: the later start is listed first, then slug keeps the order stable", () => {
    const events = [
        card({ slug: "afternoon", dateIso: "2026-11-28", time: "15:00–18:00" }),
        card({ slug: "evening", dateIso: "2026-11-28", time: "19:30–20:00" }),
        card({ slug: "z-twin", dateIso: "2026-11-28", time: "09:00–10:00" }),
        card({ slug: "a-twin", dateIso: "2026-11-28", time: "09:00–10:00" }),
    ];
    assert.deepEqual(slugs(sortEventsForListing(events)), [
        "evening",
        "afternoon",
        "a-twin",
        "z-twin",
    ]);
});

test("multi-day events sort by their first day and end on their last", () => {
    const festival = card({
        slug: "festival",
        dateIso: "2026-11-23",
        sessions: [
            session("f2", "2026-11-23", "11:00", "17:00"),
            session("f1", "2026-11-22", "11:00", "17:00"),
        ],
    });
    const window = eventWindow(festival)!;
    assert.equal(window.startDate, "2026-11-22");
    assert.equal(window.endDate, "2026-11-23");
    const single = card({
        slug: "single",
        dateIso: "2026-11-22",
        time: "18:00–19:00",
    });
    // Same first day: the later start (18:00) is listed before the festival (11:00).
    assert.deepEqual(slugs(sortEventsForListing([festival, single], NOW)), [
        "single",
        "festival",
    ]);
    // Still upcoming on day one, ended once the last day has finished.
    assert.equal(isEventEnded(festival, "2026-11-22T20:00"), false);
    assert.equal(isEventEnded(festival, "2026-11-23T17:01"), true);
});

test("the list is one descending order by start, with no upcoming or past split", () => {
    const events = [
        card({ slug: "old", dateIso: "2026-09-01", time: "10:00–11:00" }),
        card({ slug: "recent", dateIso: "2026-11-01", time: "10:00–11:00" }),
        card({ slug: "next", dateIso: "2026-11-14", time: "10:00–11:00" }),
        card({
            slug: "today-later",
            dateIso: "2026-11-13",
            time: "18:00–19:00",
        }),
        card({
            slug: "today-earlier",
            dateIso: "2026-11-13",
            time: "08:00–09:00",
        }),
        card({ slug: "undated" }),
    ];
    assert.deepEqual(slugs(sortEventsForListing(events)), [
        "next",
        "today-later",
        "today-earlier",
        "recent",
        "old",
        "undated",
    ]);
    // The result does not depend on input order.
    assert.deepEqual(
        slugs(sortEventsForListing([...events].reverse())),
        slugs(sortEventsForListing(events)),
    );
});

test("a series sorts by its latest published session, not by an old date", () => {
    const series = card({
        slug: "series",
        isSeries: true,
        dateIso: "2026-01-01",
        sessions: [
            session("s1", "2026-09-25", "13:00"),
            session("s2", "2026-10-23", "13:00"),
        ],
    });
    const other = card({
        slug: "other",
        dateIso: "2026-11-28",
        time: "10:00–11:00",
    });
    const hidden = {
        ...series.sessions![1],
        id: "s3",
        date: "2027-01-01",
        published: false,
    };
    series.sessions = [...series.sessions!, hidden];
    assert.equal(eventWindow(series)!.startDate, "2026-10-23");
    assert.deepEqual(slugs(sortEventsForListing([other, series], NOW)), [
        "other",
        "series",
    ]);
});

test("adding a later series session updates Latest Concert and the list order automatically", () => {
    const series = card({
        slug: "series",
        isSeries: true,
        sessions: [session("s1", "2026-10-23", "13:00")],
    });
    const other = card({
        slug: "other",
        dateIso: "2026-11-28",
        time: "10:00–11:00",
    });
    assert.equal(latestSession(series.sessions)?.id, "s1");
    assert.deepEqual(slugs(sortEventsForListing([series, other])), [
        "other",
        "series",
    ]);
    series.sessions = [
        ...series.sessions!,
        session("s2", "2026-12-18", "13:00", "14:00"),
    ];
    assert.equal(latestSession(series.sessions)?.id, "s2");
    assert.deepEqual(
        sessionsNewestFirst(series.sessions).map((s) => s.id),
        ["s2", "s1"],
    );
    // A December concert now puts the series ahead of a late-November event.
    assert.deepEqual(slugs(sortEventsForListing([series, other])), [
        "series",
        "other",
    ]);
});

test("Lunchtime Concert Series: latest, previous, and automatic list position", () => {
    const concerts = publicSessionsForEvent("lunchtime-concert-series");
    assert.equal(latestSession(concerts)?.title, "The Romantic Heart");
    assert.deepEqual(
        sessionsNewestFirst(concerts).map((s) => [s.date, s.title]),
        [
            ["2026-11-20", "The Romantic Heart"],
            ["2026-10-23", "Fandango! Italian Virtuosity Meets Spanish Dance"],
            ["2026-09-25", "Encounters"],
        ],
    );
    const items = siteContent.pages.events.items;
    const series = items.find((e) => e.slug === "lunchtime-concert-series")!;
    const window = eventWindow(series)!;
    assert.equal(window.startKey, "2026-11-20T13:00");
    assert.equal(window.endKey, "2026-11-20T14:00");
    assert.equal(series.dateIso, "2026-11-20");
    assert.match(series.date, /Latest concert: .*20 November 2026/);
    const order = slugs(sortEventsForListing(items));
    assert.deepEqual(order.slice(0, 4), [
        "within-one-room-stillness-in-motion",
        "an-actors-work-with-an-object",
        "lunchtime-concert-series",
        "halloween-pumpkin-carving-workshop",
    ]);
});

test("home What's On and /events use one collection", () => {
    assert.equal(siteContent.home.events.items, siteContent.pages.events.items);
    const retired = [
        "milonga-ojo-opening-night",
        "ceramics-workshop-with-yasemin",
    ];
    for (const slug of retired)
        assert(!siteContent.pages.events.items.some((e) => e.slug === slug));
    assert.deepEqual(
        slugs(publicEvents([card({ slug: retired[0] }), card({ slug: "ok" })])),
        ["ok"],
    );
});

test("Within One Room and Acting Workshop keep their confirmed times", () => {
    const items = siteContent.pages.events.items;
    const get = (slug: string) =>
        eventWindow(items.find((e) => e.slug === slug)!)!;
    assert.deepEqual(
        [
            get("within-one-room-stillness-in-motion").startKey,
            get("within-one-room-stillness-in-motion").endKey,
        ],
        ["2026-11-28T19:30", "2026-11-28T20:00"],
    );
    assert.deepEqual(
        [
            get("an-actors-work-with-an-object").startKey,
            get("an-actors-work-with-an-object").endKey,
        ],
        ["2026-11-28T15:00", "2026-11-28T18:00"],
    );
});

test("Calendar: no duplicates, same-day events ascending, series only by real session", () => {
    const items = siteContent.pages.events.items;
    const projected = calendarSessionsForEvents(items);
    const ids = projected.map((s) => s.id);
    assert.equal(new Set(ids).size, ids.length);
    const schedule: ScheduleData = JSON.parse(
        readFileSync("public/schedule.json", "utf8"),
    );
    const november = Array.from(
        { length: 30 },
        (_, i) => new Date(Date.UTC(2026, 10, i + 1)),
    );
    const all = sessionsForDates(schedule, november, projected);
    const names = (date: string) =>
        all.filter((s) => s.date === date && s.type !== "class");
    assert.deepEqual(
        names("2026-11-28").map((s) => [s.start, s.end, s.name]),
        [
            ["15:00", "18:00", "Acting Workshop"],
            ["19:30", "20:00", "Within One Room"],
        ],
    );
    assert.equal(all.filter((s) => s.name === "Within One Room").length, 1);
    assert.equal(all.filter((s) => s.name === "Acting Workshop").length, 1);
    // Series: only the confirmed concert appears, under its own title and date.
    const concerts = all.filter((s) =>
        s.href?.includes("lunchtime-concert-series"),
    );
    assert.deepEqual(
        concerts.map((s) => [s.date, s.start, s.end, s.name]),
        [["2026-11-20", "13:00", "14:00", "The Romantic Heart"]],
    );
    assert.equal(
        all.some((s) => s.name === "Lunchtime Concert Series"),
        false,
    );
    // No external booking link reaches the calendar.
    assert(all.filter((s) => s.href).every((s) => !s.bookingUrl));
    // Events data replaced the old hand-kept schedule.json rows.
    assert(
        !schedule.datedClasses?.some(
            (d) => d.name === "Acting Workshop" || d.name === "Within One Room",
        ),
    );
});

test("Calendar entries are created only from confirmed start and end times", () => {
    const noEnd = card({
        slug: "no-end",
        dateIso: "2026-11-28",
        time: "19:30",
        calendar: { name: "No end", style: "X" },
    });
    const noTime = card({
        slug: "no-time",
        dateIso: "2026-11-28",
        calendar: { name: "No time", style: "X" },
    });
    const ok = card({
        slug: "ok",
        dateIso: "2026-11-28",
        time: "19:30–20:00",
        calendar: { name: "Ok", style: "X" },
    });
    assert.deepEqual(
        eventCalendarSessions([noEnd, noTime, ok]).map((s) => s.name),
        ["Ok"],
    );
});

test("events without a start time are not given one", () => {
    const dateOnly = card({ slug: "date-only", dateIso: "2026-11-30" });
    const window = eventWindow(dateOnly)!;
    assert.equal(window.startTime, undefined);
    assert.equal(window.endTime, undefined);
    // Still upcoming for the whole of that London day, over after it.
    assert.equal(isEventEnded(dateOnly, "2026-11-30T23:00"), false);
    assert.equal(isEventEnded(dateOnly, "2026-12-01T00:00"), true);
    const allDay = card({
        slug: "all-day",
        sessions: [{ ...session("a", "2026-09-10"), allDay: true }],
    });
    assert.equal(eventWindow(allDay)!.startTime, undefined);
});

test("London time follows GMT and BST regardless of the machine time zone", () => {
    // Clocks go forward on 29 March 2026 (01:00 UTC) and back on 25 October 2026 (01:00 UTC).
    assert.equal(
        londonNowKey(new Date("2026-03-29T00:59:00Z")),
        "2026-03-29T00:59",
    );
    assert.equal(
        londonNowKey(new Date("2026-03-29T01:00:00Z")),
        "2026-03-29T02:00",
    );
    assert.equal(
        londonNowKey(new Date("2026-10-25T00:30:00Z")),
        "2026-10-25T01:30",
    );
    assert.equal(
        londonNowKey(new Date("2026-10-25T01:30:00Z")),
        "2026-10-25T01:30",
    );
    assert.equal(
        londonNowKey(new Date("2026-12-01T09:00:00Z")),
        "2026-12-01T09:00",
    );
    // 22:30 UTC in July is 23:30 in London, so a 23:00 finish has already ended.
    const summer = card({
        slug: "summer",
        dateIso: "2026-07-01",
        time: "21:00–23:00",
    });
    assert.equal(isEventEnded(summer, new Date("2026-07-01T22:30:00Z")), true);
    assert.equal(isEventEnded(summer, new Date("2026-07-01T21:30:00Z")), false);
    // In winter the same instants are not shifted.
    const winter = card({
        slug: "winter",
        dateIso: "2026-12-01",
        time: "21:00–23:00",
    });
    assert.equal(isEventEnded(winter, new Date("2026-12-01T22:30:00Z")), false);
    assert.equal(isEventEnded(winter, new Date("2026-12-01T23:01:00Z")), true);
});

test("weekly classes and cancelled dates are untouched by Events data", () => {
    const schedule: ScheduleData = {
        classes: [
            {
                id: "w1",
                day: 4,
                start: "18:00",
                end: "19:00",
                name: "Weekly",
                style: "Yoga",
                startDate: "2026-11-01",
                endDate: "2026-11-30",
                cancelledDates: ["2026-11-20"],
            },
        ],
        datedClasses: [],
    };
    const fridays = [
        "2026-11-06",
        "2026-11-13",
        "2026-11-20",
        "2026-11-27",
    ].map((d) => new Date(`${d}T00:00:00Z`));
    const projected = calendarSessionsForEvents(siteContent.pages.events.items);
    const result = sessionsForDates(schedule, fridays, projected).filter(
        (s) => s.name === "Weekly",
    );
    assert.deepEqual(
        result.map((s) => s.date),
        ["2026-11-06", "2026-11-13", "2026-11-27"],
    );
});

test("Calendar event cards carry one official title plus a type line, with no external booking", () => {
    const projected = calendarSessionsForEvents(siteContent.pages.events.items);
    const get = (id: string) => projected.find((s) => s.id === id);
    const acting = get("event-2026-an-actors-work-with-an-object")!;
    assert.equal(acting.title, "An Actor's Work with an Object");
    assert.equal(acting.label, "Acting Workshop");
    assert.equal(acting.teacher, "Oleg Mirochnikov");
    const within = get("event-2026-within-one-room-stillness-in-motion")!;
    assert.equal(within.title, "Within One Room · Stillness in Motion");
    assert.equal(within.label, "Art & Performance");
    assert.equal(within.admission, "Free admission");
    assert.equal(within.teacher, undefined);
    // A concert is titled by its own name; the series name appears once, as its label.
    const romantic = get("concert-2026-11-20")!;
    assert.equal(romantic.name, "The Romantic Heart");
    assert.equal(romantic.title, undefined);
    assert.equal(romantic.label, "Lunchtime Concert Series");
    for (const item of [acting, within, romantic]) {
        assert.match(item.href!, /^\/events\//);
        assert.equal("bookingUrl" in item, false);
    }
});

test("booking buttons are driven by event data: Within One Room has its official Eventbrite page, and no event invents a link", () => {
    const events = siteContent.pages.events.items as readonly EventCard[];
    const within = events.find((event) => event.slug === "within-one-room-stillness-in-motion");
    assert.ok(within, "the event exists");
    assert.equal(within.bookingPending, false);
    assert.deepEqual(within.bookNow, {
        label: "Book Now",
        href: "https://www.eventbrite.co.uk/e/within-one-room-stillness-in-motion-tickets-2004916771033",
        variant: "primary",
        external: true,
    });
    // An event that is not pending must point somewhere real; a pending one must not carry an external booking link.
    for (const event of events) {
        if (event.bookingPending) assert.ok(!event.bookNow.external, `${event.slug} is pending but has an external link`);
    }
});
