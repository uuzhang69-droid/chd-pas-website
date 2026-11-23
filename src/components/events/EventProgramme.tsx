import Link from "next/link";
import type { EventCard, EventSession } from "@/content/types";
import { siteContent } from "@/content/site";
import { spaceName, venueName, venueAddress, TIMETABLE_TIME_ZONE } from "@/content/venues";
import { programmeModel, type ProgrammeRowKey } from "@/lib/events/programme";

const longDate = (date: string) =>
  new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: TIMETABLE_TIME_ZONE }).format(
    new Date(`${date}T12:00:00Z`),
  );

/**
 * Programme for an event page.
 * - With `event` (the normal event page): one reusable rule set decides what is worth showing, see lib/events/programme.ts.
 *   Nothing is shown when the hero already says it all; details every session shares appear once.
 * - Without `event` (the concert series lists): every session keeps its full details.
 */
export function EventProgramme({
  sessions,
  event,
  heading,
  id = "event-programme",
  newestFirst = false,
}: {
  sessions: readonly EventSession[];
  event?: EventCard;
  /** Defaults to the shared Programme label. */
  heading?: string;
  id?: string;
  newestFirst?: boolean;
}) {
  const labels = siteContent.pages.events.detailLabels;
  if (event) return <EventProgrammeLean event={event} sessions={sessions} id={id} />;

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
          {session.date && <time dateTime={session.date}>{longDate(session.date)}</time>}
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

function EventProgrammeLean({ event, sessions, id }: { event: EventCard; sessions: readonly EventSession[]; id: string }) {
  const labels = siteContent.pages.events.detailLabels;
  const model = programmeModel(event, sessions);
  if (model.hidden) return null;
  const labelOf: Record<ProgrammeRowKey, string> = {
    location: labels.location,
    room: labels.room,
    organiser: labels.organiser,
    partners: labels.partners,
    hostedAt: labels.hostedAt,
    promotedBy: labels.promotedBy,
  };
  const when = (session: EventSession) =>
    session.allDay ? labels.allDay : session.start ? `${session.start}${session.end ? ` to ${session.end}` : ` · ${labels.endPending}`}` : labels.timePending;

  return <section className="mt-14" aria-labelledby={id}>
    <h2 id={id} className="text-h2 text-charcoal">{model.heading}</h2>
    {model.shared.length > 0 && <dl className="mt-5 grid gap-5 sm:grid-cols-2">
      {model.shared.map((row) => <div key={row.key}>
        <dt className="text-overline text-burgundy">{labelOf[row.key]}</dt>
        <dd className="text-body mt-1 text-charcoal/85">{row.value}</dd>
      </div>)}
    </dl>}
    <div className="mt-6 space-y-5">
      {model.items.map(({ session, showTitle, rows, showWhen }) => <article key={session.id} id={`session-${session.id}`} className="scroll-mt-28 rounded-sm border border-taupe/40 bg-white/50 p-5 md:p-7">
        {showWhen && <p className="text-overline text-burgundy">
          {session.date && <time dateTime={session.date}>{longDate(session.date)}</time>}
          {session.date ? " · " : ""}{when(session)}
        </p>}
        {showTitle && <h3 className={`text-h3 text-charcoal ${showWhen ? "mt-2" : ""}`}>{session.title}</h3>}
        {session.description?.map((paragraph, index) => <p key={index} className="text-body mt-3 text-charcoal/85">{paragraph}</p>)}
        {session.bookingUrl && <Link className="mt-4 inline-block text-burgundy underline underline-offset-4" href={session.bookingUrl}>{labels.booking}</Link>}
        {rows.length > 0 && <dl className="mt-4 grid gap-4 border-t border-taupe/40 pt-4 sm:grid-cols-2">
          {rows.map((row) => <div key={row.key}>
            <dt className="text-overline text-burgundy">{labelOf[row.key]}</dt>
            <dd className="text-body mt-1 text-charcoal/85">{row.value}</dd>
          </div>)}
        </dl>}
      </article>)}
    </div>
  </section>;
}
