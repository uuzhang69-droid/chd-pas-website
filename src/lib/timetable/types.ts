export type TimetableStyleId =
  | "contemporary"
  | "chinese-dance"
  | "tango"
  | "yoga"
  | "tai-chi"
  | "k-pop";

export type TimetableSlot = {
  id: string;
  label: string;
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

export type TimetableCell = TimetableSession & {
  date: string;
};
