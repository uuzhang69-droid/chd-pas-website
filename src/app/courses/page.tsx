import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { CourseCardGrid } from "@/components/ui/ContentGrids";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const { courses } = siteContent.pages;

export const metadata: Metadata = pageMetadata({
  title: courses.meta.title,
  description: courses.meta.description,
  path: "/courses",
});

export default function CoursesPage() {
  return (
    <PageShell>
      <PageHero {...courses.hero} />
      <section className="section-y">
        <Container>
          <p className="text-body-lg text-charcoal/75">{courses.intro}</p>
          <div className="mt-12">
            <CourseCardGrid items={courses.items} />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
