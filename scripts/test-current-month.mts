import assert from "node:assert/strict";
import { test } from "node:test";
import { ServerClock } from "../src/lib/class-calendar/server-clock";
import {
    currentMonthDates,
    londonDateKey,
} from "../src/lib/class-calendar/current-month";
import { GET } from "../src/app/api/time/route";
import { getAllEventRouteSlugs, getEventBySlug } from "../src/content/helpers";

test("London calendar crosses BST midnight and month/year boundaries without a device clock", () => {
    for (const [before, after, expected] of [
        ["2026-06-30T22:59:59Z", "2026-06-30T23:00:00Z", "2026-07-01"],
        ["2026-10-31T23:59:59Z", "2026-11-01T00:00:00Z", "2026-11-01"],
        ["2026-12-31T23:59:59Z", "2027-01-01T00:00:00Z", "2027-01-01"],
    ]) {
        const clock = new ServerClock();
        clock.set(Date.parse(before), 500);
        assert.notEqual(londonDateKey(new Date(clock.read(500)!)), expected);
        assert.equal(clock.read(1500), Date.parse(after));
        assert.equal(londonDateKey(new Date(clock.read(1500)!)), expected);
        for (const layout of ["week", "month", "list"] as const) {
            assert(
                currentMonthDates(expected, layout).every((date) =>
                    date.toISOString().startsWith(expected.slice(0, 7)),
                ),
            );
        }
    }
});

test("GMT/BST transitions preserve the correct London date", () => {
    assert.equal(londonDateKey(new Date("2026-03-29T00:59:59Z")), "2026-03-29");
    assert.equal(londonDateKey(new Date("2026-03-29T01:00:00Z")), "2026-03-29");
    assert.equal(londonDateKey(new Date("2026-10-25T00:59:59Z")), "2026-10-25");
    assert.equal(londonDateKey(new Date("2026-10-25T01:00:00Z")), "2026-10-25");
    assert.equal(
        londonDateKey(new Date("2026-07-01T00:30:00+09:00")),
        "2026-06-30",
    );
});

test("server clock ignores device clock changes and can resynchronise after sleep", () => {
    const clock = new ServerClock();
    assert.equal(clock.read(1000), null);
    clock.set(Date.parse("2026-11-02T23:59:59Z"), 1000);
    const original = Date.now;
    Date.now = () => Date.parse("2040-01-01T00:00Z");
    try {
        assert.equal(londonDateKey(new Date(clock.read(2000)!)), "2026-11-03");
        clock.set(Date.parse("2026-12-01T12:00Z"), 2000);
        assert.equal(londonDateKey(new Date(clock.read(2000)!)), "2026-12-01");
    } finally {
        Date.now = original;
    }
});

test("Week/Month/List never include another month's classes", () => {
    assert.equal(currentMonthDates("2026-11-02", "month").length, 30);
    assert.equal(currentMonthDates("2026-11-30", "list").length, 30);
    assert.deepEqual(
        currentMonthDates("2026-11-01", "week").map((x) =>
            x.toISOString().slice(0, 10),
        ),
        ["2026-11-01"],
    );
    assert.deepEqual(
        currentMonthDates("2026-11-30", "week").map((x) =>
            x.toISOString().slice(0, 10),
        ),
        ["2026-11-30"],
    );
});

test("time response is explicitly uncacheable and contains a server timestamp", async () => {
    const start = Date.now();
    const response = GET();
    assert.match(response.headers.get("Cache-Control")!, /no-store/);
    assert.equal(response.headers.get("CDN-Cache-Control"), "no-store");
    const { now } = await response.json();
    assert(now >= start && now <= Date.now());
});

test("retired routes are absent while Tango classes and generic event categories remain", () => {
    for (const slug of [
        "milonga-ojo-opening-night",
        "ceramics-workshop-with-yasemin",
    ]) {
        assert.equal(getEventBySlug(slug), undefined);
        assert(!getAllEventRouteSlugs().includes(slug));
    }
    assert(getAllEventRouteSlugs().includes("milonga"));
    assert(getEventBySlug("four-seasons-festival"));
});
