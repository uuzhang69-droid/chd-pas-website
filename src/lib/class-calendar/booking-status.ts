export type SessionTiming = { date: string; start: string; end: string };
export type SessionStatus = "upcoming" | "ongoing" | "ended" | "unknown";

/** Compare local wall-clock values in London, independent of the visitor's timezone. */
export function sessionStatus(session: SessionTiming, now: Date): SessionStatus {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(session.date)) return "unknown";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/London", year: "numeric", month: "2-digit", day: "2-digit",
    hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  const date = `${get("year")}-${get("month")}-${get("day")}`;
  if (date > session.date) return "ended";
  const validTime = (time: string) => /^(?:[01]\d|2[0-3]):[0-5]\d$/.test(time);
  if (!validTime(session.start) || !validTime(session.end) || session.end <= session.start) return "unknown";
  if (date < session.date) return "upcoming";
  const time = `${get("hour")}:${get("minute")}:${get("second")}`;
  if (time >= `${session.end}:00`) return "ended";
  return time >= `${session.start}:00` ? "ongoing" : "upcoming";
}

/** Late booking is not confirmed. Only offer session-specific booking before its start. */
export function canBookSession(session: SessionTiming, now: Date): boolean {
  return sessionStatus(session, now) === "upcoming";
}
