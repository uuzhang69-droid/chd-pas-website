import { siteContent } from "@/content/site";
import { eventSessions } from "@/content/event-sessions";
import { schoolEventSessions } from "@/lib/class-calendar/sessions";
import { ClassCalendar } from "./ClassCalendar";

/** Server boundary: send only published school sessions and anonymised occupancy to the client. */
export function Timetable() {
  return <ClassCalendar eventSessions={schoolEventSessions(siteContent.pages.events.items, eventSessions.filter((session) => session.private))} />;
}
