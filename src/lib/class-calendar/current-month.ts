import { computeWeekDates } from "./utils";

export function londonDateKey(now: Date): string {
    const parts = new Intl.DateTimeFormat("en-GB", {
        timeZone: "Europe/London",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
    }).formatToParts(now);
    const part = (type: string) =>
        parts.find((item) => item.type === type)!.value;
    return `${part("year")}-${part("month")}-${part("day")}`;
}

/** Week is the current London week clipped to this month; Month/List use this month only. */
export function currentMonthDates(
    day: string,
    layout: "week" | "month" | "list",
): Date[] {
    const today = new Date(`${day}T00:00:00Z`);
    if (layout === "week") {
        return computeWeekDates(today).filter(
            (date) => date.toISOString().slice(0, 7) === day.slice(0, 7),
        );
    }
    const year = today.getUTCFullYear();
    const month = today.getUTCMonth();
    const count = new Date(Date.UTC(year, month + 1, 0)).getUTCDate();
    return Array.from(
        { length: count },
        (_, index) => new Date(Date.UTC(year, month, index + 1)),
    );
}
