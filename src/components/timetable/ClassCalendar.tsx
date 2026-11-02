"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  CLASS_CALENDAR_DAYS,
  CLASS_CALENDAR_MONTHS,
  CLASS_CALENDAR_STYLE_COLOUR,
  computeWeekDates,
  londonToday,
  weekRangeLabel,
} from "@/lib/class-calendar/utils";
import { BookingOptionsDialog } from "@/components/timetable/BookingOptionsDialog";
import Link from "next/link";
import { filterSessions, sessionsForDates, type ActivityFilter, type CalendarSession, type ScheduleData } from "@/lib/class-calendar/sessions";

import "./class-calendar.css";

const STYLE_FILTER_OPTIONS = [
  "Contemporary", "Chinese Dance", "Tango", "Yoga", "Tai Chi", "Broadway Jazz", "Performance",
] as const;
const LOAD_ERROR_MESSAGE = "Regular classes could not be loaded. Published events are shown below where available. Please contact us for the full timetable.";
const EMPTY_FILTER_MESSAGE = "No scheduled activities match this period and filters. Try another week or month, or change your filters.";

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthDates(date: Date): Date[] {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => new Date(Date.UTC(year, month, i + 1)));
}

export function ClassCalendar({ eventSessions = [] }: { eventSessions?: CalendarSession[] }) {
  const sectionRef = useRef<HTMLElement>(null);
  const [schedule, setSchedule] = useState<ScheduleData>({ classes: [], datedClasses: [] });
  const [layout, setLayout] = useState<"week" | "month" | "list">("week");
  const [typeFilter, setTypeFilter] = useState<ActivityFilter>("all");
  const [dayFilter, setDayFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [selectedDate, setSelectedDate] = useState(londonToday);
  const [today, setToday] = useState(londonToday);
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  const weekDates = useMemo(() => computeWeekDates(selectedDate), [selectedDate]);
  const displayDates = useMemo(() => layout === "month" ? monthDates(selectedDate) : weekDates, [layout, selectedDate, weekDates]);
  const rangeText = layout === "month"
    ? `${CLASS_CALENDAR_MONTHS[selectedDate.getUTCMonth()]} ${selectedDate.getUTCFullYear()}`
    : weekRangeLabel(weekDates[0], weekDates[6]);
  const isCurrentPeriod = layout === "month"
    ? dateKey(selectedDate).slice(0, 7) === dateKey(today).slice(0, 7)
    : dateKey(weekDates[0]) === dateKey(computeWeekDates(today)[0]);
  const period = layout === "month" ? "month" : "week";

  function navigate(amount: number) {
    setSelectedDate((date) => layout === "month"
      ? new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth() + amount, 1))
      : new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + amount * 7)));
  }

  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = londonToday();
      setToday((previous) => dateKey(previous) === dateKey(now) ? previous : now);
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/schedule.json")
      .then((r) => { if (!r.ok) throw new Error("Schedule request failed"); return r.json(); })
      .then((d: ScheduleData) => {
        if (!Array.isArray(d.classes) || (d.datedClasses !== undefined && !Array.isArray(d.datedClasses))) throw new Error("Invalid schedule format");
        setSchedule(d);
        setLoadState("ready");
      })
      .catch(() => setLoadState("error"));
  }, []);

  const visible = useMemo(() => filterSessions(sessionsForDates(schedule, displayDates, eventSessions), typeFilter, dayFilter, styleFilter),
    [schedule, displayDates, eventSessions, typeFilter, dayFilter, styleFilter]);

  const resultCountText = loadState === "error" ? `${visible.length} activities shown · class data unavailable` :
    loadState === "loading" ? "Loading timetable…" : `${visible.length} published sessions`;

  const gridClassName = useMemo(() => {
    const parts = ["calendar-grid"];
    if (layout === "list") parts.push("list-layout");
    if (layout === "month") parts.push("month-layout");
    if (dayFilter !== "all") parts.push("one-day");
    return parts.join(" ");
  }, [layout, dayFilter]);

  const dayColumns = useMemo(() => {
    if (loadState === "loading") return <p className="calendar-empty">Loading timetable…</p>;
    if (!visible.length) return <p className="calendar-empty">{EMPTY_FILTER_MESSAGE}</p>;
    const columns: ReactNode[] = [];
    if (layout === "month" && dayFilter === "all") {
      const padding = (displayDates[0].getUTCDay() + 6) % 7;
      for (let i = 0; i < padding; i++) {
        columns.push(<div className="calendar-padding" aria-hidden="true" key={`padding-${i}`} />);
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
          <h3><time dateTime={dateKey(date)} aria-current={dateKey(date) === dateKey(today) ? "date" : undefined}>{name.slice(0, 3)} {dayNum}</time></h3>
          {items.map((e) => {
            const colourClass = CLASS_CALENDAR_STYLE_COLOUR[e.style] ?? "";
            const bookLabel = `${e.name} · published ${name} ${dayNum} ${month} ${year}, ${e.start}–${e.end}`;
            const contents = <>
              <span className="session-time">{e.start ? `${e.start}${e.end ? `–${e.end}` : " · End time to be confirmed"}` : "Time to be confirmed"}</span>
              <strong>{e.name}</strong>
              <span className="session-kind">{e.private ? "Reserved" : e.type === "class" ? "Class" : e.type === "workshop" ? "Workshop" : "Event"}{e.venueBooking ? " · Venue Booking" : ""}</span>
              {e.location && <span className="session-kind">{e.location}</span>}
              {e.room && <span className="session-kind">{e.room}</span>}
              {(e.occupancyStart || e.occupancyEnd) && <span className="session-kind">Including setup / teardown: {e.occupancyStart ?? e.start}–{e.occupancyEnd ?? e.end}</span>}
              {!e.private && <span className="session-action">{e.href ? "Event details →" : "Booking options ↗"}</span>}
            </>;
            const className = `session-card ${colourClass}`.trim();
            if (e.private) return <div key={e.id} className={className}>{contents}</div>;
            if (e.href) return <Link key={e.id} href={e.href} className={className}>{contents}</Link>;
            return <button key={e.id} type="button" className={className} data-book={bookLabel}
              aria-label={`${e.name}, ${name} ${dayNum} ${month}, ${e.start} to ${e.end}. View upcoming booking options.`}>{contents}</button>;
          })}

        </section>
      );
    });
    return columns;
  }, [dayFilter, layout, loadState, visible, displayDates, today]);

  return (
    <section className="class-calendar-section" ref={sectionRef}>
      <div className="calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <h2>Timetable</h2>
            <p>Published timetable · <span id="week-range">{rangeText}</span></p>
          </div>
          <div className="view-buttons" role="group" aria-label="Timetable layout">
            <button type="button" id="week-view" aria-pressed={layout === "week"} onClick={() => setLayout("week")}>Week</button>
            <button type="button" id="month-view" aria-pressed={layout === "month"} onClick={() => setLayout("month")}>Month</button>
            <button type="button" id="list-view" aria-pressed={layout === "list"} onClick={() => setLayout("list")}>List</button>
          </div>
        </div>

        <div className="calendar-period-navigation" role="group" aria-label={`Navigate timetable ${period}s`}>
          <button type="button" className="button" onClick={() => navigate(-1)}>← Previous {period}</button>
          <button type="button" className="button" disabled={isCurrentPeriod} onClick={() => setSelectedDate(londonToday())}>This {period}</button>
          <button type="button" className="button" onClick={() => navigate(1)}>Next {period} →</button>
        </div>

        <div className="filter-bar">
          <label>Type
            <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as ActivityFilter)}>
              <option value="all">All activities</option>
              <option value="class">Classes</option>
              <option value="workshop">Workshops</option>
              <option value="event">Events</option>
              <option value="venue-booking">Venue Bookings</option>
            </select>
          </label>
          <label>Day
            <select id="day-filter" value={dayFilter} onChange={(e) => setDayFilter(e.target.value)}>
              <option value="all">All days</option>
              {CLASS_CALENDAR_DAYS.map((name, i) => <option key={name} value={String(i)}>{name}</option>)}
            </select>
          </label>
          <label>Style
            <select id="style-filter" value={styleFilter} onChange={(e) => setStyleFilter(e.target.value)}>
              <option value="all">All styles</option>
              {STYLE_FILTER_OPTIONS.map((style) => <option key={style} value={style}>{style}</option>)}
            </select>
          </label>
          <p id="result-count" aria-live="polite">{resultCountText}</p>
        </div>

        {loadState === "error" && <p className="calendar-empty" role="alert">{LOAD_ERROR_MESSAGE}</p>}
        <div id="calendar" className={gridClassName}>
          {dayColumns}
        </div>
        <noscript>Enable JavaScript to explore the timetable and membership choices. For help booking, email info@countyhalldancecentre.com.</noscript>
        <div className="calendar-footer">
          <span>All times are London time.</span>
          <button className="button" type="button" data-book="Current classes">Upcoming dates &amp; booking ↗</button>
        </div>
      </div>
      <BookingOptionsDialog sectionRef={sectionRef} />
    </section>
  );
}
