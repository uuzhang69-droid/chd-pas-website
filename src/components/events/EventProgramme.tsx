import Link from "next/link";
import type { EventSession } from "@/content/types";
import { siteContent } from "@/content/site";
import { spaceName, venueName, venueAddress, TIMETABLE_TIME_ZONE } from "@/content/venues";

export function EventProgramme({ sessions }: { sessions: readonly EventSession[] }) {
  const labels = siteContent.pages.events.detailLabels;
  const visible = sessions.filter((session) => session.published === true && !session.cancelled && !session.private)
    .toSorted((a, b) => (a.date ?? "9999").localeCompare(b.date ?? "9999") || (a.start ?? "").localeCompare(b.start ?? ""));
  if (!visible.length) return null;
  return <section className="mt-10 space-y-6" aria-labelledby="event-programme">
    <h2 id="event-programme" className="text-h3 text-charcoal">{labels.programme}</h2>
    {visible.map((session) => {
      const venue = venueName(session.venueId);
      const details = [
        [labels.location, venue ? [venue, venueAddress(session.venueId)].filter(Boolean).join(", ") : labels.venuePending],
        [labels.room, spaceName(session.spaceId, session.venueId)],
        [labels.organiser, session.organiser],
        [labels.partners, session.partners?.join(", ")],
        [labels.hostedAt, session.relationship === "hosted" ? venue : undefined],
        [labels.promotedBy, session.promotedBy],
      ].filter(([, value]) => Boolean(value));
      return <article key={session.id} id={`session-${session.id}`} className="scroll-mt-28 rounded-sm border border-taupe/30 p-6">
        <p className="text-overline text-rose">
          {session.date && <time dateTime={session.date}>{new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TIMETABLE_TIME_ZONE }).format(new Date(`${session.date}T12:00:00Z`))}</time>}
          {session.date ? " · " : ""}{session.start ? `${session.start}${session.end ? `–${session.end}` : ` · ${labels.endPending}`}` : labels.timePending}
        </p>
        <h3 className="text-h3 mt-2 text-charcoal">{session.title}</h3>
        {session.description?.map((paragraph, index) => <p key={index} className="text-body mt-4 text-charcoal/75">{paragraph}</p>)}
        {session.bookingUrl && <Link className="mt-4 inline-block text-rose underline" href={session.bookingUrl}>{labels.booking}</Link>}
        <dl className="mt-6 grid gap-4 border-t border-taupe/30 pt-4 sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label}>
            <dt className="text-overline text-rose">{label}</dt><dd className="text-body mt-1 text-charcoal/75">{value}</dd>
          </div>)}
        </dl>
      </article>;
    })}
  </section>;
}
