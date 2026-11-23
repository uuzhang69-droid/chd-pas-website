import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { EventCard, EventSession, ShowPageContent } from "@/content/types";
import { TIMETABLE_TIME_ZONE } from "@/content/venues";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { HeroBackLink } from "@/components/ui/HeroParts";

type ChristmasShowPageProps = {
    event: EventCard;
    show: ShowPageContent;
};

const weekdayFormat = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: TIMETABLE_TIME_ZONE });
const restFormat = new Intl.DateTimeFormat("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: TIMETABLE_TIME_ZONE });

/** "2026-12-05" to "Saturday, 5 December 2026". */
function dateLabel(iso: string): string {
    const noon = new Date(`${iso}T12:00:00Z`);
    return `${weekdayFormat.format(noon)}, ${restFormat.format(noon)}`;
}

/** Plain text with **bold** phrases. The words are the organiser's; only the emphasis is marked. */
function RichText({ text }: { text: string }) {
    return (
        <>
            {text.split("**").map((part, index) =>
                index % 2 === 1 ? (
                    <strong key={index} className="font-semibold text-charcoal">
                        {part}
                    </strong>
                ) : (
                    part
                ),
            )}
        </>
    );
}

function Paragraphs({
    items,
    small = false,
}: {
    items: string[];
    small?: boolean;
}) {
    return (
        <div className="space-y-4">
            {items.map((text) => (
                <p
                    key={text}
                    className={
                        small
                            ? "text-body text-charcoal/85"
                            : "text-body-lg text-charcoal/85"
                    }
                >
                    <RichText text={text} />
                </p>
            ))}
        </div>
    );
}

/** A page section: one column, heading above its content, same Container and vertical padding everywhere. Optional tint with hairline borders. */
function Section({
    id,
    heading,
    tint = false,
    children,
}: {
    id: string;
    heading: string;
    tint?: boolean;
    children: ReactNode;
}) {
    return (
        <section
            aria-labelledby={id}
            className={`section-y ${tint ? "border-y border-taupe/30 bg-blush/20" : ""}`}
        >
            <Container>
                <h2 id={id} className="text-h2 text-charcoal">
                    {heading}
                </h2>
                <div className="mt-5">{children}</div>
            </Container>
        </section>
    );
}

const listClasses = "divide-y divide-taupe/40 border-y border-taupe/40";

/**
 * One performer. With an `image` the card shows the headshot at 3:4; without one it shows a neutral
 * "Photo coming soon" placeholder of the same size, so adding a photo later never changes the layout.
 */
function CastCard({ member }: { member: ShowPageContent["cast"]["members"][number] }) {
    return (
        <li>
            <div className="relative aspect-[3/4] overflow-hidden rounded-sm bg-taupe/15">
                {member.image ? (
                    <Image
                        src={member.image.src}
                        alt={member.image.alt}
                        fill
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                    />
                ) : (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-charcoal/45">
                        <User aria-hidden="true" className="size-12" strokeWidth={1.25} />
                        <span className="text-small">Photo coming soon</span>
                    </div>
                )}
            </div>
            <p className="text-h3 mt-3 text-charcoal">{member.name}</p>
            <p className="text-body text-charcoal/80">{member.role}</p>
        </li>
    );
}

/** Anchors for the calendar: each performance links to #session-<id>. */
function sessionAnchors(sessions: readonly EventSession[], dates: readonly string[]) {
    return sessions
        .filter((session) => session.date && dates.includes(session.date))
        .map((session) => (
            <span
                key={session.id}
                id={`session-${session.id}`}
                aria-hidden="true"
                className="scroll-mt-28"
            />
        ));
}

/**
 * Detail page for the Christmas family show. Every booking button reads the one booking URL in the event data,
 * and there are exactly three: hero, after the ticket prices, and the final section.
 */
export function ChristmasShowPage({ event, show }: ChristmasShowPageProps) {
    const book = event.bookNow;
    const sessions = event.sessions ?? [];
    const offers = event.ticketOffers ?? [];
    const singles = offers.filter((ticket) => !ticket.description);
    const families = offers.filter((ticket) => ticket.description);
    const scheduleDates = [...new Set(sessions.flatMap((session) => (session.date ? [session.date] : [])))].toSorted();

    return (
        <>
            <section className="border-b border-taupe/30 bg-blush/20">
                <Container className="section-y">
                    <HeroBackLink href="/events" tone="light">
                        Back to What&apos;s On
                    </HeroBackLink>
                    <Image
                        src={event.image.src}
                        alt={event.image.alt}
                        width={event.image.width ?? 1774}
                        height={event.image.height ?? 887}
                        priority
                        sizes="(max-width: 1152px) 100vw, 1152px"
                        className="mt-8 h-auto w-full rounded-sm shadow-sm"
                    />
                    <div className="mt-10">
                        <h1 className="text-h1 text-charcoal">Maggie’s Cats</h1>
                        <p className="text-h3 mt-3 text-burgundy">{show.headline}</p>
                        <div className="mt-5">
                            <Paragraphs items={show.intro} />
                        </div>
                        <dl className={`mt-8 ${listClasses}`}>
                            {show.facts.map((fact) => (
                                <div
                                    key={fact.label}
                                    className="grid gap-x-6 gap-y-1 py-3 sm:grid-cols-[8rem_1fr]"
                                >
                                    <dt className="text-overline text-burgundy">
                                        {fact.label}
                                    </dt>
                                    <dd className="text-body text-charcoal">
                                        {fact.value}
                                    </dd>
                                </div>
                            ))}
                        </dl>
                        <Button {...book} className="mt-6 w-full sm:w-auto" />
                    </div>
                </Container>
            </section>

            <Section id="about-the-show" heading={show.about.heading}>
                <Paragraphs items={show.about.paragraphs} />
            </Section>

            <Section id="meet-the-cats" heading={show.cats.heading} tint>
                <p className="text-body-lg text-charcoal/85">{show.cats.intro}</p>
                <div className="mt-8 grid gap-5 md:grid-cols-3">
                    {show.cats.items.map((cat) => (
                        <article
                            key={cat.name}
                            className="rounded-sm border border-taupe/40 border-t-4 border-t-[#b8923f] bg-ivory p-6"
                        >
                            <h3 className="text-h3 text-charcoal">{cat.name}</h3>
                            <p className="text-overline mt-1 text-burgundy">{cat.role}</p>
                            <div className="mt-4">
                                <Paragraphs items={cat.paragraphs} small />
                            </div>
                        </article>
                    ))}
                </div>
            </Section>

            <Section id="dates-and-times" heading={show.schedule.heading}>
                <p className="text-body-lg text-charcoal/85">{show.schedule.intro}</p>
                <h3 className="text-overline mt-8 text-burgundy">
                    {show.schedule.datesHeading}
                </h3>
                <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {scheduleDates.map((date) => (
                        <li
                            key={date}
                            className="rounded-sm border border-taupe/40 bg-ivory px-4 py-3"
                        >
                            <time dateTime={date} className="text-body text-charcoal">
                                {dateLabel(date)}
                            </time>
                            {sessionAnchors(sessions, [date])}
                        </li>
                    ))}
                </ul>
                <h3 className="text-overline mt-8 text-burgundy">
                    {show.schedule.timesHeading}
                </h3>
                <ul className="mt-3 flex flex-wrap gap-3">
                    {show.schedule.times.map((time) => (
                        <li
                            key={time}
                            className="text-body rounded-sm border border-burgundy/40 px-4 py-2 font-medium text-burgundy"
                        >
                            {time}
                        </li>
                    ))}
                </ul>
                <p className="text-body mt-6 text-charcoal/80">
                    {show.schedule.closing}
                </p>
            </Section>

            <Section id="tickets" heading={show.tickets.heading} tint>
                <p className="text-body-lg text-charcoal/85">{show.tickets.intro}</p>
                <div className="mt-8 grid gap-8 sm:grid-cols-2">
                    <div>
                        <h3 className="text-overline text-burgundy">
                            {show.tickets.individualHeading}
                        </h3>
                        <ul className={`mt-3 ${listClasses}`}>
                            {singles.map((ticket) => (
                                <li
                                    key={ticket.name}
                                    className="flex items-baseline justify-between gap-4 py-3"
                                >
                                    <span className="text-body text-charcoal">{ticket.name}</span>
                                    <span className="text-h3 text-charcoal">£{ticket.price}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-overline text-burgundy">
                            {show.tickets.familyHeading}
                        </h3>
                        <ul className={`mt-3 ${listClasses}`}>
                            {families.map((ticket) => (
                                <li
                                    key={ticket.name}
                                    className="flex items-baseline justify-between gap-4 py-3"
                                >
                                    <span className="text-body text-charcoal">{ticket.description}</span>
                                    <span className="text-h3 text-charcoal">£{ticket.price}</span>
                                </li>
                            ))}
                        </ul>
                        <p className="text-small mt-3 text-charcoal/80">
                            {show.tickets.familyNote}
                        </p>
                    </div>
                </div>

                <div className="mt-10 border-l-4 border-[#b8923f] pl-5">
                    <h3 className="text-h3 text-charcoal">
                        {show.tickets.group.heading}
                    </h3>
                    <div className="mt-3">
                        <Paragraphs items={show.tickets.group.paragraphs} small />
                    </div>
                    <Link
                        href={show.tickets.group.contactHref}
                        className="text-small mt-4 inline-block font-medium text-burgundy underline underline-offset-4 hover:text-burgundy/80"
                    >
                        {show.tickets.group.contactLabel}
                    </Link>
                </div>

                <Button
                    {...book}
                    label={show.tickets.button}
                    className="mt-8 w-full sm:w-auto"
                />
            </Section>

            <Section id="meet-the-cast" heading={show.cast.heading}>
                <p className="text-body-lg text-charcoal/85">{show.cast.intro}</p>
                <ul className="mt-8 grid grid-cols-2 gap-x-5 gap-y-8 lg:grid-cols-4">
                    {show.cast.members.map((member) => (
                        <CastCard key={member.name} member={member} />
                    ))}
                </ul>
                <h3 className="text-overline mt-10 text-burgundy">
                    {show.cast.creativeTeam.heading}
                </h3>
                <p className="text-h3 mt-2 text-charcoal">
                    {show.cast.creativeTeam.name}
                </p>
            </Section>

            <Section id="venue" heading={show.venue.heading} tint>
                <Paragraphs items={show.venue.paragraphs} />
            </Section>

            <Section id="how-to-find-us" heading={show.directions.heading}>
                <p className="text-body-lg text-charcoal">
                    <strong className="font-semibold">{show.directions.name}</strong>
                    <br />
                    {show.directions.address}
                </p>
                <div className="mt-4">
                    <Paragraphs items={show.directions.paragraphs} />
                </div>
            </Section>

            <Section id="before-you-visit" heading={show.visit.heading} tint>
                <div className="space-y-8">
                    {show.visit.items.map((item) => (
                        <div key={item.title}>
                            <h3 className="text-h3 text-charcoal">
                                {item.title}
                            </h3>
                            <div className="mt-2">
                                <Paragraphs items={item.paragraphs} small />
                            </div>
                        </div>
                    ))}
                </div>
            </Section>

            <Section id="final-cta" heading={show.finalCta.heading}>
                <Paragraphs items={show.finalCta.paragraphs} />
                <Button
                    {...book}
                    label={show.finalCta.button}
                    className="mt-6 w-full sm:w-auto"
                />
            </Section>
        </>
    );
}
