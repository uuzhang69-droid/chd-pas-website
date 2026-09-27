const WEEKDAY_SHORT = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;
const MONTH_SHORT = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

function formatDayMonth(date: Date, withYear = false): string {
  const label = `${date.getDate()} ${MONTH_SHORT[date.getMonth()]}`;
  return withYear ? `${label} ${date.getFullYear()}` : label;
}

export function startOfWeekMonday(date: Date): Date {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d;
}

export function formatIsoDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function parseWeekParam(value: string | undefined): Date | null {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const parsed = new Date(`${value}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return null;
  return startOfWeekMonday(parsed);
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function getWeekDays(weekStart: Date): { date: Date; iso: string; weekday: string; label: string }[] {
  return Array.from({ length: 7 }, (_, index) => {
    const date = addDays(weekStart, index);
    const iso = formatIsoDate(date);
    const weekday = WEEKDAY_SHORT[index];
    const label = formatDayMonth(date);
    return { date, iso, weekday, label };
  });
}

export function isSameWeek(a: Date, b: Date): boolean {
  return formatIsoDate(startOfWeekMonday(a)) === formatIsoDate(startOfWeekMonday(b));
}

export function formatWeekRange(weekStart: Date): string {
  const end = addDays(weekStart, 6);
  return `${formatDayMonth(weekStart)} – ${formatDayMonth(end, true)}`;
}
