import type { TimetableSlot, TimetableStyleId } from "./types";

export const TIMETABLE_SLOTS: TimetableSlot[] = [
  { id: "slot-1030-1200", label: "10:30 am – 12:00 pm" },
  { id: "slot-1230-1320", label: "12:30 – 1:20 pm" },
  { id: "slot-1830-1920", label: "6:30 – 7:20 pm" },
  { id: "slot-1830-1930", label: "6:30 – 7:30 pm" },
  { id: "slot-1830-2000", label: "6:30 – 8:00 pm" },
  { id: "slot-1900-2000", label: "7:00 – 8:00 pm" },
  { id: "slot-1930-2030", label: "7:30 – 8:30 pm" },
  { id: "slot-1930-2040", label: "7:30 – 8:40 pm" },
  { id: "slot-2000-2130", label: "8:00 – 9:30 pm" },
  { id: "slot-2000-2300", label: "8:00 – 11:00 pm" },
  { id: "slot-2030-2130", label: "8:30 – 9:30 pm" },
];

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
