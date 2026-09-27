import type { TimetableSlot, TimetableStyleId } from "./types";

export const TIMETABLE_SLOTS: TimetableSlot[] = [
  { id: "slot-1", label: "10:00 – 11:00" },
  { id: "slot-2", label: "11:15 – 12:15" },
  { id: "slot-3", label: "12:30 – 13:30" },
  { id: "slot-4", label: "17:00 – 18:00" },
  { id: "slot-5", label: "18:15 – 19:15" },
  { id: "slot-6", label: "19:30 – 20:30" },
];

export const TIMETABLE_STYLE_ORDER: TimetableStyleId[] = [
  "contemporary",
  "chinese-dance",
  "tango",
  "yoga",
  "tai-chi",
  "k-pop",
];

export const TIMETABLE_STYLES: Record<TimetableStyleId, { label: string }> = {
  contemporary: { label: "Contemporary" },
  "chinese-dance": { label: "Chinese Dance" },
  tango: { label: "Tango" },
  yoga: { label: "Yoga" },
  "tai-chi": { label: "Tai Chi" },
  "k-pop": { label: "K-Pop" },
};
