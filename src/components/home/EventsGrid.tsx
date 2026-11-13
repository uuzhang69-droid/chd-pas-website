import Link from "next/link";
import { siteContent } from "@/content/site";
import { EventSummaryCard } from "@/components/events/EventSummaryCard";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { sortEventsByDate } from "@/lib/events/event-cta";

export function EventsGrid() {
  const { events } = siteContent.home;

  return (
    <section className="py-16 md:py-24" aria-labelledby="events-heading">
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="mb-0">
            <SectionHeading
              overline={events.overline}
              title={events.title}
              subtitle={events.subtitle}
              className="!mb-0 max-w-3xl"
            />
          </div>
          <Link
            href={events.viewAll.href}
            className="text-small font-semibold uppercase tracking-wider text-rose transition-colors hover:text-rose/80 shrink-0"
          >
            {events.viewAll.label} →
          </Link>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {sortEventsByDate(events.items).slice(0, 4).map((event) => (
            <EventSummaryCard
              key={event.id}
              event={event}
              sizes="(max-width: 768px) 100vw, 25vw"
            />
          ))}
        </div>
      </Container>
    </section>
  );
}
