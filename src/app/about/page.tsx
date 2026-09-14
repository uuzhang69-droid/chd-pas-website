import type { Metadata } from "next";
import Image from "next/image";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import { SectionHeading } from "@/components/ui/SectionHeading";

const { about } = siteContent.pages;

export const metadata: Metadata = {
  title: about.meta.title,
  description: about.meta.description,
};

export default function AboutPage() {
  return (
    <PageShell>
      <PageHero {...about.hero} />

      <section className="py-16 md:py-24">
        <Container>
          <div className="max-w-3xl">
            <h2 className="text-h2 text-charcoal">{about.story.title}</h2>
            <div className="mt-6 space-y-4">
              {about.story.paragraphs.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-body-lg text-charcoal/80">
                  {paragraph}
                </p>
              ))}
            </div>
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

      <section id={about.faculty.id} className="py-16 md:py-24 scroll-mt-28">
        <Container>
          <SectionHeading
            overline={about.faculty.overline}
            title={about.faculty.title}
            subtitle={about.faculty.intro}
          />
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            {about.faculty.members.map((member) => (
              <article key={member.id} className="text-center">
                <div className="relative mx-auto aspect-square w-48 overflow-hidden rounded-full">
                  <Image
                    src={member.image.src}
                    alt={member.image.alt}
                    fill
                    className="object-cover"
                    sizes="192px"
                  />
                </div>
                <h3 className="text-h3 mt-6 text-charcoal">{member.name}</h3>
                <p className="text-overline mt-1 text-rose">{member.role}</p>
                <p className="text-body mt-4 text-charcoal/75">{member.bio}</p>
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
