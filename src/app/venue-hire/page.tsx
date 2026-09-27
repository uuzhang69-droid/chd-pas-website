import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { VenueHireContent } from "@/components/venue-hire/VenueHireContent";
import { AutoPlayGallery } from "@/components/ui/AutoPlayGallery";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const page = siteContent.pages.venueHire.overview;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
};

export default function VenueHirePage() {
  return (
    <PageShell>
      <PageHero {...page.hero} />
      <section className="py-12 md:py-16">
        <Container>
          <p className="text-body-lg max-w-3xl text-charcoal/80">{page.intro}</p>
        </Container>
      </section>
      <VenueHireContent />
    </PageShell>
  );
}
