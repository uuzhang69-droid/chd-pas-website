import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PageHero } from "@/components/ui/PageHero";

const page = siteContent.pages.membership.overview;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
};

export default function MembershipPage() {
  return (
    <PageShell>
      <PageHero {...page.hero} />
      <section className="py-12 md:py-16">
        <Container>
          <p className="text-body-lg max-w-3xl text-charcoal/80">{page.intro}</p>
        </Container>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <Container>
          <h2 className="text-h2 text-charcoal">{page.plans.title}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {page.plans.items.map((plan) => (
              <article
                key={plan.id}
                className="flex flex-col rounded-sm border border-rose/25 bg-white p-8"
              >
                <h3 className="text-h3 text-charcoal">{plan.title}</h3>
                <p className="text-display mt-3 text-rose">{plan.price}</p>
                <p className="text-body mt-4 flex-1 text-charcoal/75">{plan.body}</p>
                <div className="mt-8">
                  <Button {...page.plans.cta} className="w-full" />
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <h2 className="text-h2 text-charcoal">{page.styles.title}</h2>
          <p className="text-body-lg mt-6 text-charcoal/80">{page.styles.items.join(" · ")}</p>
        </Container>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <Container>
          <h2 className="text-h2 text-charcoal">{page.benefits.title}</h2>
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {page.benefits.items.map((item) => (
              <article key={item.title} className="rounded-sm border border-taupe/30 bg-white p-6">
                <h3 className="text-h4 text-charcoal">{item.title}</h3>
                <p className="text-body mt-2 text-charcoal/75">{item.body}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <h2 className="text-h2 text-charcoal">{page.howToJoin.title}</h2>
          <ol className="mt-8 space-y-4">
            {page.howToJoin.steps.map((step, index) => (
              <li key={step} className="flex gap-4">
                <span className="text-h3 text-rose">{index + 1}</span>
                <p className="text-body-lg text-charcoal/80">{step}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      <section className="bg-ivory py-16 md:py-24">
        <Container className="max-w-3xl">
          <h2 className="text-h2 mb-8 text-charcoal">{page.faq.title}</h2>
          <FaqAccordion items={page.faq.items} />
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
