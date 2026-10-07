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
          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12 xl:gap-16">
            {page.gallery && page.gallery.length > 0 && (
              <AutoPlayGallery
                images={page.gallery}
                label="Venue hire photos"
                className="aspect-[2/1] w-full lg:aspect-auto lg:h-full lg:min-h-0"
                frameClassName="h-full w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
            <p className="text-body-lg text-charcoal/80 lg:flex lg:items-center">{page.intro}</p>
          </div>
        </Container>
      </section>
      <VenueHireContent />
    </PageShell>
  );
}
