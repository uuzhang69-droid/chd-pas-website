export type ScheduleEntry = [dayIndex: number, start: string, end: string, displayName: string, style: string];

export const CLASS_CALENDAR_DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const;

export const CLASS_CALENDAR_MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const CLASS_CALENDAR_STYLE_COLOUR: Record<string, string> = {
  Yoga: "blue",
  Tango: "purple",
  "Chinese Dance": "green",
  Contemporary: "pink",
  "Broadway Jazz": "gold",
  "Tai Chi": "pink",
};

export const CLASS_MANAGER_BOOKING_URL =
  "https://my.classmanager.com/county-hall-dance-centre/classes?mode=enrol&seasonIds=sea_01m2vbexkdhdt8emvdmrdgbttq&courseTypes=enrolment";

export function londonToday(): Date {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  return new Date(Date.UTC(get("year"), get("month") - 1, get("day")));
}

export function computeWeekDates(today: Date): Date[] {
  const monday = new Date(today);
  monday.setUTCDate(today.getUTCDate() - ((today.getUTCDay() + 6) % 7));
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setUTCDate(monday.getUTCDate() + i);
    return d;
  });
}

export function weekRangeLabel(a: Date, b: Date): string {
  const dA = a.getUTCDate();
  const mA = CLASS_CALENDAR_MONTHS[a.getUTCMonth()];
  const yA = a.getUTCFullYear();
  const dB = b.getUTCDate();
  const mB = CLASS_CALENDAR_MONTHS[b.getUTCMonth()];
  const yB = b.getUTCFullYear();
  if (yA !== yB) return `${dA} ${mA} ${yA} – ${dB} ${mB} ${yB}`;
  if (mA !== mB) return `${dA} ${mA} – ${dB} ${mB} ${yB}`;
  return `${dA}–${dB} ${mB} ${yB}`;
}

export function weekKeyFromDates(weekDates: Date[]): string {
  return weekDates[0]?.toISOString().slice(0, 10) ?? "";
}
