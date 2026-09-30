import {
  CLASS_SLOT_TIMES,
  TIMETABLE_GRID_END,
  TIMETABLE_GRID_START,
  TIMETABLE_SLOTS,
} from "./constants";
import type { TimetablePlacedClass, TimetableSession } from "./types";
import { addDays, formatIsoDate } from "./week";

const GRID_SPAN = TIMETABLE_GRID_END - TIMETABLE_GRID_START;

export function overlappingSlotIds(startMinutes: number, endMinutes: number): string[] {
  return TIMETABLE_SLOTS.filter(
    (slot) => startMinutes < slot.endMinutes && endMinutes > slot.startMinutes,
  ).map((slot) => slot.id);
}

export function buildTimetableColumns(
  sessions: TimetableSession[],
  weekStart: Date,
): TimetablePlacedClass[][] {
  const columns: TimetablePlacedClass[][] = Array.from({ length: 7 }, () => []);

  for (const session of sessions) {
    if (session.dayOfWeek < 0 || session.dayOfWeek > 6) continue;

    const times = CLASS_SLOT_TIMES[session.slotId];
    if (!times) continue;

    const date = formatIsoDate(addDays(weekStart, session.dayOfWeek));
    if (session.cancelledDates.includes(date)) continue;

    const startMinutes = times.startMinutes;
    const endMinutes = Math.min(times.endMinutes, TIMETABLE_GRID_END);
    if (endMinutes <= TIMETABLE_GRID_START || startMinutes >= TIMETABLE_GRID_END) continue;

    const clampedStart = Math.max(startMinutes, TIMETABLE_GRID_START);
    const duration = endMinutes - clampedStart;
    if (duration <= 0) continue;

    columns[session.dayOfWeek].push({
      ...session,
      date,
      timeLabel: times.timeLabel,
      startMinutes,
      endMinutes: times.endMinutes,
      topPercent: ((clampedStart - TIMETABLE_GRID_START) / GRID_SPAN) * 100,
      heightPercent: (duration / GRID_SPAN) * 100,
    });
  }

  for (const column of columns) {
    column.sort((a, b) => a.startMinutes - b.startMinutes);
  }

  return columns;
}
