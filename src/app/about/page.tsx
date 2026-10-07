import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { AutoPlayGallery } from "@/components/ui/AutoPlayGallery";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";

const { about } = siteContent.pages;
const { aboutTeaser } = siteContent.home;

export const metadata: Metadata = {
  title: about.meta.title,
  description: about.meta.description,
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero
        {...about.hero}
        image={aboutTeaser.image}
        imageClassName="object-[center_20%]"
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-10 lg:grid-cols-2 lg:items-stretch lg:gap-12 xl:gap-16">
            <div className="lg:flex lg:flex-col lg:justify-center">
              <h2 className="text-h2 text-charcoal">{about.story.title}</h2>
              <div className="mt-6 space-y-4">
                {about.story.paragraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="text-body-lg text-charcoal/80">
                    {paragraph}
                  </p>
                ))}
              </div>
            </div>
            {about.story.gallery && about.story.gallery.length > 0 && (
              <AutoPlayGallery
                images={about.story.gallery}
                label="About County Hall Dance Centre photos"
                className="aspect-[4/3] w-full lg:aspect-auto lg:h-full lg:min-h-0"
                frameClassName="h-full w-full"
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            )}
          </div>
        </Container>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <Container>
          <SectionHeading
            overline={about.values.overline}
            title={about.values.title}
            align="center"
            className="mx-auto text-center"
          />
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {about.values.items.map((value) => (
              <article key={value.title} className="rounded-sm bg-ivory p-6 shadow-sm">
                <h3 className="text-h3 text-rose">{value.title}</h3>
                <p className="text-body mt-3 text-charcoal/75">{value.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="border-t border-taupe/30 bg-charcoal py-16 text-ivory md:py-20">
        <Container className="text-center">
          <h2 className="text-h2">{about.cta.title}</h2>
          <p className="text-body-lg mx-auto mt-4 max-w-xl text-ivory/85">{about.cta.body}</p>
          <div className="mt-8">
            <Button {...about.cta.button} />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
