import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { EventsListing } from "@/components/events/EventsListing";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

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
          <p className="text-body-lg max-w-3xl text-charcoal/75">{events.intro}</p>
          <div className="mt-10">
            <EventsListing items={events.items} />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
