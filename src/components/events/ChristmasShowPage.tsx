import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import type { EventCard, EventSession, ShowPageContent } from "@/content/types";
import { TIMETABLE_TIME_ZONE } from "@/content/venues";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow, HeroBackLink } from "@/components/ui/HeroParts";

type ChristmasShowPageProps = {
    event: EventCard;
    show: ShowPageContent;
};

const dayFormat = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: TIMETABLE_TIME_ZONE,
});

/** "13:00" to "1:00 PM". */
function clockLabel(time: string): string {
    const [hours, minutes] = time.split(":").map(Number);
    return `${hours % 12 || 12}:${String(minutes).padStart(2, "0")} ${hours >= 12 ? "PM" : "AM"}`;
}

function groupByDate(sessions: readonly EventSession[]) {
    const days = new Map<string, EventSession[]>();
    for (const session of sessions) {
        if (!session.date) continue;
        days.set(session.date, [...(days.get(session.date) ?? []), session]);
    }
    return [...days.entries()]
        .toSorted(([a], [b]) => a.localeCompare(b))
        .map(([date, items]) => ({
            date,
            items: items.toSorted((a, b) =>
                (a.start ?? "").localeCompare(b.start ?? ""),
            ),
        }));
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
                    {text}
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
 * Detail page for the Christmas family show. Every booking button reads the one booking URL in the event data.
 * Plain editorial sections on the site's own colours; a deep red for calls to action and a thin gold rule are the only seasonal touches.
 */
export function ChristmasShowPage({ event, show }: ChristmasShowPageProps) {
    const days = groupByDate(event.sessions ?? []);
    const book = event.bookNow;
    const offers = event.ticketOffers ?? [];
    const singles = offers.filter((ticket) => !ticket.description);
    const families = offers.filter((ticket) => ticket.description);
    const dailyTimes = (days[0]?.items ?? []).map((session) =>
        clockLabel(session.start ?? ""),
    );

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
                        width={event.image.width ?? 1672}
                        height={event.image.height ?? 941}
                        priority
                        sizes="(max-width: 1152px) 100vw, 1152px"
                        className="mt-8 h-auto w-full rounded-sm shadow-sm"
                    />
                    <div className="mt-10">
                        <Eyebrow tone="light">{event.subtitle}</Eyebrow>
                        <h1 className="text-h1 mt-4 text-charcoal">
                            Maggie’s Cats
                        </h1>
                        <p className="text-h3 mt-3 text-burgundy">
                            {show.headline}
                        </p>
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
                <p className="text-body-lg text-charcoal/85">
                    {show.cats.intro}
                </p>
                <div className={`mt-8 ${listClasses}`}>
                    {show.cats.items.map((cat) => (
                        <article key={cat.name} className="py-7">
                            <h3 className="text-h3 text-charcoal">
                                {cat.name}
                                <span className="text-overline ml-3 align-middle text-burgundy">
                                    {cat.role}
                                </span>
                            </h3>
                            <div className="mt-3">
                                <Paragraphs items={cat.paragraphs} small />
                            </div>
                        </article>
                    ))}
                </div>
            </Section>

            <Section id="dates-and-times" heading={show.schedule.heading}>
                <p className="text-body-lg text-charcoal/85">
                    {show.schedule.intro}
                </p>
                <div className="mt-8 space-y-8">
                    <div>
                        <h3 className="text-overline text-burgundy">Dates</h3>
                        <ol className={`mt-3 ${listClasses}`}>
                            {days.map(({ date, items }) => (
                                <li key={date} className="py-3">
                                    <time
                                        dateTime={date}
                                        className="text-body text-charcoal"
                                    >
                                        {dayFormat.format(
                                            new Date(`${date}T12:00:00Z`),
                                        )}
                                    </time>
                                    {/* Anchors for each performance: the calendar links to #session-<id>. */}
                                    {items.map((session) => (
                                        <span
                                            key={session.id}
                                            id={`session-${session.id}`}
                                            aria-hidden="true"
                                            className="scroll-mt-28"
                                        />
                                    ))}
                                </li>
                            ))}
                        </ol>
                    </div>
                    <div>
                        <h3 className="text-overline text-burgundy">
                            {show.schedule.timesLabel}
                        </h3>
                        <ul className={`mt-3 ${listClasses}`}>
                            {dailyTimes.map((time) => (
                                <li
                                    key={time}
                                    className="text-body py-3 text-charcoal"
                                >
                                    {time}
                                </li>
                            ))}
                        </ul>
                        <p className="text-body mt-4 text-charcoal/80">
                            {show.schedule.total}
                        </p>
                    </div>
                </div>
                <p className="text-body mt-6 text-charcoal/80">
                    {show.schedule.support}
                </p>
                <Button {...book} className="mt-6 w-full sm:w-auto" />
            </Section>

            <Section id="tickets" heading={show.tickets.heading} tint>
                <p className="text-body-lg text-charcoal/85">
                    {show.tickets.intro}
                </p>
                <div className="mt-8 space-y-8">
                    <div>
                        <h3 className="text-overline text-burgundy">
                            Individual tickets
                        </h3>
                        <ul className={`mt-3 ${listClasses}`}>
                            {singles.map((ticket) => (
                                <li
                                    key={ticket.name}
                                    className="flex items-baseline justify-between gap-4 py-3"
                                >
                                    <span className="text-body text-charcoal">
                                        {ticket.name}
                                    </span>
                                    <span className="text-h3 text-charcoal">
                                        £{ticket.price}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h3 className="text-overline text-burgundy">
                            Family tickets
                        </h3>
                        <ul className={`mt-3 ${listClasses}`}>
                            {families.map((ticket) => (
                                <li
                                    key={ticket.name}
                                    className="flex items-baseline justify-between gap-4 py-3"
                                >
                                    <span className="text-body text-charcoal">
                                        {ticket.description}
                                    </span>
                                    <span className="text-h3 text-charcoal">
                                        £{ticket.price}
                                    </span>
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

            <Section id="venue" heading={show.venue.heading}>
                <Paragraphs items={show.venue.paragraphs} />
                <div className="mt-8">
                    <h3 className="text-overline text-burgundy">Venue details</h3>
                    <p className="text-body mt-2 text-charcoal">
                        {show.venue.name}
                        <br />
                        {show.venue.address}
                    </p>
                </div>
            </Section>

            <Section id="before-you-visit" heading={show.visit.heading} tint>
                <p className="text-body-lg text-charcoal/85">
                    {show.visit.intro}
                </p>
                {show.visit.items.map((item) => (
                    <div key={item.title} className="mt-6">
                        <h3 className="text-h3 text-charcoal">{item.title}</h3>
                        <div className="mt-2">
                            <Paragraphs items={item.paragraphs} small />
                        </div>
                    </div>
                ))}
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
