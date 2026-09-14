import type { Metadata } from "next";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PageHero } from "@/components/ui/PageHero";
import { PortableTextBody } from "@/components/ui/PortableTextBody";
import { fetchFaqPage } from "@/sanity/fetch";

export async function generateMetadata(): Promise<Metadata> {
  const faq = await fetchFaqPage();
  return {
    title: faq.meta.title,
    description: faq.meta.description,
  };
}

export default async function FaqPage() {
  const faq = await fetchFaqPage();

  return (
    <PageShell>
      <PageHero {...faq.hero} />
      {(faq.intro || faq.body) && (
        <section className="py-12 md:py-16">
          <Container>
            {faq.intro && <p className="text-body-lg max-w-3xl text-charcoal/80">{faq.intro}</p>}
            {faq.body && <PortableTextBody value={faq.body} className={faq.intro ? "mt-6" : ""} />}
          </Container>
        </section>
      )}
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <FaqAccordion items={faq.items} />
          <div className="mt-12 rounded-sm border border-rose/25 bg-ivory p-8 text-center">
            <p className="text-body-lg text-charcoal">{faq.cta.text}</p>
            <div className="mt-4">
              <Button {...faq.cta.button} />
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
