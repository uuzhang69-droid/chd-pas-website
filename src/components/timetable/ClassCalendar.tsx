"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
    CLASS_CALENDAR_DAYS,
    CLASS_CALENDAR_MONTHS,
    CLASS_CALENDAR_STYLE_COLOUR,
} from "@/lib/class-calendar/utils";
import { BookingOptionsDialog } from "@/components/timetable/BookingOptionsDialog";
import Link from "next/link";
import {
    canBookSession,
    sessionStatus,
} from "@/lib/class-calendar/booking-status";
import {
    currentMonthDates,
    londonDateKey,
} from "@/lib/class-calendar/current-month";
import { useNow } from "@/lib/class-calendar/use-now";
import {
    filterSessions,
    sessionsForDates,
    type ActivityFilter,
    type CalendarSession,
    type ScheduleData,
} from "@/lib/class-calendar/sessions";

import "./class-calendar.css";

const STYLE_FILTER_OPTIONS = [
    "Contemporary",
    "Chinese Dance",
    "Tango",
    "Yoga",
    "Tai Chi",
    "Broadway Jazz",
    "Performance",
    "Acting",
] as const;
const LOAD_ERROR_MESSAGE =
    "Regular classes could not be loaded. Published events are shown below where available. Please contact us for the full timetable.";
const EMPTY_FILTER_MESSAGE =
    "No scheduled activities match this period and filters. Change your filters to see other activities this month.";

function dateKey(date: Date): string {
    return date.toISOString().slice(0, 10);
}

export function ClassCalendar({
    eventSessions = [],
}: {
    eventSessions?: CalendarSession[];
}) {
    const now = useNow();
    const sectionRef = useRef<HTMLElement>(null);
    const [schedule, setSchedule] = useState<ScheduleData>({
        classes: [],
        datedClasses: [],
    });
    const [layout, setLayout] = useState<"week" | "month" | "list">("month");
    const [typeFilter, setTypeFilter] = useState<ActivityFilter>("all");
    const [dayFilter, setDayFilter] = useState("all");
    const [styleFilter, setStyleFilter] = useState("all");
    const todayKey = now ? londonDateKey(now) : null;
    const [loadState, setLoadState] = useState<"loading" | "ready" | "error">(
        "loading",
    );

    const displayDates = useMemo(
        () => (todayKey ? currentMonthDates(todayKey, layout) : []),
        [layout, todayKey],
    );
    const today = useMemo(
        () => (todayKey ? new Date(`${todayKey}T00:00:00Z`) : null),
        [todayKey],
    );

    useEffect(() => {
        fetch("/schedule.json", { cache: "no-store" })
            .then((r) => {
                if (!r.ok) throw new Error("Schedule request failed");
                return r.json();
            })
            .then((d: ScheduleData) => {
                if (
                    !Array.isArray(d.classes) ||
                    (d.datedClasses !== undefined &&
                        !Array.isArray(d.datedClasses))
                )
                    throw new Error("Invalid schedule format");
                setSchedule(d);
                setLoadState("ready");
            })
            .catch(() => setLoadState("error"));
    }, []);

    const visible = useMemo(
        () =>
            filterSessions(
                sessionsForDates(schedule, displayDates, eventSessions),
                typeFilter,
                dayFilter,
                styleFilter,
            ),
        [
            schedule,
            displayDates,
            eventSessions,
            typeFilter,
            dayFilter,
            styleFilter,
        ],
    );

    const resultCountText =
        loadState === "error"
            ? `${visible.length} activities shown · class data unavailable`
            : loadState === "loading"
              ? "Loading timetable…"
              : `${visible.length} published sessions`;

    const gridClassName = useMemo(() => {
        const parts = ["calendar-grid"];
        if (layout === "list") parts.push("list-layout");
        if (layout === "month") parts.push("month-layout");
        if (dayFilter !== "all") parts.push("one-day");
        return parts.join(" ");
    }, [layout, dayFilter]);

    const dayColumns = useMemo(() => {
        if (loadState === "loading" || !today)
            return <p className="calendar-empty">Loading timetable…</p>;
        if (!visible.length)
            return <p className="calendar-empty">{EMPTY_FILTER_MESSAGE}</p>;
        const columns: ReactNode[] = [];
        if (layout === "month" && dayFilter === "all") {
            const padding = (displayDates[0].getUTCDay() + 6) % 7;
            for (let i = 0; i < padding; i++) {
                columns.push(
                    <div
                        className="calendar-padding"
                        aria-hidden="true"
                        key={`padding-${i}`}
                    />,
                );
            }
        }
        displayDates.forEach((date) => {
            const i = (date.getUTCDay() + 6) % 7;
            const name = CLASS_CALENDAR_DAYS[i];
            if (dayFilter !== "all" && Number(dayFilter) !== i) return;
            const items = visible.filter((e) => e.date === dateKey(date));
            if (layout === "list" && !items.length) return;
            const dayNum = date.getUTCDate();
            const month = CLASS_CALENDAR_MONTHS[date.getUTCMonth()];
            const year = date.getUTCFullYear();
            columns.push(
                <section className="calendar-day" key={dateKey(date)}>
                    <h3>
                        <time
                            dateTime={dateKey(date)}
                            aria-current={
                                dateKey(date) === todayKey ? "date" : undefined
                            }
                        >
                            {name.slice(0, 3)} {dayNum}
                        </time>
                    </h3>
                    {items.map((e) => {
                        const bookable = now !== null && canBookSession(e, now);
                        const status = now ? sessionStatus(e, now) : "unknown";
                        const colourClass =
                            CLASS_CALENDAR_STYLE_COLOUR[e.style] ?? "";
                        const bookLabel = `${e.name} · published ${name} ${dayNum} ${month} ${year}, ${e.start}–${e.end}`;
                        const contents = (
                            <>
                                <span className="session-time">
                                    {e.allDay
                                        ? "All day"
                                        : e.start
                                          ? `${e.start}${e.end ? `–${e.end}` : " · End time to be confirmed"}`
                                          : "Time to be confirmed"}
                                </span>
                                <strong>{e.name}</strong>
                                {e.title && (
                                    <span className="session-kind">
                                        {e.title}
                                    </span>
                                )}
                                {e.teacher && (
                                    <span className="session-kind">
                                        with {e.teacher}
                                    </span>
                                )}
                                <span className="session-kind">
                                    {e.private
                                        ? "Reserved"
                                        : e.type === "class"
                                          ? "Class"
                                          : e.type === "workshop"
                                            ? "Workshop"
                                            : "Event"}
                                    {e.venueBooking ? " · Venue Booking" : ""}
                                </span>
                                {e.location && (
                                    <span className="session-kind">
                                        {e.location}
                                    </span>
                                )}
                                {e.room && (
                                    <span className="session-kind">
                                        {e.room}
                                    </span>
                                )}
                                {(e.occupancyStart || e.occupancyEnd) && (
                                    <span className="session-kind">
                                        Including setup / teardown:{" "}
                                        {e.occupancyStart ?? e.start}–
                                        {e.occupancyEnd ?? e.end}
                                    </span>
                                )}
                                {!e.private && (e.href || bookable) && (
                                    <span className="session-action">
                                        {e.href
                                            ? "Event details →"
                                            : "Booking options ↗"}
                                    </span>
                                )}
                                {!e.private &&
                                    !e.href &&
                                    status === "ended" && (
                                        <span className="session-kind">
                                            Ended
                                        </span>
                                    )}
                                {!e.private &&
                                    !e.href &&
                                    status === "ongoing" && (
                                        <span className="session-kind">
                                            In progress · Booking closed
                                        </span>
                                    )}
                            </>
                        );
                        const className = `session-card ${colourClass}`.trim();
                        if (e.private)
                            return (
                                <div key={e.id} className={className}>
                                    {contents}
                                </div>
                            );
                        if (e.href && e.bookingUrl)
                            return (
                                <div key={e.id} className={className}>
                                    <Link href={e.href} className="contents">
                                        {contents}
                                    </Link>
                                    <a
                                        href={e.bookingUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="session-action !mt-0 font-semibold"
                                    >
                                        Book Now ↗
                                    </a>
                                </div>
                            );
                        if (e.href)
                            return (
                                <Link
                                    key={e.id}
                                    href={e.href}
                                    className={className}
                                >
                                    {contents}
                                </Link>
                            );
                        if (!bookable)
                            return (
                                <div key={e.id} className={className}>
                                    {contents}
                                </div>
                            );
                        return (
                            <button
                                key={e.id}
                                type="button"
                                className={className}
                                data-book={bookLabel}
                                data-session-date={e.date}
                                data-session-start={e.start}
                                data-session-end={e.end}
                                aria-label={`${e.name}, ${name} ${dayNum} ${month}, ${e.start} to ${e.end}. View upcoming booking options.`}
                            >
                                {contents}
                            </button>
                        );
                    })}
                </section>,
            );
        });
        return columns;
    }, [
        dayFilter,
        layout,
        loadState,
        visible,
        displayDates,
        today,
        todayKey,
        now,
    ]);

    return (
        <section className="class-calendar-section" ref={sectionRef}>
            <div className="calendar-panel">
                <div className="calendar-toolbar">
                    <div>
                        <h2 className="calendar-month-title">
                            {today
                                ? CLASS_CALENDAR_MONTHS[today.getUTCMonth()]
                                : "Timetable"}
                            <span className="calendar-month-year">
                                {today?.getUTCFullYear()}
                            </span>
                        </h2>
                    </div>
                    <div
                        className="view-buttons"
                        role="group"
                        aria-label="Timetable layout"
                    >
                        <button
                            type="button"
                            id="week-view"
                            aria-pressed={layout === "week"}
                            onClick={() => setLayout("week")}
                        >
                            Week
                        </button>
                        <button
                            type="button"
                            id="month-view"
                            aria-pressed={layout === "month"}
                            onClick={() => setLayout("month")}
                        >
                            Month
                        </button>
                        <button
                            type="button"
                            id="list-view"
                            aria-pressed={layout === "list"}
                            onClick={() => setLayout("list")}
                        >
                            List
                        </button>
                    </div>
                </div>

                <div className="filter-bar">
                    <label>
                        Type
                        <select
                            value={typeFilter}
                            onChange={(e) =>
                                setTypeFilter(e.target.value as ActivityFilter)
                            }
                        >
                            <option value="all">All activities</option>
                            <option value="class">Classes</option>
                            <option value="workshop">Workshops</option>
                            <option value="event">Events</option>
                            <option value="venue-booking">
                                Venue Bookings
                            </option>
                        </select>
                    </label>
                    <label>
                        Day
                        <select
                            id="day-filter"
                            value={dayFilter}
                            onChange={(e) => setDayFilter(e.target.value)}
                        >
                            <option value="all">All days</option>
                            {CLASS_CALENDAR_DAYS.map((name, i) => (
                                <option key={name} value={String(i)}>
                                    {name}
                                </option>
                            ))}
                        </select>
                    </label>
                    <label>
                        Style
                        <select
                            id="style-filter"
                            value={styleFilter}
                            onChange={(e) => setStyleFilter(e.target.value)}
                        >
                            <option value="all">All styles</option>
                            {STYLE_FILTER_OPTIONS.map((style) => (
                                <option key={style} value={style}>
                                    {style}
                                </option>
                            ))}
                        </select>
                    </label>
                    <p id="result-count" aria-live="polite">
                        {resultCountText}
                    </p>
                </div>

                {loadState === "error" && (
                    <p className="calendar-empty" role="alert">
                        {LOAD_ERROR_MESSAGE}
                    </p>
                )}
                <div id="calendar" className={gridClassName}>
                    {dayColumns}
                </div>
                <noscript>
                    Enable JavaScript to explore the timetable and membership
                    choices. For help booking, email
                    info@countyhalldancecentre.com.
                </noscript>
                <div className="calendar-footer">
                    <span>All times are London time.</span>
                    <button
                        className="button"
                        type="button"
                        data-book="Current classes"
                    >
                        Upcoming dates &amp; booking ↗
                    </button>
                </div>
            </div>
            <BookingOptionsDialog sectionRef={sectionRef} />
        </section>
    );
}
