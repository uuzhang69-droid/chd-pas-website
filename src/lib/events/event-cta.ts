import type { CtaButton, EventCard } from "@/content/types";
import { formatIsoDate } from "@/lib/timetable/week";

export const PAST_EVENT_CTA_LABEL = "Details";

export function isEventBeforeToday(dateIso: string | undefined): boolean {
  if (!dateIso || !/^\d{4}-\d{2}-\d{2}$/.test(dateIso)) return false;
  return dateIso < formatIsoDate(new Date());
}

export function getEventCardCta(event: EventCard): CtaButton {
  if (!isEventBeforeToday(event.dateIso)) {
    return event.bookNow;
  }

  return {
    ...event.bookNow,
    label: PAST_EVENT_CTA_LABEL,
    href: `/events/${event.slug}`,
    external: false,
  };
}

/** Upcoming events soonest first, then past events most recent first. */
export function sortEventsByDate(events: readonly EventCard[]): EventCard[] {
  const upcoming: EventCard[] = [];
  const past: EventCard[] = [];

  for (const event of events) {
    if (isEventBeforeToday(event.dateIso)) {
      past.push(event);
    } else {
      upcoming.push(event);
    }
  }

  upcoming.sort((a, b) => (a.dateIso ?? "").localeCompare(b.dateIso ?? ""));
  past.sort((a, b) => (b.dateIso ?? "").localeCompare(a.dateIso ?? ""));
  return [...upcoming, ...past];
}
