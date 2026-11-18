import Link from "next/link";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { VenueHireContent } from "@/components/venue-hire/VenueHireContent";
import { AutoPlayGallery } from "@/components/ui/AutoPlayGallery";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const page = siteContent.pages.venueHire.overview;

export const metadata: Metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: "/venue-hire",
});

export default function VenueHirePage() {
  return (
    <PageShell>
      <PageHero {...page.hero} />
      <section className="section-y">
        <Container>
          <div className="editorial-split">
            {page.gallery && page.gallery.length > 0 && (
              <AutoPlayGallery
                images={page.gallery}
                label="Venue hire photos"
                className="aspect-[4/3] w-full"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
            )}
            <p className="text-body-lg text-charcoal/85">{page.intro}</p>
          </div>
        </Container>
      </section>
      <section className="border-y border-taupe/30 py-8">
        <Container>
          <p className="text-body text-charcoal/75">{page.timetableNote}</p>
          <Link href={page.timetableLink.href} className="mt-3 inline-block text-rose underline">{page.timetableLink.label}</Link>
        </Container>
      </section>
      <VenueHireContent />
    </PageShell>
  );
}
