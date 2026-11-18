import type { EventSession } from "../../content/types";

function isPublic(session: EventSession): boolean {
    return session.published === true && !session.cancelled && !session.private;
}

/** Published sessions ordered newest first, by start date then start time. */
export function sessionsNewestFirst(
    sessions: readonly EventSession[] = [],
): EventSession[] {
    return sessions
        .filter(isPublic)
        .toSorted(
            (a, b) =>
                (b.date ?? "").localeCompare(a.date ?? "") ||
                (b.start ?? "").localeCompare(a.start ?? ""),
        );
}

/** The latest published session of a series, regardless of today's date. */
export function latestSession(
    sessions: readonly EventSession[] = [],
): EventSession | undefined {
    return sessionsNewestFirst(sessions)[0];
}

/** "Friday 20 November 2026" from an ISO date. */
export function longDate(dateIso: string): string {
    return new Intl.DateTimeFormat("en-GB", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
        timeZone: "UTC",
    }).format(new Date(`${dateIso}T12:00:00Z`));
}

/** "13:00 to 14:00", or just the start when no end time is known. */
export function sessionTimeRange(session: EventSession): string | undefined {
    if (!session.start) return undefined;
    return session.end ? `${session.start} to ${session.end}` : session.start;
}
