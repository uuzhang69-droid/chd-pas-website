import Image from "next/image";
import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { PrivateLessonsSections } from "@/components/private-lessons/PrivateLessonsSections";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const page = siteContent.pages.privateLessons;

export const metadata: Metadata = pageMetadata({
  title: page.meta.title,
  description: page.meta.description,
  path: "/private-lessons",
});

export default function PrivateLessonsPage() {
  return (
    <PageShell>
      <PageHero {...page.hero} />
      {page.intro && (
        <section className="section-y">
          <Container>
            <p className="text-body-lg text-charcoal/85">{page.intro}</p>
            <div className="relative mt-10 aspect-[4/3] overflow-hidden rounded-sm sm:aspect-[2/1] lg:aspect-[5/2]">
                <Image
                    src="/images/private-lessons/county-hall-dance-studio.jpg"
                    alt="Sunlit wooden-floor dance studio at County Hall, with mirrors and tall windows."
                    fill
                    sizes="(max-width: 1279px) 100vw, 1216px"
                    className="object-cover object-[50%_60%]"
                />
            </div>
          </Container>
        </section>
      )}
      <PrivateLessonsSections sections={page.sections} />
      <section className="bg-blush/30 section-y">
        <Container>
          <div>
          <h2 className="text-h2 text-charcoal">{page.howItWorks.title}</h2>
          <ol className="mt-8 space-y-7">
            {page.howItWorks.steps.map((step, index) => (
              <li key={step.title} className="flex gap-5">
                <span aria-hidden="true" className="text-h3 flex size-11 shrink-0 items-center justify-center rounded-full bg-burgundy text-ivory">{index + 1}</span>
                <p className="text-body-lg pt-1 text-charcoal/85">
                  <strong className="text-charcoal">{step.title}</strong>
                  {": "}
                  {step.body}
                </p>
              </li>
            ))}
          </ol>
          </div>
        </Container>
      </section>
      <section className="section-y">
        <Container>
          <div className="cta-block">
          <h2 className="text-h2 text-charcoal">{page.cta.title}</h2>
          <p className="text-body-lg mt-4 text-charcoal/80">{page.cta.body}</p>
          <div className="mt-8">
            <Button {...page.cta.button} />
          </div>
          {page.cta.secondary && (
            <p className="text-body mt-4 text-charcoal/65">{page.cta.secondary}</p>
          )}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
