import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllCourseSlugs, getCourseBySlug } from "@/content/helpers";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllCourseSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) return {};
  return {
    title: course.title,
    description: course.metaDescription,
  };
}

export default async function CourseDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const course = getCourseBySlug(slug);
  if (!course) notFound();

  const labels = siteContent.pages.courses.detailLabels;

  return (
    <PageShell>
      <section className="border-b border-taupe/30 bg-ivory">
        <Container className="py-12 md:py-16">
          <Link href="/courses" className="text-small font-semibold text-rose hover:text-rose/80">
            ← {labels.backLink}
          </Link>
          <p className="text-overline text-rose mt-6">{course.term}</p>
          <h1 className="text-h1 mt-2 max-w-3xl text-charcoal">{course.title}</h1>
          <p className="text-body mt-2 text-charcoal/60">{course.level}</p>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-2">
            <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
              <Image
                src={course.image.src}
                alt={course.image.alt}
                fill
                className="object-cover"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            </div>
            <div>
              <dl className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-sm border border-taupe/30 p-4">
                  <dt className="text-overline text-rose">{labels.duration}</dt>
                  <dd className="text-body mt-1 font-medium text-charcoal">{course.duration}</dd>
                </div>
                <div className="rounded-sm border border-taupe/30 p-4">
                  <dt className="text-overline text-rose">{labels.schedule}</dt>
                  <dd className="text-body mt-1 font-medium text-charcoal">{course.schedule}</dd>
                </div>
                <div className="rounded-sm border border-taupe/30 p-4">
                  <dt className="text-overline text-rose">{labels.price}</dt>
                  <dd className="text-body mt-1 font-medium text-charcoal">{course.price}</dd>
                </div>
              </dl>
              <div className="mt-8 space-y-4">
                {course.description.map((paragraph) => (
                  <p key={paragraph.slice(0, 32)} className="text-body-lg text-charcoal/80">
                    {paragraph}
                  </p>
                ))}
              </div>
              <h2 className="text-h3 mt-10 text-charcoal">{labels.includes}</h2>
              <ul className="mt-4 space-y-2">
                {course.includes.map((item) => (
                  <li key={item} className="text-body text-charcoal/75 flex gap-2">
                    <span className="text-rose">•</span>
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-10">
                <Button {...course.cta} />
              </div>
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
