export type ClassDay = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";

export type ClassDiscipline =
  | "Yoga"
  | "Tai Chi"
  | "Contemporary"
  | "Tango"
  | "Sound Healing"
  | "Chinese Dance";

export type TesterClass = {
  id: string;
  title: string;
  day: ClassDay;
  startTime: string;
  endTime: string;
  dateRange: string;
  ageGroup: string;
  location: string;
  price: number;
  discipline: ClassDiscipline;
  level?: string;
  imageUrl: string;
  bookingUrl: string;
  sortOrder?: number;
};

export const DEFAULT_BOOKING_URL =
  "https://my.classmanager.com/county-hall-dance-centre/classes?mode=enrol";

export const CLASS_DAYS: ClassDay[] = [
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Sat",
  "Sun",
];

export const CLASS_DISCIPLINES: ClassDiscipline[] = [
  "Yoga",
  "Tai Chi",
  "Contemporary",
  "Tango",
  "Sound Healing",
  "Chinese Dance",
];
