import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { FaqAccordion } from "@/components/ui/FaqAccordion";
import { PageHero } from "@/components/ui/PageHero";

const { faq } = siteContent.pages;

export const metadata: Metadata = {
  title: faq.meta.title,
  description: faq.meta.description,
};

export default function FaqPage() {
  return (
    <PageShell>
      <PageHero {...faq.hero} compact />
      <section className="py-16 md:py-24">
        <Container className="max-w-3xl">
          <FaqAccordion items={faq.items} />
          <div className="mt-12 rounded-sm border border-rose/25 bg-ivory p-8 text-center">
            <p className="text-body-lg text-charcoal">{faq.cta.text}</p>
            <div className="mt-5">
              <Button {...faq.cta.button} />
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
