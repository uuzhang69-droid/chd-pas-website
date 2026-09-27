"use client";

import { useMemo, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { buildTimetableGrid } from "@/lib/timetable/build-grid";
import {
  TIMETABLE_SLOTS,
  TIMETABLE_STYLE_ORDER,
  TIMETABLE_STYLES,
} from "@/lib/timetable/constants";
import type { TimetableCell, TimetableSession } from "@/lib/timetable/types";
import {
  addDays,
  formatIsoDate,
  formatWeekRange,
  getWeekDays,
  isSameWeek,
  parseWeekParam,
  startOfWeekMonday,
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
  slotId: string;
};

function ClassCell({
  cell,
  isHovered,
  onHover,
  onLeave,
}: {
  cell: TimetableCell | null;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
}) {
  const cellShellClass =
    "box-border flex h-full min-h-[5.5rem] w-full flex-col justify-center overflow-hidden border border-taupe/20 px-2 py-2 sm:min-h-[5.5rem] sm:px-3 sm:py-3";

  if (!cell) {
    return (
      <div
        className={`${cellShellClass} bg-ivory/50 border-taupe/15`}
        onMouseEnter={onLeave}
      />
    );
  }

  return (
    <div
      role="presentation"
      data-style={cell.style}
      className={`timetable-cell ${cellShellClass} text-left transition-colors duration-150 ${
        isHovered ? "is-hovered" : ""
      }`}
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
    >
      <p className="text-small font-semibold leading-snug break-words text-inherit">{cell.title}</p>
      {(cell.level || cell.instructor) && (
        <p className="timetable-cell-meta mt-1 text-[11px] leading-snug text-charcoal/75 sm:text-xs">
          {[cell.level, cell.instructor].filter(Boolean).join(" · ")}
        </p>
      )}
    </div>
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

  const weekDays = useMemo(() => getWeekDays(weekStart), [weekStart]);
  const grid = useMemo(() => buildTimetableGrid(sessions, weekStart), [sessions, weekStart]);

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
        <div className="mt-8 hidden overflow-hidden rounded-sm border border-taupe/30 bg-ivory shadow-sm lg:block">
          <div className="overflow-x-auto">
          <table className="timetable-grid w-full min-w-[880px] table-fixed border-collapse">
            <colgroup>
              <col className="w-28" />
              {weekDays.map((day) => (
                <col key={day.iso} />
              ))}
            </colgroup>
            <thead>
              <tr>
                <th className="border border-taupe/25 bg-blush/30 p-2" scope="col" />
                {weekDays.map((day, dayIndex) => {
                  const dayHighlighted = hover?.dayIndex === dayIndex;
                  return (
                    <th
                      key={day.iso}
                      scope="col"
                      className={`border border-taupe/25 p-2 text-center transition-colors ${
                        dayHighlighted ? "bg-rose/25 text-charcoal" : "bg-blush/30 text-charcoal"
                      }`}
                    >
                      <span className="block text-small font-semibold">{day.weekday}</span>
                      <span className="block text-xs text-charcoal/70">{day.label}</span>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {TIMETABLE_SLOTS.map((slot) => {
                const slotHighlighted = hover?.slotId === slot.id;
                return (
                  <tr key={slot.id}>
                    <th
                      scope="row"
                      className={`h-full border border-taupe/25 px-2 py-3 text-left text-small font-medium transition-colors ${
                        slotHighlighted ? "bg-rose/25 text-charcoal" : "bg-blush/20 text-charcoal/80"
                      }`}
                    >
                      {slot.label}
                    </th>
                    {weekDays.map((day, dayIndex) => {
                      const cell = grid[slot.id]?.[dayIndex] ?? null;
                      const isHovered =
                        hover?.dayIndex === dayIndex && hover?.slotId === slot.id;
                      return (
                        <td key={`${slot.id}-${day.iso}`} className="h-full p-0 align-stretch">
                          <ClassCell
                            cell={cell}
                            isHovered={isHovered}
                            onHover={() => setHover({ dayIndex, slotId: slot.id })}
                            onLeave={() => setHover(null)}
                          />
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
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
            {TIMETABLE_SLOTS.map((slot) => {
              const cell = grid[slot.id]?.[mobileDayIndex] ?? null;
              const isHovered =
                hover?.dayIndex === mobileDayIndex && hover?.slotId === slot.id;
              return (
                <div
                  key={slot.id}
                  className="grid min-h-[5.5rem] grid-cols-[7.5rem_1fr] border-b border-taupe/20 last:border-b-0"
                >
                  <div
                    className={`flex h-full min-h-[5.5rem] items-center border-r border-taupe/25 px-2 py-2 text-small font-medium ${
                      hover?.slotId === slot.id ? "bg-rose/25" : "bg-blush/20"
                    }`}
                  >
                    {slot.label}
                  </div>
                  <ClassCell
                    cell={cell}
                    isHovered={isHovered}
                    onHover={() => setHover({ dayIndex: mobileDayIndex, slotId: slot.id })}
                    onLeave={() => setHover(null)}
                  />
                </div>
              );
            })}
          </div>
        </div>

        <p className="text-body mt-6 max-w-3xl text-charcoal/75">{ui.venueNote}</p>
      </div>
    </section>
  );
}
