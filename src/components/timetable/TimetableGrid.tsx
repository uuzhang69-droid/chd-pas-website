"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildTimetableBookingHref } from "@/lib/timetable/booking-link";
import { buildTimetableColumns, overlappingSlotIds } from "@/lib/timetable/build-grid";
import {
  TIMETABLE_SLOTS,
  TIMETABLE_STYLE_ORDER,
  TIMETABLE_STYLES,
} from "@/lib/timetable/constants";
import type { TimetablePlacedClass, TimetableSession } from "@/lib/timetable/types";
import {
  addDays,
  formatIsoDate,
  formatWeekRange,
  getWeekDays,
  isSameWeek,
  parseWeekParam,
  startOfWeekMonday,
  WEEKDAY_FULL,
} from "@/lib/timetable/week";

export type TimetableGridUi = {
  title: string;
  description: string;
  prevWeek: string;
  thisWeek: string;
  nextWeek: string;
  goToDate: string;
  legend: string;
  venueNote: string;
};

type TimetableGridProps = {
  sessions: TimetableSession[];
  weekStartIso: string;
  ui: TimetableGridUi;
};

type HoverTarget = {
  dayIndex: number;
  slotIds: string[];
  classId: string;
};

function ClassBlock({
  placed,
  bookingHref,
  isHovered,
  onHover,
  onLeave,
}: {
  placed: TimetablePlacedClass;
  bookingHref: string;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  return (
    <Link
      href={bookingHref}
      aria-label={`Book ${placed.title}, ${placed.timeLabel}`}
      data-style={placed.style}
      className={`timetable-cell pointer-events-auto absolute inset-x-1 z-0 overflow-hidden rounded-sm border border-taupe/20 px-1.5 py-1 text-left transition-colors duration-150 hover:ring-2 hover:ring-rose/50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-rose sm:px-2 ${
        isHovered ? "is-hovered z-10" : ""
      }`}
      style={{
        top: `${placed.topPercent}%`,
        height: `calc(${placed.heightPercent}% - 2px)`,
      }}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <p className="text-small font-semibold leading-snug break-words text-inherit">
        {placed.title}
      </p>
      <p className="timetable-cell-meta mt-0.5 text-[11px] leading-snug text-charcoal/75 sm:text-xs">
        {placed.timeLabel}
        {placed.instructor ? ` · ${placed.instructor}` : ""}
      </p>
    </Link>
  );
}

export function TimetableGrid({ sessions, weekStartIso, ui }: TimetableGridProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [weekStart, setWeekStart] = useState(() =>
    parseWeekParam(weekStartIso) ?? startOfWeekMonday(new Date()),
  );
  const [hover, setHover] = useState<HoverTarget | null>(null);
  const [mobileDayIndex, setMobileDayIndex] = useState(0);
  const [pickerValue, setPickerValue] = useState(formatIsoDate(weekStart));

  useEffect(() => {
    const today = new Date();
    if (!isSameWeek(weekStart, today)) return;
    const jsDay = today.getDay();
    setMobileDayIndex(jsDay === 0 ? 6 : jsDay - 1);
  }, [weekStart]);

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const columns = useMemo(() => buildTimetableColumns(sessions, weekStart), [sessions, weekStart]);

  function navigateToWeek(date: Date) {
    const monday = startOfWeekMonday(date);
    const iso = formatIsoDate(monday);
    setWeekStart(monday);
    setPickerValue(iso);
    router.replace(`${pathname}?week=${iso}`, { scroll: false });
  }

  function goToPickerDate() {
    const parsed = parseWeekParam(pickerValue);
    if (parsed) navigateToWeek(parsed);
  }

  const isCurrentWeek = isSameWeek(weekStart, new Date());

  function renderDayColumn(dayIndex: number, key: string) {
    return (
      <div key={key} className="timetable-day-column relative overflow-hidden border-l border-taupe/20">
        {TIMETABLE_SLOTS.map((slot) => {
          const highlighted = hover?.slotIds.includes(slot.id) ?? false;
          return (
            <div
              key={slot.id}
              className={`timetable-day-row border-b border-taupe/20 ${
                highlighted ? "bg-rose/10" : ""
              }`}
            />
          );
        })}
        <div className="pointer-events-none absolute inset-0 z-[1]">
          {columns[dayIndex].map((placed) => {
            const day = weekDays[dayIndex];
            const bookingHref = buildTimetableBookingHref(
              placed,
              WEEKDAY_FULL[dayIndex],
              day.label,
            );
            return (
              <ClassBlock
                key={placed.id}
                placed={placed}
                bookingHref={bookingHref}
                isHovered={hover?.classId === placed.id}
                onHover={() =>
                  setHover({
                    dayIndex,
                    classId: placed.id,
                    slotIds: overlappingSlotIds(placed.startMinutes, placed.endMinutes),
                  })
                }
                onLeave={() => setHover(null)}
              />
            );
          })}
        </div>
      </div>
    );
  }

  return (
    <section className="border-b border-taupe/30 py-12 md:py-16" aria-labelledby="timetable-grid-heading">
      <div className="mx-auto w-full max-w-7xl px-5 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h2 id="timetable-grid-heading" className="text-h2 text-charcoal">
            {ui.title}
          </h2>
          <p className="text-body-lg mt-3 text-charcoal/75">{ui.description}</p>
        </div>

        <div className="mt-8 flex flex-col gap-4 lg:flex-row lg:flex-wrap lg:items-end lg:justify-between">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="rounded-sm border border-taupe/40 bg-ivory px-3 py-2 text-small font-medium text-charcoal transition-colors hover:border-rose hover:text-rose"
              onClick={() => navigateToWeek(addDays(weekStart, -7))}
            >
              {ui.prevWeek}
            </button>
            <button
              type="button"
              className={`rounded-sm border px-3 py-2 text-small font-medium transition-colors ${
                isCurrentWeek
                  ? "border-rose bg-rose/15 text-charcoal"
                  : "border-taupe/40 bg-ivory text-charcoal hover:border-rose hover:text-rose"
              }`}
              onClick={() => navigateToWeek(new Date())}
            >
              {ui.thisWeek}
            </button>
            <button
              type="button"
              className="rounded-sm border border-taupe/40 bg-ivory px-3 py-2 text-small font-medium text-charcoal transition-colors hover:border-rose hover:text-rose"
              onClick={() => navigateToWeek(addDays(weekStart, 7))}
            >
              {ui.nextWeek}
            </button>
          </div>

          <p className="text-body font-medium text-charcoal">{formatWeekRange(weekStart)}</p>

          <div className="flex flex-wrap items-center gap-2">
            <label htmlFor="timetable-go-to-date" className="text-small text-charcoal/75">
              {ui.goToDate}
            </label>
            <input
              id="timetable-go-to-date"
              type="date"
              value={pickerValue}
              onChange={(event) => setPickerValue(event.target.value)}
              className="rounded-sm border border-taupe/50 bg-ivory px-3 py-2 text-small text-charcoal outline-none focus:border-rose"
            />
            <button
              type="button"
              className="rounded-sm bg-burgundy px-3 py-2 text-small font-medium text-ivory"
              onClick={goToPickerDate}
            >
              Go
            </button>
          </div>
        </div>

        <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2" aria-label={ui.legend}>
          <li className="text-small font-semibold text-charcoal/70">{ui.legend}:</li>
          {TIMETABLE_STYLE_ORDER.map((styleId) => (
            <li key={styleId} className="flex items-center gap-2 text-small text-charcoal">
              <span
                className="timetable-swatch h-4 w-4 shrink-0 rounded-sm"
                data-style={styleId}
                aria-hidden
              />
              {TIMETABLE_STYLES[styleId].label}
            </li>
          ))}
        </ul>

        {/* Desktop grid */}
        <div className="mt-8 hidden rounded-sm border border-taupe/30 bg-ivory shadow-sm lg:block">
          <div className="overflow-x-auto">
            <div className="timetable-board min-w-[960px]">
              <div className="timetable-corner border-b border-r border-taupe/25 bg-blush/30" />
              {weekDays.map((day, dayIndex) => {
                const dayHighlighted = hover?.dayIndex === dayIndex;
                return (
                  <div
                    key={day.iso}
                    className={`border-b border-taupe/25 p-2 text-center ${
                      dayHighlighted ? "bg-rose/25 text-charcoal" : "bg-blush/30 text-charcoal"
                    }`}
                  >
                    <span className="block text-small font-semibold">{day.weekday}</span>
                    <span className="block text-xs text-charcoal/70">{day.label}</span>
                  </div>
                );
              })}

              <div className="timetable-time-axis">
                {TIMETABLE_SLOTS.map((slot) => {
                  const highlighted = hover?.slotIds.includes(slot.id) ?? false;
                  return (
                    <div
                      key={slot.id}
                      className={`flex items-center border-b border-r border-taupe/25 px-2 text-left text-small font-medium whitespace-nowrap last:border-b-0 ${
                        highlighted ? "bg-rose/25 text-charcoal" : "bg-blush/20 text-charcoal/80"
                      }`}
                    >
                      {slot.label}
                    </div>
                  );
                })}
              </div>

              {weekDays.map((day, dayIndex) => renderDayColumn(dayIndex, `${day.iso}-column`))}
            </div>
          </div>
        </div>

        {/* Mobile: one day at a time */}
        <div className="mt-8 lg:hidden">
          <div
            className="flex gap-1 overflow-x-auto pb-2"
            role="tablist"
            aria-label="Week days"
          >
            {weekDays.map((day, dayIndex) => (
              <button
                key={day.iso}
                type="button"
                role="tab"
                aria-selected={mobileDayIndex === dayIndex}
                className={`shrink-0 rounded-sm border px-3 py-2 text-small transition-colors ${
                  mobileDayIndex === dayIndex
                    ? "border-rose bg-rose/15 font-semibold text-charcoal"
                    : "border-taupe/35 bg-ivory text-charcoal/80"
                }`}
                onClick={() => setMobileDayIndex(dayIndex)}
              >
                <span className="block">{day.weekday}</span>
                <span className="block text-xs opacity-80">{day.label}</span>
              </button>
            ))}
          </div>

          <div className="mt-4 overflow-hidden rounded-sm border border-taupe/30 bg-ivory">
            <div className="timetable-board timetable-board-mobile">
              <div className="timetable-time-axis">
                {TIMETABLE_SLOTS.map((slot) => {
                  const highlighted = hover?.slotIds.includes(slot.id) ?? false;
                  return (
                    <div
                      key={slot.id}
                      className={`flex items-center border-b border-r border-taupe/25 px-2 text-small font-medium last:border-b-0 ${
                        highlighted ? "bg-rose/25" : "bg-blush/20"
                      }`}
                    >
                      {slot.label}
                    </div>
                  );
                })}
              </div>
              {renderDayColumn(mobileDayIndex, "mobile-day")}
            </div>
          </div>
        </div>

        <p className="text-body mt-6 max-w-3xl text-charcoal/75">{ui.venueNote}</p>
      </div>
    </section>
  );
}
