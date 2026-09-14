import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { ClassStyleGrid } from "@/components/ui/ContentGrids";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";

const { classes } = siteContent.pages;

export const metadata: Metadata = {
  title: classes.meta.title,
  description: classes.meta.description,
};

export default function ClassesPage() {
  const tiles = classes.styles.map((style) => ({
    id: `style-${style.slug}`,
    name: style.name,
    slug: style.slug,
    href: `/classes/${style.slug}`,
    image: style.hero.image,
  }));

  return (
    <PageShell>
      <PageHero {...classes.hero} />
      <section className="py-16 md:py-24">
        <Container>
          <p className="text-body-lg max-w-3xl text-charcoal/75">{classes.intro}</p>
          <div className="mt-10">
            <ClassStyleGrid items={tiles} />
          </div>
          <div className="mt-12">
            <Button {...classes.cta} />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
