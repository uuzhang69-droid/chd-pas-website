import Image from "next/image";
import Link from "next/link";
import type { EventCard } from "@/content/types";
import { buttonClasses } from "@/components/ui/Button";

type EventSummaryCardProps = {
    event: EventCard;
    /** Responsive `sizes` hint for the card image. */
    sizes: string;
    /** Heading level: the home grid sits under an h2, the listing page is a flat list. */
    headingLevel?: "h2" | "h3";
};

/**
 * One card for the home "What's On" grid and the /events list. The whole card opens the internal detail page.
 * Markup: one real link (the title) whose invisible overlay covers the card, so there is a single semantic link,
 * nothing nested, one tab stop, and the keyboard focus ring is drawn around the whole card.
 * "View Details" is the same call to action as before, shown as part of the card rather than as a second link.
 *
 * Every image is a square crop of the original (the file itself is never changed). `image.position` moves the crop
 * so the main subjects stay in view; the event page keeps the picture at its own proportions.
 */
export function EventSummaryCard({
    event,
    sizes,
    headingLevel = "h3",
}: EventSummaryCardProps) {
    const Heading = headingLevel;
    const href = `/events/${event.slug}`;
    const blurb = event.cardExcerpt ?? event.excerpt ?? event.location;

    return (
        <article className="group relative flex h-full flex-col overflow-hidden rounded-sm border border-taupe/30 bg-ivory transition duration-300 hover:-translate-y-1 hover:border-rose hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:shadow-xl has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-burgundy has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-ivory">
            <div className="relative aspect-square overflow-hidden">
                <Image
                    src={event.image.src}
                    alt={event.image.alt}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    style={
                        event.image.position
                            ? { objectPosition: event.image.position }
                            : undefined
                    }
                    sizes={sizes}
                />
            </div>
            <div className="flex flex-1 flex-col px-5 pb-5 pt-4 [container-type:inline-size]">
                <time
                    dateTime={event.dateIso}
                    className="text-overline text-burgundy"
                >
                    {event.date}
                </time>
                <Heading className="text-card-title mt-2 text-charcoal underline-offset-4 transition-colors group-hover:text-burgundy group-hover:underline group-has-[a:focus-visible]:text-burgundy group-has-[a:focus-visible]:underline">
                    <Link href={href} className="card-link">
                        {event.title}
                    </Link>
                </Heading>
                {blurb && (
                    <p className="text-small mt-2 text-charcoal/80">
                        {blurb}
                    </p>
                )}
                <div className="mt-auto pt-4">
                    <span
                        aria-hidden="true"
                        className={buttonClasses(
                            "primary",
                            "w-fit !px-5 !py-2 group-hover:bg-burgundy/90 group-hover:shadow-md",
                        )}
                    >
                        {event.cardCtaLabel ?? "View Details"}
                        <span
                            aria-hidden="true"
                            className="transition-transform duration-300 group-hover:translate-x-1"
                        >
                            →
                        </span>
                    </span>
                </div>
            </div>
        </article>
    );
}
