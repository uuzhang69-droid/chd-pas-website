"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  CLASS_CALENDAR_DAYS,
  CLASS_CALENDAR_MONTHS,
  CLASS_CALENDAR_STYLE_COLOUR,
  computeWeekDates,
  londonToday,
  type ScheduleEntry,
  weekRangeLabel,
} from "@/lib/class-calendar/utils";
import { BookingOptionsDialog } from "@/components/timetable/BookingOptionsDialog";
import "./class-calendar.css";

type WeeklyClass = {
  day: number;
  start: string;
  end: string;
  name: string;
  style: string;
  startDate?: string;
  endDate?: string;
  cancelledDates?: string[];
};
type DatedClass = {
  date: string;
  start: string;
  end: string;
  name: string;
  style: string;
  cancelled?: boolean;
};
type Session = {
  date: string;
  day: number;
  start: string;
  end: string;
  name: string;
  style: string;
};
type ScheduleData = {
  classes: (ScheduleEntry | WeeklyClass)[];
  datedClasses?: DatedClass[];
};

const STYLE_FILTER_OPTIONS = [
  "Contemporary", "Chinese Dance", "Tango", "Yoga", "Tai Chi", "Broadway Jazz", "Performance",
] as const;
const LOAD_ERROR_MESSAGE = "The published timetable could not be loaded. Use Upcoming dates & booking to continue to ClassManager.";
const EMPTY_FILTER_MESSAGE = "No sessions in this period match your filters. Try another week or month, day or style, or check upcoming dates in ClassManager.";

function dateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function monthDates(date: Date): Date[] {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
  return Array.from({ length: count }, (_, i) => new Date(Date.UTC(year, month, i + 1)));
}

function weeklyObject(entry: ScheduleEntry | WeeklyClass): WeeklyClass {
  if (Array.isArray(entry)) {
    return { day: entry[0], start: entry[1], end: entry[2], name: entry[3], style: entry[4] };
  }
  return entry as WeeklyClass;
}

function sessionsForDates(data: ScheduleData, dates: Date[]): Session[] {
  const sessions: Session[] = [];
  for (const current of dates) {
    const date = dateKey(current);
    const day = (current.getUTCDay() + 6) % 7;
    for (const original of data.classes) {
      const item = weeklyObject(original);
      if (item.day !== day || (item.startDate && date < item.startDate) || (item.endDate && date > item.endDate)) continue;
      if (item.cancelledDates?.includes(date)) continue;
      sessions.push({ date, day, start: item.start, end: item.end, name: item.name, style: item.style });
    }
    for (const item of data.datedClasses ?? []) {
      if (item.cancelled || item.date !== date) continue;
      sessions.push({ date, day, start: item.start, end: item.end, name: item.name, style: item.style });
    }
  }
  return sessions.sort((a, b) => a.date.localeCompare(b.date) || a.start.localeCompare(b.start) || a.name.localeCompare(b.name));
}

export function ClassCalendar() {
  const sectionRef = useRef<HTMLElement>(null);
  const [schedule, setSchedule] = useState<ScheduleData>({ classes: [], datedClasses: [] });
  const [layout, setLayout] = useState<"week" | "month" | "list">("week");
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

  const visible = useMemo(() => sessionsForDates(schedule, displayDates).filter((e) =>
    (dayFilter === "all" || e.day === Number(dayFilter)) &&
    (styleFilter === "all" || e.style === styleFilter)
  ), [schedule, displayDates, dayFilter, styleFilter]);

  const resultCountText = loadState === "error" ? "Timetable unavailable" :
    loadState === "loading" ? "Loading timetable…" : `${visible.length} published sessions`;

  const gridClassName = useMemo(() => {
    const parts = ["calendar-grid"];
    if (layout === "list") parts.push("list-layout");
    if (layout === "month") parts.push("month-layout");
    if (dayFilter !== "all") parts.push("one-day");
    return parts.join(" ");
  }, [layout, dayFilter]);

  const dayColumns = useMemo(() => {
    if (loadState !== "ready") return null;
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
          {items.map((e, index) => {
            const colourClass = CLASS_CALENDAR_STYLE_COLOUR[e.style] ?? "";
            const bookLabel = `${e.name} · published ${name} ${dayNum} ${month} ${year}, ${e.start}–${e.end}`;
            return (
              <button
                key={`${e.date}-${e.start}-${e.end}-${e.name}-${index}`}
                type="button"
                className={`session-card ${colourClass}`.trim()}
                data-book={bookLabel}
                aria-label={`${e.name}, ${name} ${dayNum} ${month}, ${e.start} to ${e.end}. View upcoming booking options.`}
              >
                <span className="session-time">{e.start}–{e.end}</span>
                <strong>{e.name}</strong>
                <span className="session-action">Booking options ↗</span>
              </button>
            );
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
            <h2>Class calendar</h2>
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

        <p className="calendar-disclaimer">
          Dated timetable from our website, not live availability. Check upcoming dates, prices and available places in ClassManager before booking.
        </p>
        <div id="calendar" className={gridClassName}>
          {loadState === "error" ? LOAD_ERROR_MESSAGE : dayColumns}
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
