import Link from "next/link";
import type { EventSession } from "@/content/types";
import { siteContent } from "@/content/site";
import { spaceName, venueName, venueAddress, TIMETABLE_TIME_ZONE } from "@/content/venues";

export function EventProgramme({
  sessions,
  heading,
  id = "event-programme",
  newestFirst = false,
}: {
  sessions: readonly EventSession[];
  /** Defaults to the shared Programme label. */
  heading?: string;
  id?: string;
  newestFirst?: boolean;
}) {
  const labels = siteContent.pages.events.detailLabels;
  const visible = sessions.filter((session) => session.published === true && !session.cancelled && !session.private)
    .toSorted((a, b) => {
      const order = (a.date ?? "9999").localeCompare(b.date ?? "9999") || (a.start ?? "").localeCompare(b.start ?? "");
      return newestFirst ? -order : order;
    });
  if (!visible.length) return null;
  return <section className="mt-14 space-y-7" aria-labelledby={id}>
    <h2 id={id} className="text-h2 text-charcoal">{heading ?? labels.programme}</h2>
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
      return <article key={session.id} id={`session-${session.id}`} className="scroll-mt-28 rounded-sm border border-taupe/40 bg-white/50 p-6 md:p-9">
        <p className="text-overline text-burgundy">
          {session.date && <time dateTime={session.date}>{new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TIMETABLE_TIME_ZONE }).format(new Date(`${session.date}T12:00:00Z`))}</time>}
          {session.date ? " · " : ""}{session.allDay ? labels.allDay : session.start ? `${session.start}${session.end ? ` to ${session.end}` : ` · ${labels.endPending}`}` : labels.timePending}
        </p>
        <h3 className="text-h2 mt-3 text-charcoal">{session.title}</h3>
        {session.description?.map((paragraph, index) => <p key={index} className="text-body-lg mt-5 text-charcoal/85">{paragraph}</p>)}
        {session.bookingUrl && <Link className="mt-5 inline-block text-burgundy underline underline-offset-4" href={session.bookingUrl}>{labels.booking}</Link>}
        <dl className="mt-7 grid gap-5 border-t border-taupe/40 pt-5 sm:grid-cols-2">
          {details.map(([label, value]) => <div key={label}>
            <dt className="text-overline text-burgundy">{label}</dt><dd className="text-body mt-1 text-charcoal/85">{value}</dd>
          </div>)}
        </dl>
      </article>;
    })}
  </section>;
}
