import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { EventsListing } from "@/components/events/EventsListing";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

/* Event order and Past Event labels depend on the date, so these pages refresh every 15 minutes. All three use the same value so they never disagree for long. */
export const revalidate = 900;

const { events } = siteContent.pages;

export const metadata: Metadata = {
  title: events.meta.title,
  description: events.meta.description,
};

export default function EventsPage() {
  return (
    <PageShell>
      <PageHero {...events.hero} />
      <section className="py-16 md:py-24">
        <Container>
          <EventsListing items={events.items} filterLabels={events.filters} />
        </Container>
      </section>
    </PageShell>
  );
}
