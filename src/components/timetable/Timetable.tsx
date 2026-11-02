import { siteContent } from "@/content/site";
import { eventSessions } from "@/content/event-sessions";
import { schoolEventSessions } from "@/lib/class-calendar/sessions";
import { ClassCalendar } from "./ClassCalendar";
import { connection } from "next/server";
import { ServerTimeProvider } from "@/lib/class-calendar/use-now";

/** Server boundary: send only published school sessions and anonymised occupancy to the client. */
export async function Timetable() {
    await connection();
    // Request-time Server Component: intentionally capture the server clock after connection().
    // eslint-disable-next-line react-hooks/purity
    const initialTime = Date.now();
    return (
        <ServerTimeProvider initialTime={initialTime}>
            <ClassCalendar
                eventSessions={schoolEventSessions(
                    siteContent.pages.events.items,
                    eventSessions.filter((session) => session.private),
                )}
            />
        </ServerTimeProvider>
    );
}
