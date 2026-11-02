import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import { eventSessions, publicSessionsForEvent } from "../src/content/event-sessions";
import { siteContent } from "../src/content/site";
import { resolveVenueId, SCHOOL_VENUE_ID } from "../src/content/venues";
import type { EventCard, EventSession } from "../src/content/types";
import { filterSessions, schoolEventSessions, sessionsForDates, type ScheduleData } from "../src/lib/class-calendar/sessions";
const schedule: ScheduleData = JSON.parse(readFileSync("public/schedule.json", "utf8"));
const projected = schoolEventSessions(siteContent.pages.events.items);
const dates = (year: number, month: number) => Array.from({ length: new Date(Date.UTC(year, month, 0)).getUTCDate() }, (_, i) => new Date(Date.UTC(year, month - 1, i + 1)));
const fixture = (sessions: EventSession[]) => [{ slug: "fixture", sessions }] as EventCard[];
const base: EventSession = { id: "fixture", eventSlug: "fixture", title: "Example", date: "2026-10-24", start: "10:00", end: "11:00", venueId: SCHOOL_VENUE_ID, type: "event", published: true };

test("festival page retains nine sessions, calendar includes exactly the three school sessions", () => {
  const programme = publicSessionsForEvent("four-seasons-festival");
  assert.equal(programme.length, 9);
  const festival = projected.filter((x) => x.href?.includes("four-seasons-festival"));
  assert.deepEqual(festival.map((x) => [x.date, x.start, x.end]), [["2026-10-24", "11:00", "12:00"], ["2026-10-24", "14:00", "15:30"], ["2026-10-24", "16:00", "17:30"]]);
  assert.equal(festival.find((x) => x.name === "Autumn Flow and Sound")?.venueBooking, false);
  const day = sessionsForDates(schedule, [new Date("2026-10-24")], projected);
  assert.equal(day.filter((x) => x.href?.includes("four-seasons-festival")).length, 3);
});
test("external venue events and incomplete concerts do not enter timetable", () => {
  for (const slug of ["lunchtime-concert-series"])
    assert(!projected.some((x) => x.href?.includes(slug)));
  const concerts = publicSessionsForEvent("lunchtime-concert-series");
  assert.equal(concerts.find((x) => x.date === "2026-09-25")?.venueId, "county-hall-atrium");
  assert.equal(concerts.find((x) => x.date === "2026-10-23")?.venueId, SCHOOL_VENUE_ID);
  assert(concerts.every((x) => !x.end));
});
test("November-only classes and workshops do not leak into December", () => {
  const november = sessionsForDates(schedule, dates(2026, 11), projected);
  assert.equal(november.filter((x) => x.name === "Yoga (Inside Flow)").length, 4);
  assert.equal(november.filter((x) => x.type === "workshop").length, 3);
  assert.equal(november.length, 39);
  assert(!sessionsForDates(schedule, dates(2026, 12), projected).some((x) => x.name.includes("Workshop") || x.name.includes("Inside Flow")));
});
test("legacy weekly tuples, date bounds and both cancellation forms remain supported", () => {
  const data: ScheduleData = { classes: [[0, "09:00", "10:00", "Legacy", "Yoga"], {day: 0, start: "11:00", end: "12:00", name: "Cancelled", style: "Yoga", cancelledDates: ["2026-11-02"]}], datedClasses: [{date: "2026-11-02", start: "13:00", end: "14:00", name: "Cancelled dated", style: "Yoga", cancelled: true}] };
  assert.deepEqual(sessionsForDates(data, [new Date("2026-11-02")]).map((x) => x.name), ["Legacy"]);
});
test("publication, venue and complete valid timings are required", () => {
  for (const patch of [{ published: false }, { published: undefined }, { cancelled: true }, { date: undefined }, { date: "2026-02-30" }, { end: undefined }, { end: "09:00" }, { start: "25:00" }, { venueId: undefined }, { venueId: "Unknown Dance Centre" }, { venueId: "county-hall" }])
    assert.equal(schoolEventSessions(fixture([{ ...base, ...patch }])).length, 0);
});
test("venue aliases are exact and never match the whole building", () => {
  assert.equal(resolveVenueId("County Hall Dance Centre"), SCHOOL_VENUE_ID);
  assert.equal(resolveVenueId("Atrium, County Hall"), "county-hall-atrium");
  assert.equal(resolveVenueId("County Hall"), "county-hall");
  assert.equal(resolveVenueId("near the Dance Centre"), undefined);
});
test("Event plus Venue Booking filters do not duplicate the session", () => {
  const result = schoolEventSessions(fixture([{...base, venueBooking: true, style: "Yoga"}, {...base, venueBooking: true, style: "Yoga"}]));
  assert.equal(result.length, 1);
  for (const type of ["all", "event", "venue-booking"] as const) assert.equal(filterSessions(result, type, "5", "Yoga").length, 1);
  assert.equal(filterSessions(result, "class", "all", "all").length, 0);
  assert.equal(filterSessions(result, "all", "0", "Yoga").length, 0);
});
test("private bookings are anonymous and have no link or booking action", () => {
  const result = schoolEventSessions([], [{...base, private: true, title: "Private customer name", description: ["Private contact"], venueBooking: true, setupStart: "09:30", teardownEnd: "11:30"}]);
  assert.equal(result[0].name, "Private booking");
  assert.equal(result[0].href, undefined);
  assert(!JSON.stringify(result).includes("Private customer"));
  assert(!JSON.stringify(result).includes("Private contact"));
  assert.equal(result[0].occupancyStart, "09:30");
  assert.equal(result[0].occupancyEnd, "11:30");
});
test("unpublished and private programme entries never enter generated client copy", () => {
  eventSessions.push({...base, private: true}, {...base, id: "draft", published: false});
  try { assert.equal(publicSessionsForEvent("fixture").length, 0); }
  finally { eventSessions.splice(-2); }
});
test("event links target the parent page and stable session anchor", () => {
  for (const item of projected) assert.match(item.href!, /^\/events\/[^/]+#session-/);
  const schoolConcert = {...base, eventSlug: "lunchtime-concert-series", end: "14:00"};
  assert.equal(schoolEventSessions([{slug: schoolConcert.eventSlug, sessions: [schoolConcert]}] as EventCard[])[0].href, "/events/lunchtime-concert-series#session-fixture");
});

 test("school-organised events appear with actual venues without claiming school occupancy", () => {
  const memory = projected.filter(x => x.href?.includes("memory-of-china"));
  assert.equal(memory.length, 2);
  assert(memory.every(x => x.location === "Members’ Terrace" && !x.start && !x.venueBooking));
  assert.equal(projected.find(x => x.href?.includes("dance-meets-arts"))?.location, "Members’ Terrace");
  assert.equal(projected.find(x => x.href?.includes("opening-day"))?.date, "2026-09-10");
  const organised = {...base, venueId: "members-terrace", organiser: "County Hall Dance & Performing Arts School", relationship: "organised" as const, venueBooking: true};
  assert.equal(schoolEventSessions(fixture([organised]))[0].venueBooking, false);
  assert.equal(schoolEventSessions(fixture([{...organised, published: false}])).length, 0);
  assert.equal(schoolEventSessions(fixture([{...organised, private: true}])).length, 0);
});
