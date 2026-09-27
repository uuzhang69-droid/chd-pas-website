import { TIMETABLE_SLOTS } from "./constants";
import type { TimetableCell, TimetableSession } from "./types";
import { addDays, formatIsoDate } from "./week";

export function buildTimetableGrid(
  sessions: TimetableSession[],
  weekStart: Date,
): Record<string, Record<number, TimetableCell | null>> {
  const grid: Record<string, Record<number, TimetableCell | null>> = {};

  for (const slot of TIMETABLE_SLOTS) {
    grid[slot.id] = {};
    for (let dayIndex = 0; dayIndex < 7; dayIndex += 1) {
      grid[slot.id][dayIndex] = null;
    }
  }

  for (const session of sessions) {
    if (session.dayOfWeek < 0 || session.dayOfWeek > 6) continue;
    const date = formatIsoDate(addDays(weekStart, session.dayOfWeek));
    if (session.cancelledDates.includes(date)) continue;

    const slotRow = grid[session.slotId];
    if (!slotRow) continue;

    slotRow[session.dayOfWeek] = { ...session, date };
  }

  return grid;
}
