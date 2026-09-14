import type { SectionedPageContent } from "@/content/types";
import { siteContent } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

type SectionedPageProps = SectionedPageContent;

export function SectionedPage({ hero, intro, sections }: SectionedPageProps) {
  const { comingSoon } = siteContent.ui.sectionedPage;

  return (
    <>
      <PageHero {...hero} />
      {intro && (
        <section className="py-12 md:py-16">
          <Container>
            <p className="text-body-lg max-w-3xl text-charcoal/80">{intro}</p>
          </Container>
        </section>
      )}
      {sections.map((section, index) => (
        <section
          key={section.id}
          id={section.id}
          className={`scroll-mt-32 py-16 md:py-24 ${index % 2 === 1 ? "bg-ivory" : ""}`}
        >
          <Container>
            <h2 className="text-h2 text-charcoal">{section.title}</h2>
            <p className="text-body mt-4 max-w-3xl text-charcoal/75">{comingSoon}</p>
          </Container>
        </section>
      ))}
    </>
  );
}
