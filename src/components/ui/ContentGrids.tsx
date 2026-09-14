import Image from "next/image";
import Link from "next/link";
import type { ClassStyleTile, CourseSummary, EventCard } from "@/content/types";
import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";

export function ClassStyleGrid({ items }: { items: ClassStyleTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
      {items.map((style) => (
        <Link
          key={style.id}
          href={style.href}
          className="group relative aspect-[3/4] overflow-hidden rounded-sm md:aspect-[4/5]"
        >
          <Image
            src={style.image.src}
            alt={style.image.alt}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 50vw, 20vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/15 to-transparent transition-opacity group-hover:from-rose/80" />
          <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
            <h2 className="font-[family-name:var(--font-cormorant)] text-base leading-tight text-ivory md:text-xl">
              {style.name}
            </h2>
          </div>
        </Link>
      ))}
    </div>
  );
}

export function CourseCardGrid({ items }: { items: CourseSummary[] }) {
  const { viewCourseLink } = siteContent.pages.common;
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {items.map((course) => (
        <article
          key={course.id}
          className="group flex flex-col overflow-hidden rounded-sm border border-taupe/30 bg-ivory transition-shadow hover:shadow-lg"
        >
          <div className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={course.image.src}
              alt={course.image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <p className="text-overline text-rose">{course.term}</p>
            <h2 className="text-h3 mt-2 text-charcoal">
              <Link href={course.href} className="hover:text-rose">
                {course.title}
              </Link>
            </h2>
            <p className="text-small mt-1 text-charcoal/60">{course.level}</p>
            <p className="text-body mt-3 flex-1 text-charcoal/75">{course.excerpt}</p>
            <Link
              href={course.href}
              className="mt-5 text-small font-semibold uppercase tracking-wider text-rose hover:text-rose/80"
            >
              {viewCourseLink}
            </Link>
          </div>
        </article>
      ))}
    </div>
  );
}

export function EventListingGrid({ items }: { items: EventCard[] }) {
  const { eventDetailsLink } = siteContent.pages.common;
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {items.map((event) => (
        <article
          key={event.id}
          className="group flex flex-col overflow-hidden rounded-sm border border-taupe/30 bg-ivory transition-shadow hover:shadow-lg"
        >
          <Link href={`/events/${event.slug}`} className="relative aspect-[16/9] overflow-hidden">
            <Image
              src={event.image.src}
              alt={event.image.alt}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
          </Link>
          <div className="flex flex-1 flex-col p-6">
            <time dateTime={event.dateIso} className="text-overline text-rose">
              {event.date}
            </time>
            <h2 className="text-h3 mt-2">
              <Link href={`/events/${event.slug}`} className="text-charcoal hover:text-rose">
                {event.title}
              </Link>
            </h2>
            {event.excerpt && (
              <p className="text-body mt-3 flex-1 text-charcoal/75">{event.excerpt}</p>
            )}
            <div className="mt-5 flex flex-wrap gap-3">
              <Button {...event.bookNow} className="!py-2.5" />
              <Link
                href={`/events/${event.slug}`}
                className="inline-flex items-center text-small font-semibold text-rose hover:text-rose/80"
              >
                {eventDetailsLink}
              </Link>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
