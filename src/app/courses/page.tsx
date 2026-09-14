import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { CourseCardGrid } from "@/components/ui/ContentGrids";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const { courses } = siteContent.pages;

export const metadata: Metadata = {
  title: courses.meta.title,
  description: courses.meta.description,
};

export default function CoursesPage() {
  return (
    <PageShell>
      <PageHero {...courses.hero} />
      <section className="py-16 md:py-24">
        <Container>
          <p className="text-body-lg max-w-3xl text-charcoal/75">{courses.intro}</p>
          <div className="mt-12">
            <CourseCardGrid items={courses.items} />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
