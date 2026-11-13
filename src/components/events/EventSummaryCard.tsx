import Image from "next/image";
import Link from "next/link";
import type { EventCard } from "@/content/types";
import { Button } from "@/components/ui/Button";

type EventSummaryCardProps = {
    event: EventCard;
    /** Responsive `sizes` hint for the card image. */
    sizes: string;
    /** Heading level: the home grid sits under an h2, the listing page is a flat list. */
    headingLevel?: "h2" | "h3";
};

/** One card for the home "What's On" grid and the /events list. Always links to the internal detail page. */
export function EventSummaryCard({
    event,
    sizes,
    headingLevel = "h3",
}: EventSummaryCardProps) {
    const Heading = headingLevel;
    const href = `/events/${event.slug}`;
    const blurb = event.excerpt ?? event.location;

    return (
        <article className="group flex flex-col overflow-hidden rounded-sm border border-taupe/30 bg-ivory transition-shadow duration-300 hover:shadow-lg">
            <Link
                href={href}
                className="flex flex-1 flex-col outline-none focus-visible:ring-2 focus-visible:ring-rose focus-visible:ring-inset"
            >
                <div className="relative aspect-[4/3] overflow-hidden">
                    <Image
                        src={event.image.src}
                        alt={event.image.alt}
                        fill
                        className="object-cover transition-transform duration-500 group-hover:scale-105"
                        sizes={sizes}
                    />
                </div>
                <div className="flex flex-1 flex-col p-5">
                    <time
                        dateTime={event.dateIso}
                        className="text-overline text-rose"
                    >
                        {event.date}
                    </time>
                    <Heading className="text-h3 mt-2 text-charcoal group-hover:text-rose">
                        {event.title}
                    </Heading>
                    {blurb && (
                        <p className="text-small mt-2 line-clamp-3 text-charcoal/70">
                            {blurb}
                        </p>
                    )}
                </div>
            </Link>
            <div className="mt-auto px-5 pb-5">
                <Button
                    label="View Details"
                    href={href}
                    variant="primary"
                    className="w-full !py-2.5"
                />
            </div>
        </article>
    );
}
