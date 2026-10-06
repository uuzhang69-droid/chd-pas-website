"use client";

import { type ReactNode, useEffect, useMemo, useRef, useState } from "react";
import {
  CLASS_CALENDAR_DAYS,
  CLASS_CALENDAR_MONTHS,
  CLASS_CALENDAR_STYLE_COLOUR,
  computeWeekDates,
  londonToday,
  type ScheduleEntry,
  weekKeyFromDates,
  weekRangeLabel,
} from "@/lib/class-calendar/utils";
import { BookingOptionsDialog } from "@/components/timetable/BookingOptionsDialog";
import "./class-calendar.css";

const STYLE_FILTER_OPTIONS = [
  "Contemporary",
  "Chinese Dance",
  "Tango",
  "Yoga",
  "Tai Chi",
  "Broadway Jazz",
] as const;

const LOAD_ERROR_MESSAGE =
  "The published timetable could not be loaded. Use Upcoming dates & booking to continue to ClassManager.";

const EMPTY_FILTER_MESSAGE =
  "No sessions in this published timetable match your filters. Try another day or style, or check upcoming dates in ClassManager.";

export function ClassCalendar() {
  const sectionRef = useRef<HTMLElement>(null);
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [layout, setLayout] = useState<"week" | "list">("week");
  const [dayFilter, setDayFilter] = useState("all");
  const [styleFilter, setStyleFilter] = useState("all");
  const [weekDates, setWeekDates] = useState<Date[]>(() => computeWeekDates(londonToday()));
  const [weekKey, setWeekKey] = useState(() => weekKeyFromDates(computeWeekDates(londonToday())));
  const [loadState, setLoadState] = useState<"loading" | "ready" | "error">("loading");

  const weekRangeText = useMemo(() => {
    if (weekDates.length < 7) return "";
    return weekRangeLabel(weekDates[0], weekDates[6]);
  }, [weekDates]);

  const weekKeyRef = useRef(weekKey);
  weekKeyRef.current = weekKey;

  useEffect(() => {
    const dates = computeWeekDates(londonToday());
    setWeekDates(dates);
    setWeekKey(weekKeyFromDates(dates));
    const timer = window.setInterval(() => {
      const nextDates = computeWeekDates(londonToday());
      const nextKey = weekKeyFromDates(nextDates);
      if (nextKey !== weekKeyRef.current) {
        setWeekDates(nextDates);
        setWeekKey(nextKey);
      }
    }, 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  useEffect(() => {
    fetch("/schedule.json")
      .then((r) => {
        if (!r.ok) throw new Error();
        return r.json();
      })
      .then((d: { classes?: unknown }) => {
        if (!Array.isArray(d.classes)) throw new Error();
        setEntries(d.classes as ScheduleEntry[]);
        setLoadState("ready");
      })
      .catch(() => {
        setLoadState("error");
      });
  }, []);

  const visible = useMemo(() => {
    return entries.filter(
      (e) =>
        (dayFilter === "all" || e[0] === Number(dayFilter)) &&
        (styleFilter === "all" || e[4] === styleFilter),
    );
  }, [entries, dayFilter, styleFilter]);

  const resultCountText =
    loadState === "error"
      ? "Timetable unavailable"
      : `${visible.length} published sessions`;

  const gridClassName = useMemo(() => {
    const parts = ["calendar-grid"];
    if (layout === "list") parts.push("list-layout");
    if (dayFilter !== "all") parts.push("one-day");
    return parts.join(" ");
  }, [layout, dayFilter]);

  const dayColumns = useMemo(() => {
    if (loadState !== "ready") return null;

    if (!visible.length) {
      return <p className="calendar-empty">{EMPTY_FILTER_MESSAGE}</p>;
    }

    const columns: ReactNode[] = [];

    CLASS_CALENDAR_DAYS.forEach((name, i) => {
      if (dayFilter !== "all" && Number(dayFilter) !== i) return;
      const items = visible.filter((e) => e[0] === i);
      if (layout === "list" && !items.length) return;

      const date = weekDates[i];
      if (!date) return;
      const dayNum = date.getUTCDate();
      const month = CLASS_CALENDAR_MONTHS[date.getUTCMonth()];
      const year = date.getUTCFullYear();

      columns.push(
        <section className="calendar-day" key={name}>
          <h3>
            {name.slice(0, 3)} {dayNum}
          </h3>
          {!items.length ? (
            <p className="quiet">No listed sessions</p>
          ) : (
            items.map((e) => {
              const colourClass = CLASS_CALENDAR_STYLE_COLOUR[e[4]] ?? "";
              const bookLabel = `${e[3]} · published ${name} ${dayNum} ${month} ${year}, ${e[1]}–${e[2]}`;
              return (
                <button
                  key={`${e[0]}-${e[1]}-${e[3]}`}
                  type="button"
                  className={`session-card ${colourClass}`.trim()}
                  data-book={bookLabel}
                  aria-label={`${e[3]}, ${name} ${dayNum} ${month}, ${e[1]} to ${e[2]}. View upcoming booking options.`}
                >
                  <span className="session-time">
                    {e[1]}–{e[2]}
                  </span>
                  <strong>{e[3]}</strong>
                  <span className="session-action">Booking options ↗</span>
                </button>
              );
            })
          )}
        </section>,
      );
    });

    return columns;
  }, [dayFilter, layout, loadState, visible, weekDates]);

  return (
    <section className="class-calendar-section" ref={sectionRef}>
      <div className="calendar-panel">
        <div className="calendar-toolbar">
          <div>
            <h2>Class calendar</h2>
            <p>
              Published timetable · <span id="week-range">{weekRangeText}</span>
            </p>
          </div>
          <div className="view-buttons" role="group" aria-label="Timetable layout">
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
            Day
            <select
              id="day-filter"
              value={dayFilter}
              onChange={(e) => setDayFilter(e.target.value)}
            >
              <option value="all">All days</option>
              <option value="0">Monday</option>
              <option value="1">Tuesday</option>
              <option value="2">Wednesday</option>
              <option value="3">Thursday</option>
              <option value="4">Friday</option>
              <option value="5">Saturday</option>
              <option value="6">Sunday</option>
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

        <p className="calendar-disclaimer">
          Dated timetable from our website, not live availability. Check upcoming dates, prices and
          available places in ClassManager before booking.
        </p>

        <div id="calendar" className={gridClassName}>
          {loadState === "error" ? LOAD_ERROR_MESSAGE : dayColumns}
        </div>
        <noscript>
          Enable JavaScript to explore the timetable and membership choices. For help booking, email
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
