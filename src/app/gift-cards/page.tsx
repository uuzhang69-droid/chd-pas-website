import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const { giftCards } = siteContent.pages;

export const metadata: Metadata = {
  title: giftCards.meta.title,
  description: giftCards.meta.description,
};

export default function GiftCardsPage() {
  return (
    <PageShell>
      <PageHero {...giftCards.hero} />
      <section className="py-16 md:py-24">
        <Container>
          <p className="text-body-lg max-w-3xl text-charcoal/75">{giftCards.intro}</p>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {giftCards.options.map((option) => (
              <article
                key={option.id}
                className="flex flex-col rounded-sm border border-rose/25 bg-ivory p-8 text-center transition-shadow hover:shadow-lg"
              >
                <p className="text-display text-rose">{option.amount}</p>
                <h2 className="text-h3 mt-2 text-charcoal">{option.title}</h2>
                <p className="text-body mt-4 flex-1 text-charcoal/75">{option.description}</p>
                <div className="mt-8">
                  <Button {...option.cta} className="w-full" />
                </div>
              </article>
            ))}
          </div>
          <p className="text-small mt-12 max-w-2xl text-charcoal/60">{giftCards.terms}</p>
        </Container>
      </section>
    </PageShell>
  );
}
