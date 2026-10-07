import type { Metadata } from "next";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { ClassStyleCardGrid } from "@/components/ui/ContentGrids";
import { Container } from "@/components/ui/Container";
import { PageHero } from "@/components/ui/PageHero";
import type { ClassStyleCard } from "@/content/types";

const page = siteContent.pages.classesInfo;
const { styles } = siteContent.pages.classes;

export const metadata: Metadata = {
  title: page.meta.title,
  description: page.meta.description,
};

export default function ClassesInfoPage() {
  const cards: ClassStyleCard[] = styles.map((style) => ({
    id: style.slug,
    name: style.name,
    slug: style.slug,
    href: `/classes/${style.slug}`,
    image: style.hero.image,
    excerpt: style.hero.subtitle,
  }));

  return (
    <PageShell>
      <PageHero {...page.hero} />
      <section className="py-12 md:py-16">
        <Container>
          <p className="text-body-lg max-w-3xl text-charcoal/80">{page.intro}</p>
          <div className="mt-10">
            <ClassStyleCardGrid items={cards} linkLabel={page.cardLink} />
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
