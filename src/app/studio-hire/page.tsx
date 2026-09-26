import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { StudioHireContent } from "@/components/studio-hire/StudioHireContent";
import { AutoPlayGallery } from "@/components/ui/AutoPlayGallery";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const page = siteContent.pages.studioHire.overview;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
};

export default function StudioHirePage() {
  return (
    <PageShell>
      <PageHero {...page.hero} />
      <section className="py-12 md:py-16">
        <Container>
          <p className="text-body-lg max-w-3xl text-charcoal/80">{page.intro}</p>
        </Container>
      </section>
      {"gallery" in page && page.gallery && page.gallery.length > 0 && (
        <section className="border-y border-taupe/20 bg-blush/25 py-12 md:py-16">
          <Container>
            {"galleryLabel" in page && page.galleryLabel && (
              <h2 className="text-h2 mb-8 text-center text-charcoal">{page.galleryLabel}</h2>
            )}
            <AutoPlayGallery
              images={page.gallery}
              label={
                ("galleryLabel" in page && page.galleryLabel) || "Studio hire gallery"
              }
              className="mx-auto max-w-4xl shadow-md"
            />
          </Container>
        </section>
      )}
      <StudioHireContent />
    </PageShell>
  );
}
