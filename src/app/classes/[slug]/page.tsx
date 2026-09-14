import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getAllClassSlugs, getClassBySlug } from "@/content/helpers";
import { siteContent } from "@/content/site";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return getAllClassSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const style = getClassBySlug(slug);
  if (!style) return {};
  return {
    title: style.name,
    description: style.metaDescription,
  };
}

export default async function ClassStylePage({ params }: PageProps) {
  const { slug } = await params;
  const style = getClassBySlug(slug);
  if (!style) notFound();

  const { detailLabels } = siteContent.pages.classes;

  return (
    <PageShell>
      <section className="relative overflow-hidden bg-charcoal text-ivory">
        <div className="absolute inset-0">
          <Image
            src={style.hero.image.src}
            alt={style.hero.image.alt}
            fill
            className="object-cover opacity-35"
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 to-charcoal/50" />
        </div>
        <Container className="relative py-20 md:py-28">
          <Link
            href="/classes"
            className="text-small font-semibold text-rose hover:text-ivory"
          >
            ← {detailLabels.backLink}
          </Link>
          <p className="text-overline text-rose mt-6 mb-3">{style.hero.overline}</p>
          <h1 className="text-display max-w-3xl text-ivory">{style.hero.title}</h1>
          <p className="text-body-lg mt-5 max-w-2xl text-ivory/85">{style.hero.subtitle}</p>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-3">
            <div className="lg:col-span-2 space-y-5">
              {style.intro.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-body-lg text-charcoal/80">
                  {paragraph}
                </p>
              ))}
            </div>
            <aside className="rounded-sm border border-rose/25 bg-ivory p-6 h-fit">
              <h2 className="text-h4 text-rose">{detailLabels.ageGroups}</h2>
              <ul className="mt-4 space-y-4">
                {style.ageGroups.map((group) => (
                  <li key={group.label}>
                    <p className="text-body font-semibold text-charcoal">{group.label}</p>
                    <p className="text-small mt-1 text-charcoal/65">{group.description}</p>
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                <Button {...style.cta} className="w-full" />
              </div>
            </aside>
          </div>

          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {style.highlights.map((item) => (
              <article
                key={item.title}
                className="rounded-sm border border-taupe/30 p-6 transition-shadow hover:shadow-md"
              >
                <h3 className="text-h3 text-charcoal">{item.title}</h3>
                <p className="text-body mt-3 text-charcoal/75">{item.description}</p>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
