import { siteContent } from "@/content/site";
import { TimetableGrid } from "@/components/timetable/TimetableGrid";
import { fetchTimetableSessions } from "@/lib/timetable/fetch-sessions";

const { timetable } = siteContent.pages;

type HomeTimetableProps = {
  weekStartIso: string;
};

export async function HomeTimetable({ weekStartIso }: HomeTimetableProps) {
  const sessions = await fetchTimetableSessions();

  return (
    <TimetableGrid
      sessions={sessions}
      weekStartIso={weekStartIso}
      ui={{
        title: timetable.booking.title,
        description: timetable.booking.description,
        prevWeek: timetable.grid.prevWeek,
        thisWeek: timetable.grid.thisWeek,
        nextWeek: timetable.grid.nextWeek,
        goToDate: timetable.grid.goToDate,
        legend: timetable.grid.legend,
        venueNote: timetable.grid.venueNote,
      }}
    />
  );
}
