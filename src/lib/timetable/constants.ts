import type { TimetableSlot, TimetableStyleId } from "./types";

function minutes(hours: number, mins: number): number {
  return hours * 60 + mins;
}

export const TIMETABLE_GRID_START = minutes(10, 30);
export const TIMETABLE_GRID_END = minutes(21, 30);
export const TIMETABLE_ROW_MINUTES = 120;

export const TIMETABLE_SLOTS: TimetableSlot[] = [
  { id: "row-1030", label: "10:30 – 12:30", startMinutes: minutes(10, 30), endMinutes: minutes(12, 30) },
  { id: "row-1230", label: "12:30 – 14:30", startMinutes: minutes(12, 30), endMinutes: minutes(14, 30) },
  { id: "row-1430", label: "14:30 – 16:30", startMinutes: minutes(14, 30), endMinutes: minutes(16, 30) },
  { id: "row-1630", label: "16:30 – 18:30", startMinutes: minutes(16, 30), endMinutes: minutes(18, 30) },
  { id: "row-1830", label: "18:30 – 20:30", startMinutes: minutes(18, 30), endMinutes: minutes(20, 30) },
  { id: "row-2030", label: "20:30 – 21:30", startMinutes: minutes(20, 30), endMinutes: minutes(21, 30) },
];

export const CLASS_SLOT_TIMES: Record<
  string,
  { startMinutes: number; endMinutes: number; timeLabel: string }
> = {
  "slot-1030-1200": {
    startMinutes: minutes(10, 30),
    endMinutes: minutes(12, 0),
    timeLabel: "10:30 am – 12:00 pm",
  },
  "slot-1230-1320": {
    startMinutes: minutes(12, 30),
    endMinutes: minutes(13, 20),
    timeLabel: "12:30 – 1:20 pm",
  },
  "slot-1530-1700": {
    startMinutes: minutes(15, 30),
    endMinutes: minutes(17, 0),
    timeLabel: "3:30 – 5:00 pm",
  },
  "slot-1530-1730": {
    startMinutes: minutes(15, 30),
    endMinutes: minutes(17, 30),
    timeLabel: "3:30 – 5:30 pm",
  },
  "slot-1830-1920": {
    startMinutes: minutes(18, 30),
    endMinutes: minutes(19, 20),
    timeLabel: "6:30 – 7:20 pm",
  },
  "slot-1830-1930": {
    startMinutes: minutes(18, 30),
    endMinutes: minutes(19, 30),
    timeLabel: "6:30 – 7:30 pm",
  },
  "slot-1830-2000": {
    startMinutes: minutes(18, 30),
    endMinutes: minutes(20, 0),
    timeLabel: "6:30 – 8:00 pm",
  },
  "slot-1900-2000": {
    startMinutes: minutes(19, 0),
    endMinutes: minutes(20, 0),
    timeLabel: "7:00 – 8:00 pm",
  },
  "slot-1930-2030": {
    startMinutes: minutes(19, 30),
    endMinutes: minutes(20, 30),
    timeLabel: "7:30 – 8:30 pm",
  },
  "slot-1930-2040": {
    startMinutes: minutes(19, 30),
    endMinutes: minutes(20, 40),
    timeLabel: "7:30 – 8:40 pm",
  },
  "slot-2000-2130": {
    startMinutes: minutes(20, 0),
    endMinutes: minutes(21, 30),
    timeLabel: "8:00 – 9:30 pm",
  },
  "slot-2000-2300": {
    startMinutes: minutes(20, 0),
    endMinutes: minutes(23, 0),
    timeLabel: "8:00 – 11:00 pm",
  },
  "slot-2030-2130": {
    startMinutes: minutes(20, 30),
    endMinutes: minutes(21, 30),
    timeLabel: "8:30 – 9:30 pm",
  },
};

export const TIMETABLE_STYLE_ORDER: TimetableStyleId[] = [
  "contemporary",
  "chinese-dance",
  "tango",
  "yoga",
  "tai-chi",
];

export const TIMETABLE_STYLES: Record<TimetableStyleId, { label: string }> = {
  contemporary: { label: "Contemporary" },
  "chinese-dance": { label: "Chinese Dance" },
  tango: { label: "Tango" },
  yoga: { label: "Yoga" },
  "tai-chi": { label: "Tai Chi" },
};
