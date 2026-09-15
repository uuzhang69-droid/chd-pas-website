import type { ClassDay, TesterClass } from "@/lib/tester-classes/types";

const DAY_ORDER: Record<ClassDay, number> = {
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
  Sun: 7,
};

function parseTimeLabel(value: string): number {
  const match = value.trim().match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
  if (!match) return Number.MAX_SAFE_INTEGER;

  let hours = Number.parseInt(match[1], 10);
  const minutes = Number.parseInt(match[2], 10);
  const meridiem = match[3].toLowerCase();

  if (meridiem === "pm" && hours !== 12) hours += 12;
  if (meridiem === "am" && hours === 12) hours = 0;

  return hours * 60 + minutes;
}

export function sortTesterClasses(classes: TesterClass[]): TesterClass[] {
  return [...classes].sort((a, b) => {
    const dayDiff = DAY_ORDER[a.day] - DAY_ORDER[b.day];
    if (dayDiff !== 0) return dayDiff;

    if (a.sortOrder != null && b.sortOrder != null && a.sortOrder !== b.sortOrder) {
      return a.sortOrder - b.sortOrder;
    }

    return parseTimeLabel(a.startTime) - parseTimeLabel(b.startTime);
  });
}
