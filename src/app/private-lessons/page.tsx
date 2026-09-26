import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { PrivateLessonsSections } from "@/components/private-lessons/PrivateLessonsSections";
import { Button } from "@/components/ui/Button";
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
      <section className="bg-ivory py-16 md:py-24">
        <Container className="max-w-3xl">
          <h2 className="text-h2 text-charcoal">{page.howItWorks.title}</h2>
          <ol className="mt-8 space-y-5">
            {page.howItWorks.steps.map((step, index) => (
              <li key={step.title} className="flex gap-4">
                <span className="text-h3 text-rose">{index + 1}</span>
                <p className="text-body-lg text-charcoal/80">
                  <strong className="text-charcoal">{step.title}</strong>
                  {" — "}
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
        </Container>
      </section>
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl text-center">
          <h2 className="text-h2 text-charcoal">{page.cta.title}</h2>
          <p className="text-body-lg mt-4 text-charcoal/80">{page.cta.body}</p>
          <div className="mt-8">
            <Button {...page.cta.button} />
          </div>
          {page.cta.secondary && (
            <p className="text-body mt-4 text-charcoal/65">{page.cta.secondary}</p>
          )}
        </Container>
      </section>
    </PageShell>
  );
}
