import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import {
    canBookSession,
    sessionStatus,
} from "../src/lib/class-calendar/booking-status";
import { test } from "node:test";
import {
    eventSessions,
    publicSessionsForEvent,
} from "../src/content/event-sessions";
import { siteContent } from "../src/content/site";
import { resolveVenueId, SCHOOL_VENUE_ID } from "../src/content/venues";
import type { EventCard, EventSession } from "../src/content/types";
import {
    filterSessions,
    schoolEventSessions,
    sessionsForDates,
    type ScheduleData,
} from "../src/lib/class-calendar/sessions";
const schedule: ScheduleData = JSON.parse(
    readFileSync("public/schedule.json", "utf8"),
);
const projected = schoolEventSessions(siteContent.pages.events.items);
const dates = (year: number, month: number) =>
    Array.from(
        { length: new Date(Date.UTC(year, month, 0)).getUTCDate() },
        (_, i) => new Date(Date.UTC(year, month - 1, i + 1)),
    );
const fixture = (sessions: EventSession[]) =>
    [{ slug: "fixture", sessions }] as EventCard[];
const base: EventSession = {
    id: "fixture",
    eventSlug: "fixture",
    title: "Example",
    date: "2026-10-24",
    start: "10:00",
    end: "11:00",
    venueId: SCHOOL_VENUE_ID,
    type: "event",
    published: true,
};

test("festival page retains nine sessions, calendar includes exactly the three school sessions", () => {
    const programme = publicSessionsForEvent("four-seasons-festival");
    assert.equal(programme.length, 9);
    const festival = projected.filter((x) =>
        x.href?.includes("four-seasons-festival"),
    );
    assert.deepEqual(
        festival.map((x) => [x.date, x.start, x.end]),
        [
            ["2026-10-24", "11:00", "12:00"],
            ["2026-10-24", "14:00", "15:30"],
            ["2026-10-24", "16:00", "17:30"],
        ],
    );
    assert.equal(
        festival.find((x) => x.name === "Autumn Flow and Sound")?.venueBooking,
        false,
    );
    const day = sessionsForDates(schedule, [new Date("2026-10-24")], projected);
    assert.equal(
        day.filter((x) => x.href?.includes("four-seasons-festival")).length,
        3,
    );
});
test("external venue events and incomplete concerts do not enter timetable", () => {
    for (const slug of ["lunchtime-concert-series"])
        assert(!projected.some((x) => x.href?.includes(slug)));
    const concerts = publicSessionsForEvent("lunchtime-concert-series");
    assert.equal(
        concerts.find((x) => x.date === "2026-09-25")?.venueId,
        "county-hall-atrium",
    );
    assert.equal(
        concerts.find((x) => x.date === "2026-10-23")?.venueId,
        SCHOOL_VENUE_ID,
    );
    assert(concerts.every((x) => !x.end));
});
test("November-only classes and workshops do not leak into December", () => {
    const november = sessionsForDates(schedule, dates(2026, 11), projected);
    assert.equal(
        november.filter((x) => x.name === "Yoga (Inside Flow)").length,
        4,
    );
    assert.equal(november.filter((x) => x.type === "workshop").length, 3);
    assert.equal(november.length, 39);
    assert(
        !sessionsForDates(schedule, dates(2026, 12), projected).some(
            (x) =>
                x.name.includes("Workshop") || x.name.includes("Inside Flow"),
        ),
    );
});
test("legacy weekly tuples, date bounds and both cancellation forms remain supported", () => {
    const data: ScheduleData = {
        classes: [
            [0, "09:00", "10:00", "Legacy", "Yoga"],
            {
                day: 0,
                start: "11:00",
                end: "12:00",
                name: "Cancelled",
                style: "Yoga",
                cancelledDates: ["2026-11-02"],
            },
        ],
        datedClasses: [
            {
                date: "2026-11-02",
                start: "13:00",
                end: "14:00",
                name: "Cancelled dated",
                style: "Yoga",
                cancelled: true,
            },
        ],
    };
    assert.deepEqual(
        sessionsForDates(data, [new Date("2026-11-02")]).map((x) => x.name),
        ["Legacy"],
    );
});
test("publication, venue and complete valid timings are required", () => {
    for (const patch of [
        { published: false },
        { published: undefined },
        { cancelled: true },
        { date: undefined },
        { date: "2026-02-30" },
        { end: undefined },
        { end: "09:00" },
        { start: "25:00" },
        { venueId: undefined },
        { venueId: "Unknown Dance Centre" },
        { venueId: "county-hall" },
    ])
        assert.equal(
            schoolEventSessions(fixture([{ ...base, ...patch }])).length,
            0,
        );
});
test("venue aliases are exact and never match the whole building", () => {
    assert.equal(resolveVenueId("County Hall Dance Centre"), SCHOOL_VENUE_ID);
    assert.equal(resolveVenueId("Atrium, County Hall"), "county-hall-atrium");
    assert.equal(resolveVenueId("County Hall"), "county-hall");
    assert.equal(resolveVenueId("near the Dance Centre"), undefined);
});
test("Event plus Venue Booking filters do not duplicate the session", () => {
    const result = schoolEventSessions(
        fixture([
            { ...base, venueBooking: true, style: "Yoga" },
            { ...base, venueBooking: true, style: "Yoga" },
        ]),
    );
    assert.equal(result.length, 1);
    for (const type of ["all", "event", "venue-booking"] as const)
        assert.equal(filterSessions(result, type, "5", "Yoga").length, 1);
    assert.equal(filterSessions(result, "class", "all", "all").length, 0);
    assert.equal(filterSessions(result, "all", "0", "Yoga").length, 0);
});
test("private bookings are anonymous and have no link or booking action", () => {
    const result = schoolEventSessions(
        [],
        [
            {
                ...base,
                private: true,
                title: "Private customer name",
                description: ["Private contact"],
                venueBooking: true,
                setupStart: "09:30",
                teardownEnd: "11:30",
            },
        ],
    );
    assert.equal(result[0].name, "Private booking");
    assert.equal(result[0].href, undefined);
    assert(!JSON.stringify(result).includes("Private customer"));
    assert(!JSON.stringify(result).includes("Private contact"));
    assert.equal(result[0].occupancyStart, "09:30");
    assert.equal(result[0].occupancyEnd, "11:30");
});
test("unpublished and private programme entries never enter generated client copy", () => {
    eventSessions.push(
        { ...base, private: true },
        { ...base, id: "draft", published: false },
    );
    try {
        assert.equal(publicSessionsForEvent("fixture").length, 0);
    } finally {
        eventSessions.splice(-2);
    }
});
test("event links target the parent page and stable session anchor", () => {
    for (const item of projected)
        assert.match(item.href!, /^\/events\/[^/]+#session-/);
    const schoolConcert = {
        ...base,
        eventSlug: "lunchtime-concert-series",
        end: "14:00",
    };
    assert.equal(
        schoolEventSessions([
            { slug: schoolConcert.eventSlug, sessions: [schoolConcert] },
        ] as EventCard[])[0].href,
        "/events/lunchtime-concert-series#session-fixture",
    );
});

test("organising relationships never override venue or timing requirements", () => {
    const organised = {
        ...base,
        venueId: "members-terrace",
        organiser: "County Hall Dance & Performing Arts School",
        relationship: "organised" as const,
        venueBooking: true,
    };
    assert.equal(schoolEventSessions(fixture([organised])).length, 0);
    const opening = publicSessionsForEvent(
        "county-hall-dance-centre-opening-day",
    )[0];
    assert.equal(opening.date, "2026-09-10");
    assert.equal(opening.venueId, SCHOOL_VENUE_ID);
    assert.equal(opening.allDay, true);
    const day = projected.find((x) => x.href?.includes("opening-day"));
    assert.equal(day?.allDay, true);
    assert.equal(day?.start, "");
    assert.equal(day?.end, "");
});

test("historical schedule is bounded: no regular classes before Trial Week", () => {
    assert.equal(sessionsForDates(schedule, dates(2026, 8)).length, 0);
    assert.equal(
        sessionsForDates(schedule, dates(2026, 9).slice(0, 14)).length,
        0,
    );
    const trial = sessionsForDates(schedule, dates(2026, 9).slice(13, 20));
    assert.equal(trial.length, 13);
    assert.deepEqual(
        trial.map((x) => [x.date.slice(-2), x.start, x.end, x.name]),
        [
            ["15", "12:30", "13:15", "Sound Healing with Yoga"],
            ["15", "18:30", "19:30", "Tai Chi"],
            ["15", "19:30", "20:30", "Contemporary Dance"],
            ["16", "18:30", "19:20", "Yoga (Basic Flow)"],
            ["16", "19:30", "20:30", "Tango Beginner"],
            ["16", "20:30", "21:30", "Tango Advanced"],
            ["17", "18:30", "20:00", "Chinese Dance Class 1"],
            ["17", "20:00", "21:30", "Chinese Dance Class 2"],
            ["18", "18:30", "19:20", "Yoga (Flow Yoga)"],
            ["18", "19:30", "20:30", "Broadway Jazz"],
            ["20", "10:30", "12:00", "Yoga (Ground Exploration)"],
            ["20", "15:00", "16:00", "Tango Beginner"],
            ["20", "16:00", "19:00", "Tango Milonga"],
        ],
    );
    const transition = sessionsForDates(schedule, dates(2026, 9).slice(20));
    assert.deepEqual(
        transition.map((x) => [x.date, x.start, x.end]),
        [
            ["2026-09-24", "19:30", "20:00"],
            ["2026-09-24", "20:00", "21:30"],
        ],
    );
});

test("October and November use distinct versions without extending into December", () => {
    const october = sessionsForDates(schedule, dates(2026, 10));
    assert.equal(october.length, 54);
    assert.equal(
        october.filter((x) => x.name === "Tango Intermediate").length,
        4,
    );
    assert.equal(
        october.filter((x) => x.name === "Yoga (Therapeutic Yoga)").length,
        5,
    );
    assert(
        october
            .filter((x) => x.name === "Chinese Dance Class 1")
            .every((x) => x.start === "18:30" && x.end === "20:00"),
    );
    assert(
        october
            .filter((x) => x.name === "Yoga (Gentle Flow)")
            .every((x) => x.end === "19:20"),
    );
    const november = sessionsForDates(schedule, dates(2026, 11));
    assert.equal(november.length, 39);
    assert(
        november
            .filter((x) => x.name === "Yoga (Gentle Flow)")
            .every((x) => x.end === "19:30"),
    );
    assert.equal(sessionsForDates(schedule, dates(2026, 12)).length, 0);
    for (const month of [9, 10, 11]) {
        const rows = sessionsForDates(schedule, dates(2026, month));
        assert.equal(
            new Set(rows.map((x) => `${x.date}|${x.start}|${x.end}|${x.name}`))
                .size,
            rows.length,
        );
    }
});

test("London booking boundaries include exact start/end, summer time and winter time", () => {
    for (const [date, offset] of [
        ["2026-09-15", 1],
        ["2026-11-03", 0],
    ] as const) {
        const item = { date, start: "18:30", end: "19:30" };
        const instant = (hour: number, minute: number, second = 0) =>
            new Date(
                `${date}T${String(hour - offset).padStart(2, "0")}:${minute}:${String(second).padStart(2, "0")}Z`,
            );
        assert.equal(sessionStatus(item, instant(18, 29, 59)), "upcoming");
        assert(canBookSession(item, instant(18, 29, 59)));
        assert.equal(sessionStatus(item, instant(18, 30)), "ongoing");
        assert(!canBookSession(item, instant(18, 30)));
        assert.equal(sessionStatus(item, instant(19, 29, 59)), "ongoing");
        assert.equal(sessionStatus(item, instant(19, 30)), "ended");
        assert(!canBookSession(item, instant(19, 30)));
    }
    assert.equal(
        sessionStatus(
            { date: "2026-09-15", start: "", end: "" },
            new Date("2026-11-02T12:00Z"),
        ),
        "ended",
    );
    assert(
        !canBookSession(
            { date: "2026-11-03", start: "", end: "" },
            new Date("2026-11-02T12:00Z"),
        ),
    );
    assert.equal(
        sessionStatus(
            { date: "2026-10-25", start: "10:00", end: "11:00" },
            new Date("2026-10-25T11:00Z"),
        ),
        "ended",
    );
});

test("retired standalone events retain raw records but have no public entry or calendar links", () => {
    for (const slug of [
        "milonga-ojo-opening-night",
        "ceramics-workshop-with-yasemin",
    ]) {
        assert(eventSessions.some((x) => x.eventSlug === slug));
        assert(!siteContent.pages.events.items.some((x) => x.slug === slug));
        assert(!JSON.stringify(siteContent).includes(`/events/${slug}`));
        assert(!projected.some((x) => x.href?.includes(slug)));
    }
    assert(siteContent.pages.classes.styles.some((x) => x.slug === "tango"));
    assert(
        siteContent.pages.events.categories.some((x) => x.slug === "milonga"),
    );
});

test("explicit calendar entries retain verified historical times without exposing private or cancelled sessions", () => {
    const memory = projected.filter((x) => x.href?.includes("memory-of-china"));
    assert.deepEqual(
        memory.map((x) => [x.date, x.start, x.end]),
        [
            ["2026-10-03", "12:00", "17:30"],
            ["2026-10-04", "12:00", "17:30"],
        ],
    );
    assert(
        memory.every(
            (x) => x.location === "Members’ Terrace" && !x.venueBooking,
        ),
    );
    const dance = projected.find((x) => x.href?.includes("dance-meets-arts"));
    assert.deepEqual(
        [dance?.date, dance?.start, dance?.end, dance?.location],
        ["2026-08-08", "19:00", "20:30", "Members’ Terrace"],
    );
    for (const patch of [
        { private: true },
        { published: false },
        { cancelled: true },
        { calendarVisible: false },
        { venueId: "unknown" },
    ]) {
        assert.equal(
            schoolEventSessions(
                fixture([
                    {
                        ...base,
                        venueId: "members-terrace",
                        calendarVisible: true,
                        ...patch,
                    },
                ]),
            ).length,
            0,
        );
    }
    assert.equal(
        sessionsForDates(schedule, dates(2026, 9), projected).length,
        16,
    );
    assert.equal(
        sessionsForDates(schedule, dates(2026, 10), projected).length,
        60,
    );
});

test("November workshop changes are one-off, complete and unique", () => {
    const november = sessionsForDates(
        schedule,
        dates(2026, 11),
        projected,
    ).filter((x) => x.type === "workshop");
    assert.deepEqual(
        november.map((x) => [x.date, x.start, x.end, x.name]),
        [
            ["2026-11-14", "15:00", "20:00", "Tango Workshop"],
            ["2026-11-21", "15:00", "20:00", "Tango Workshop"],
            ["2026-11-28", "14:45", "17:45", "Performance Workshop"],
        ],
    );
});

test("published timed lessons and event sessions have no overlapping school intervals", () => {
    for (const month of [9, 10, 11, 12]) {
        const rows = sessionsForDates(
            schedule,
            dates(2026, month),
            projected,
        ).filter(
            (x) =>
                !x.allDay &&
                x.start &&
                x.end &&
                (!x.location ||
                    x.location ===
                        "County Hall Dance & Performing Arts School"),
        );
        for (let i = 0; i < rows.length; i++)
            for (let j = i + 1; j < rows.length; j++) {
                const a = rows[i],
                    b = rows[j];
                if (a.date !== b.date) continue;
                assert(
                    !(a.start < b.end && b.start < a.end),
                    `${a.date}: ${a.name} overlaps ${b.name}`,
                );
            }
    }
});
