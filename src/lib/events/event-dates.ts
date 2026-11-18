import type { EventCard, EventSession } from "../../content/types";
import { isPublicEvent } from "../../content/event-visibility";
import { sessionsNewestFirst } from "./series";

/**
 * Shared event date logic. Every time here is London wall-clock time, written as
 * "YYYY-MM-DDTHH:MM" so keys compare correctly as plain strings and never pass
 * through a UTC conversion. "Now" is converted to London time with Intl, which
 * applies GMT or BST for that instant, so the visitor's own time zone is irrelevant.
 */
export const EVENT_TIME_ZONE = "Europe/London";

const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^(?:[01]\d|2[0-3]):[0-5]\d$/;
/* Ordering and "has it ended" only. These are never shown as event times. */
const START_OF_DAY = "00:00";
const END_OF_DAY = "23:59";

export type EventWindow = {
    startDate: string;
    /** Only when a start time is confirmed. */
    startTime?: string;
    endDate: string;
    /** Only when an end time is confirmed. */
    endTime?: string;
    startKey: string;
    endKey: string;
};

type Slot = { date: string; start?: string; end?: string };

/** London wall-clock "YYYY-MM-DDTHH:MM" for an instant. */
export function londonNowKey(now: Date): string {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: EVENT_TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
    }).formatToParts(now);
    const part = (type: string) =>
        parts.find((item) => item.type === type)?.value ?? "00";
    return `${part("year")}-${part("month")}-${part("day")}T${part("hour")}:${part("minute")}`;
}

function validTime(value: string | undefined): value is string {
    return !!value && TIME_PATTERN.test(value);
}

function slotFromSession(session: EventSession): Slot | undefined {
    if (!session.date || !DATE_PATTERN.test(session.date)) return undefined;
    return {
        date: session.date,
        start: validTime(session.start) ? session.start : undefined,
        end: validTime(session.end) ? session.end : undefined,
    };
}

/** "15:00 to 18:00" (a dash is also accepted) or "19:30" from a single-date event's `time` text. */
function slotFromEventTime(event: EventCard): Slot | undefined {
    if (!event.dateIso || !DATE_PATTERN.test(event.dateIso)) return undefined;
    const match = event.time?.match(
        /^(\d{2}:\d{2})(?:\s*(?:[–-]|to)\s*(\d{2}:\d{2}))?$/,
    );
    return {
        date: event.dateIso,
        start: validTime(match?.[1]) ? match?.[1] : undefined,
        end: validTime(match?.[2]) ? match?.[2] : undefined,
    };
}

const startKeyOf = (slot: Slot) => `${slot.date}T${slot.start ?? START_OF_DAY}`;
const endKeyOf = (slot: Slot) => {
    const key = `${slot.date}T${slot.end ?? END_OF_DAY}`;
    return key < startKeyOf(slot) ? startKeyOf(slot) : key;
};

/**
 * When the event starts and ends.
 * - Series: the latest published session, so a new later concert moves the series.
 * - Events with sessions: first start to last end, so multi-day events sort by day one.
 * - Single events without sessions: `dateIso` plus the confirmed `time`.
 */
export function eventWindow(event: EventCard): EventWindow | undefined {
    let slots: Slot[];
    if (event.isSeries) {
        const latest = sessionsNewestFirst(event.sessions)[0];
        const slot = latest ? slotFromSession(latest) : undefined;
        slots = slot ? [slot] : [];
    } else {
        slots = sessionsNewestFirst(event.sessions).flatMap((session) => {
            const slot = slotFromSession(session);
            return slot ? [slot] : [];
        });
    }
    if (slots.length === 0 && !event.isSeries) {
        const single = slotFromEventTime(event);
        if (single) slots = [single];
    }
    if (slots.length === 0) return undefined;

    const first = slots.reduce((a, b) =>
        startKeyOf(b) < startKeyOf(a) ? b : a,
    );
    const last = slots.reduce((a, b) => (endKeyOf(b) > endKeyOf(a) ? b : a));
    return {
        startDate: first.date,
        startTime: first.start,
        endDate: last.date,
        endTime: last.end,
        startKey: startKeyOf(first),
        endKey: endKeyOf(last),
    };
}

function nowKeyOf(now: Date | string): string {
    return typeof now === "string" ? now : londonNowKey(now);
}

/** True once the confirmed end (or the end of its last day when no end time is known) has passed. */
export function isEventEnded(
    event: EventCard,
    now: Date | string = new Date(),
): boolean {
    const window = eventWindow(event);
    return window ? window.endKey < nowKeyOf(now) : false;
}

/** Retired or hidden events never appear in lists. */
export function publicEvents<T extends EventCard>(events: readonly T[]): T[] {
    return events.filter((event) => isPublicEvent(event.slug));
}

const byIdentity = (a: EventCard, b: EventCard) =>
    a.slug.localeCompare(b.slug) || a.id.localeCompare(b.id);

/**
 * Home "What's On" and /events share this order: newest start first.
 * - Multi-day events use their first day; a series uses its latest published session.
 * - On the same day the later start comes first.
 * - Events with no usable date go last. Ties fall back to slug, then id, so the order is stable.
 * Calendar does not use this order; it stays earliest first.
 */
export function sortEventsForListing<T extends EventCard>(
    events: readonly T[],
): T[] {
    return events
        .map((event) => ({ event, window: eventWindow(event) }))
        .sort(
            (a, b) =>
                (b.window?.startKey ?? "").localeCompare(
                    a.window?.startKey ?? "",
                ) ||
                (b.window?.endKey ?? "").localeCompare(
                    a.window?.endKey ?? "",
                ) ||
                byIdentity(a.event, b.event),
        )
        .map((entry) => entry.event);
}
