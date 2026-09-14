import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

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
          {events.items.map((event) => (
            <article
              key={event.id}
              className="group flex flex-col overflow-hidden rounded-sm border border-taupe/30 bg-ivory transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={event.image.src}
                  alt={event.image.alt}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 768px) 100vw, 25vw"
                />
              </div>
              <div className="flex flex-1 flex-col p-5">
                <time
                  dateTime={event.dateIso}
                  className="text-overline text-rose"
                >
                  {event.date}
                </time>
                <h3 id={`event-${event.id}`} className="text-h3 mt-2 text-charcoal">
                  {event.title}
                </h3>
                {event.location && (
                  <p className="text-small mt-2 text-charcoal/60">{event.location}</p>
                )}
                <div className="mt-auto pt-5">
                  <Button {...event.bookNow} className="w-full !py-2.5" />
                </div>
              </div>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
