export type TimetableStyleId =
  | "contemporary"
  | "chinese-dance"
  | "tango"
  | "yoga"
  | "tai-chi";

export type TimetableSlot = {
  id: string;
  label: string;
  startMinutes: number;
  endMinutes: number;
};

export type TimetableSession = {
  id: string;
  title: string;
  style: TimetableStyleId;
  /** 0 = Monday … 6 = Sunday */
  dayOfWeek: number;
  slotId: string;
  instructor?: string;
  level?: string;
  cancelledDates: string[];
};

export type TimetablePlacedClass = TimetableSession & {
  date: string;
  timeLabel: string;
  startMinutes: number;
  endMinutes: number;
  topPercent: number;
  heightPercent: number;
};
