import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { PrivateLessonsSections } from "@/components/private-lessons/PrivateLessonsSections";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const page = siteContent.pages.privateLessons;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
};

export default function PrivateLessonsPage() {
  return (
    <PageShell>
      <PageHero {...page.hero} />
      {page.intro && (
        <section className="py-12 md:py-16">
          <Container>
            <p className="text-body-lg max-w-3xl text-charcoal/80">{page.intro}</p>
          </Container>
        </section>
      )}
      <PrivateLessonsSections sections={page.sections} />
    </PageShell>
  );
}
