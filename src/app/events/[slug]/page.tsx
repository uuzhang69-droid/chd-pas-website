import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getAllEventRouteSlugs,
  getEventBySlug,
  getEventCategoryBySlug,
} from "@/content/helpers";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { SectionedPage } from "@/components/ui/SectionedPage";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllEventRouteSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getEventCategoryBySlug(slug);
  if (category) {
    return {
      title: category.meta.title,
      description: category.meta.description,
    };
  }
  const event = getEventBySlug(slug);
  if (!event) return {};
  return {
    title: event.title,
    description: event.excerpt,
  };
}

export default async function EventDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const category = getEventCategoryBySlug(slug);
  if (category) {
    return (
      <PageShell>
        <SectionedPage {...category} />
      </PageShell>
    );
  }

  const event = getEventBySlug(slug);
  if (!event) notFound();

  const { detailLabels } = siteContent.pages.events;

  return (
    <PageShell>
      <section className="border-b border-taupe/30 bg-ivory">
        <Container className="py-12 md:py-16">
          <Link href="/events" className="text-small font-semibold text-rose hover:text-rose/80">
            {detailLabels.backLink}
          </Link>
          <time dateTime={event.dateIso} className="text-overline text-rose mt-6 block">
            {event.date}
          </time>
          <h1 className="text-h1 mt-2 max-w-3xl text-charcoal">{event.title}</h1>
          {event.location && (
            <p className="text-body mt-3 text-charcoal/60">
              {detailLabels.location}: {event.location}
            </p>
          )}
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={event.image.src}
                alt={event.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div>
              {event.excerpt && (
                <p className="text-body-lg text-charcoal/80">{event.excerpt}</p>
              )}
              {event.description && (
                <div className="mt-6 space-y-4">
                  {event.description.map((paragraph) => (
                    <p key={paragraph.slice(0, 32)} className="text-body text-charcoal/75">
                      {paragraph}
                    </p>
                  ))}
                </div>
              )}
              <dl className="mt-8 space-y-3 rounded-sm border border-taupe/30 p-6">
                <div>
                  <dt className="text-overline text-rose">{detailLabels.date}</dt>
                  <dd className="text-body mt-1 text-charcoal">{event.date}</dd>
                </div>
                {event.location && (
                  <div>
                    <dt className="text-overline text-rose">{detailLabels.location}</dt>
                    <dd className="text-body mt-1 text-charcoal">{event.location}</dd>
                  </div>
                )}
              </dl>
              <div className="mt-8">
                <Button {...event.bookNow} />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
