import type { EventCard, EventSession } from "../../content/types";
import { spaceName, venueAddress, venueName } from "../../content/venues";

/** The school is the default organiser of its own events, so naming it is noise. */
export const SCHOOL_NAME = "County Hall Dance & Performing Arts School";

export type ProgrammeRowKey = "location" | "room" | "organiser" | "partners" | "hostedAt" | "promotedBy";
export type ProgrammeRow = { key: ProgrammeRowKey; value: string };

export type ProgrammeModel = {
    /** No programme section at all: the hero already shows everything this session says. */
    hidden: boolean;
    heading: "Performance Dates & Times" | "Dates & Times" | "Programme";
    /** Details every session shares, written once above the list. */
    shared: ProgrammeRow[];
    items: {
        session: EventSession;
        /** Shown only when the session title says something the event title does not. */
        showTitle: boolean;
        /** Details that differ between sessions. */
        rows: ProgrammeRow[];
        /** Single sessions already have their date and time in the hero. */
        showWhen: boolean;
    }[];
};

const ORDER: ProgrammeRowKey[] = ["location", "room", "organiser", "partners", "hostedAt", "promotedBy"];

/** Attribution that the page-level "Event information" block already carries is not repeated per session. */
function rowsFor(session: EventSession, event: EventCard): Partial<Record<ProgrammeRowKey, string>> {
    const venue = venueName(session.venueId);
    const address = venueAddress(session.venueId);
    const partners = session.partners?.join(", ");
    const unlessSame = (value: string | undefined, eventValue: string | undefined) =>
        value && value !== eventValue ? value : undefined;
    return {
        location: venue ? [venue, address].filter(Boolean).join(", ") : undefined,
        room: spaceName(session.spaceId, session.venueId),
        organiser:
            session.organiser && session.organiser !== SCHOOL_NAME
                ? unlessSame(session.organiser, event.organiser)
                : undefined,
        partners: unlessSame(partners, event.partners?.join(", ")),
        /* "Hosted at" names the same venue the Location row already gives, so it is only kept when there is no Location. */
        hostedAt: session.relationship === "hosted" && !venue ? unlessSame(session.hostedAt, event.hostedAt) : undefined,
        promotedBy: unlessSame(session.promotedBy, event.promotedBy),
    };
}

/**
 * One reusable rule set for the non-series event page.
 * - One session whose title, description and booking add nothing to the hero: no section.
 * - Several sessions: details they all share appear once; only differences appear per session.
 * - The heading follows the data: repeated performances, simple dates and times, or a mixed programme.
 */
export function programmeModel(event: EventCard, sessions: readonly EventSession[]): ProgrammeModel {
    const visible = sessions
        .filter((session) => session.published === true && !session.cancelled && !session.private)
        .toSorted(
            (a, b) =>
                (a.date ?? "9999").localeCompare(b.date ?? "9999") ||
                (a.start ?? "").localeCompare(b.start ?? ""),
        );
    const per = visible.map((session) => rowsFor(session, event));
    const single = visible.length === 1;

    const shared: ProgrammeRow[] = [];
    const differing = new Set<ProgrammeRowKey>();
    for (const key of ORDER) {
        const values = per.map((rows) => rows[key]);
        const first = values[0];
        if (!first) {
            if (values.some(Boolean)) differing.add(key);
            continue;
        }
        if (!single && values.every((value) => value === first)) shared.push({ key, value: first });
        else differing.add(key);
    }

    const titles = new Set(visible.map((session) => session.title));
    const sameTitle = titles.size === 1;
    const items = visible.map((session, index) => ({
        session,
        /* A session title the event title already contains (or equals) adds nothing. */
        showTitle: !event.title.toLowerCase().includes(session.title.toLowerCase()),
        rows: ORDER.filter((key) => differing.has(key) && (single ? key !== "location" : true) && per[index][key]).map(
            (key) => ({ key, value: per[index][key]! }),
        ),
        showWhen: !single,
    }));

    const nothingUnique =
        single &&
        !items[0].showTitle &&
        !items[0].rows.length &&
        !visible[0].description?.length &&
        !visible[0].bookingUrl;

    return {
        hidden: visible.length === 0 || nothingUnique,
        heading: event.isPerformanceRun ? "Performance Dates & Times" : sameTitle ? "Dates & Times" : "Programme",
        shared,
        items,
    };
}
