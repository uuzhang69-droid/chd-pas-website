import type { ActivityType, EventCard, EventSession } from "../../content/types";
import { SCHOOL_VENUE_ID, resolveVenueId, spaceName, venueName } from "../../content/venues";
import type { ScheduleEntry } from "./utils";

export type WeeklyClass = {
  id?: string; day: number; start: string; end: string; name: string; style: string;
  startDate?: string; endDate?: string; cancelledDates?: string[];
  type?: ActivityType; venueId?: string; spaceId?: string;
};
export type DatedClass = Omit<WeeklyClass, "day" | "startDate" | "endDate" | "cancelledDates"> & {
  date: string; cancelled?: boolean;
};
export type ScheduleData = { classes: (ScheduleEntry | WeeklyClass)[]; datedClasses?: DatedClass[] };
export type CalendarSession = {
  id: string; date: string; day: number; start: string; end: string; name: string;
  style: string; type: ActivityType; venueBooking: boolean;
  room?: string; href?: string; private?: boolean; location?: string;
  occupancyStart?: string; occupancyEnd?: string;
};
export type ActivityFilter = "all" | ActivityType | "venue-booking";

function validDate(value: string | undefined): value is string {
  return !!value && /^\d{4}-\d{2}-\d{2}$/.test(value) &&
    !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
}
function validTime(value: string | undefined): value is string {
  return !!value && /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(value);
}
function dayIndex(date: string): number { return (new Date(date).getUTCDay() + 6) % 7; }

/** Only this safe projection is passed to the browser. No private titles or customer metadata. */
export function schoolEventSessions(events: readonly EventCard[], privateBookings: readonly EventSession[] = []): CalendarSession[] {
  const records = events.flatMap((event) => (event.sessions ?? []).filter((session) => session.eventSlug === event.slug));
  const unique = new Map<string, CalendarSession>();
  for (const session of [...records, ...privateBookings.filter((session) => session.private)]) {
    const schoolOrganised = !session.private && session.relationship === "organised" &&
      session.organiser === venueName(SCHOOL_VENUE_ID);
    const atSchool = resolveVenueId(session.venueId) === SCHOOL_VENUE_ID;
    const completeTime = validTime(session.start) && validTime(session.end) && session.end > session.start;
    if (session.published !== true || session.cancelled || !validDate(session.date) ||
        (!atSchool && !schoolOrganised) || (!schoolOrganised && !completeTime) ||
        (session.start !== undefined && !validTime(session.start)) ||
        (session.end !== undefined && !validTime(session.end)) ||
        (session.start && session.end && session.end <= session.start)) continue;
    unique.set(session.id, {
      id: session.id, date: session.date, day: dayIndex(session.date),
      start: session.start ?? "", end: session.end ?? "",
      location: venueName(session.venueId) ?? "Venue to be confirmed",
      name: session.private ? "Private booking" : session.title,
      style: session.private ? "" : session.style ?? "", type: session.type,
      venueBooking: atSchool && completeTime && session.venueBooking === true, private: session.private,
      room: spaceName(session.spaceId, session.venueId),
      href: session.private ? undefined : `/events/${session.eventSlug}#session-${session.id}`,
      occupancyStart: atSchool && completeTime && validTime(session.setupStart) && session.setupStart < session.start! ? session.setupStart : undefined,
      occupancyEnd: atSchool && completeTime && validTime(session.teardownEnd) && session.teardownEnd > session.end! ? session.teardownEnd : undefined,
    });
  }
  return [...unique.values()];
}

export function sessionsForDates(data: ScheduleData, dates: Date[], events: readonly CalendarSession[] = []): CalendarSession[] {
  const sessions: CalendarSession[] = [];
  const keys = new Set(dates.map((date) => date.toISOString().slice(0, 10)));
  for (const date of keys) {
    const day = dayIndex(date);
    const add = (item: WeeklyClass | DatedClass, id: string) => {
      if (item.venueId && resolveVenueId(item.venueId) !== SCHOOL_VENUE_ID) return;
      sessions.push({ id, date, day, start: item.start, end: item.end, name: item.name, style: item.style,
        type: item.type ?? "class", venueBooking: false, room: spaceName(item.spaceId, item.venueId ?? SCHOOL_VENUE_ID) });
    };
    data.classes.forEach((original, index) => {
      const item: WeeklyClass = Array.isArray(original)
        ? { day: original[0], start: original[1], end: original[2], name: original[3], style: original[4] } : original;
      if (item.day !== day || (item.startDate && date < item.startDate) || (item.endDate && date > item.endDate) || item.cancelledDates?.includes(date)) return;
      add(item, `weekly-${item.id ?? index}-${date}`);
    });
    (data.datedClasses ?? []).forEach((item, index) => {
      if (item.date === date && !item.cancelled) add(item, `dated-${item.id ?? index}-${date}`);
    });
  }
  sessions.push(...events.filter((item) => keys.has(item.date)));
  return [...new Map(sessions.map((item) => [item.id, item])).values()]
    .sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.name.localeCompare(b.name));
}

export function filterSessions(sessions: CalendarSession[], type: ActivityFilter, day: string, style: string): CalendarSession[] {
  return sessions.filter((item) => (type === "all" || (type === "venue-booking" ? item.venueBooking : item.type === type)) &&
    (day === "all" || item.day === Number(day)) && (style === "all" || item.style === style));
}
