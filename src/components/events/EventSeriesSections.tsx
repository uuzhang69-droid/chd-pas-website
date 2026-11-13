import type { EventCard } from "@/content/types";
import { EventProgramme } from "@/components/events/EventProgramme";
import { sessionsNewestFirst } from "@/lib/events/series";

type Section = { heading: string; paragraphs: string[] };

/** Splits `description` into intro paragraphs and "# Heading" sections. */
function splitDescription(description: readonly string[] = []) {
    const intro: string[] = [];
    const sections: Section[] = [];
    for (const line of description) {
        if (line.startsWith("# ")) {
            sections.push({ heading: line.slice(2), paragraphs: [] });
        } else if (sections.length > 0) {
            sections[sections.length - 1].paragraphs.push(line);
        } else {
            intro.push(line);
        }
    }
    return { intro, sections };
}

function TextSection({ heading, paragraphs }: Section) {
    return (
        <section className="mt-10 md:mt-12">
            <h2 className="text-h3 text-charcoal">{heading}</h2>
            <div className="mt-4 space-y-4">
                {paragraphs.map((paragraph) => (
                    <p key={paragraph} className="text-body text-charcoal/75">
                        {paragraph}
                    </p>
                ))}
            </div>
        </section>
    );
}

/**
 * About the Series, Latest Concert, other sections, Previous Concerts, then Venue.
 * The latest concert is the newest published session, not decided by today's date.
 */
export function EventSeriesSections({ event }: { event: EventCard }) {
    const { intro, sections } = splitDescription(event.description);
    const [latest, ...previous] = sessionsNewestFirst(event.sessions);
    const venue = sections.find((section) => section.heading === "Venue");
    const middle = sections.filter((section) => section !== venue);

    return (
        <>
            {intro.length > 0 && (
                <section>
                    <h2 className="text-h3 text-charcoal">About the Series</h2>
                    <div className="mt-4 w-full space-y-4">
                        {intro.map((paragraph) => (
                            <p
                                key={paragraph}
                                className="text-body text-charcoal/75"
                            >
                                {paragraph}
                            </p>
                        ))}
                    </div>
                </section>
            )}
            {latest && (
                <EventProgramme
                    sessions={[latest]}
                    heading="Latest Concert"
                    id="latest-concert"
                />
            )}
            {middle.map((section) => (
                <TextSection key={section.heading} {...section} />
            ))}
            {previous.length > 0 && (
                <EventProgramme
                    sessions={previous}
                    heading="Previous Concerts"
                    id="previous-concerts"
                    newestFirst
                />
            )}
            {venue && <TextSection {...venue} />}
        </>
    );
}
