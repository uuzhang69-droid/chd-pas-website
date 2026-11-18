import Image from "next/image";
import Link from "next/link";
import type { ClassStyleCard, ClassStyleTile, CourseSummary, EventCard } from "@/content/types";
import { sortEventsByDate } from "@/lib/events/event-cta";
import { EventSummaryCard } from "@/components/events/EventSummaryCard";
import { siteContent } from "@/content/site";

export function ClassStyleCardGrid({
  items,
  linkLabel = "View class →",
}: {
  items: ClassStyleCard[];
  linkLabel?: string;
}) {
  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((style) => (
        <article
          key={style.id}
          className="relative group flex flex-col overflow-hidden rounded-sm border border-taupe/30 bg-ivory transition duration-300 hover:-translate-y-1 hover:border-rose hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:shadow-xl has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-burgundy has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-ivory"
        >
          <div className="relative aspect-[4/5] w-full shrink-0 overflow-hidden bg-blush/25">
            <Image
              src={style.image.src}
              alt={style.image.alt}
              fill
              className="object-cover object-center"
              sizes="(max-width: 768px) 100vw, 33vw"
            />
          </div>
          <div className="flex flex-1 flex-col p-6">
            <h2 className="text-h3 text-charcoal">
              <Link href={style.href} className="card-link underline-offset-4 transition-colors group-hover:text-burgundy group-hover:underline group-has-[a:focus-visible]:text-burgundy group-has-[a:focus-visible]:underline">
                {style.name}
              </Link>
            </h2>
            <p className="text-body mt-3 flex-1 text-charcoal/85">{style.excerpt}</p>
            <span aria-hidden="true" className="mt-5 text-small font-semibold uppercase tracking-wider text-burgundy transition-colors group-hover:text-charcoal">
              {linkLabel}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function ClassStyleGrid({ items }: { items: ClassStyleTile[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6 md:gap-4">
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
          className="relative group flex flex-col overflow-hidden rounded-sm border border-taupe/30 bg-ivory transition duration-300 hover:-translate-y-1 hover:border-rose hover:shadow-xl motion-reduce:transition-none motion-reduce:hover:translate-y-0 has-[a:focus-visible]:-translate-y-1 has-[a:focus-visible]:shadow-xl has-[a:focus-visible]:ring-4 has-[a:focus-visible]:ring-burgundy has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-ivory"
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
            <p className="text-overline text-burgundy">{course.term}</p>
            <h2 className="text-h3 mt-2 text-charcoal">
              <Link href={course.href} className="card-link underline-offset-4 transition-colors group-hover:text-burgundy group-hover:underline group-has-[a:focus-visible]:text-burgundy group-has-[a:focus-visible]:underline">
                {course.title}
              </Link>
            </h2>
            <p className="text-small mt-1 text-charcoal/60">{course.level}</p>
            <p className="text-body mt-3 flex-1 text-charcoal/85">{course.excerpt}</p>
            <span aria-hidden="true" className="mt-5 text-small font-semibold uppercase tracking-wider text-burgundy transition-colors group-hover:text-charcoal">
              {viewCourseLink}
            </span>
          </div>
        </article>
      ))}
    </div>
  );
}

export function EventListingGrid({ items }: { items: EventCard[] }) {
  return (
    <div className="grid gap-6 sm:grid-cols-2">
      {sortEventsByDate(items).map((event) => (
        <EventSummaryCard
          key={event.id}
          event={event}
          sizes="(max-width: 768px) 100vw, 50vw"
          headingLevel="h2"
        />
      ))}
    </div>
  );
}
