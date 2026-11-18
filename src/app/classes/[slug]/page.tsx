import type { Metadata } from "next";
import { pageMetadata } from "@/lib/seo/metadata";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getAllClassSlugs, getClassBySlug } from "@/content/helpers";
import { siteContent } from "@/content/site";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo/structured-data";
import { PageShell } from "@/components/layout/PageShell";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Eyebrow, HeroBackLink, HeroBanner } from "@/components/ui/HeroParts";

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
  return pageMetadata({
    title: `${style.hero.title} Classes in London`,
    description: style.metaDescription,
    path: `/classes/${slug}`,
    image: style.hero.image,
  });
}

/** "About {name}" style labels keep the wording in the content files. */
const withName = (label: string, name: string) => label.replace("{name}", name);

export default async function ClassStylePage({ params }: PageProps) {
  const { slug } = await params;
  const style = getClassBySlug(slug);
  if (!style) notFound();

  const { detailLabels } = siteContent.pages.classes;
  const { instructor } = style;
  const aboutTitle = style.about.title ?? withName(detailLabels.about, style.name);
  // A single format is introduced here, as one more paragraph of the introduction.
  const aboutParagraphs = [...style.about.paragraphs, ...(style.formats.length === 1 ? [style.formats[0].summary] : [])];

  return (
    <PageShell>
      <JsonLd
        data={breadcrumbJsonLd([
          {
            name: siteContent.pages.classesInfo.meta.title,
            path: "/classes-info",
          },
          { name: style.name, path: `/classes/${slug}` },
        ])}
      />

      {/* 1. Hero */}
      <HeroBanner image={style.hero.image}>
        <HeroBackLink href="/classes-info">{detailLabels.backLink}</HeroBackLink>
        <Eyebrow className="mt-8 mb-5">{style.hero.overline}</Eyebrow>
        <h1 className="text-display max-w-4xl text-ivory">{style.hero.title}</h1>
        <p className="text-body-lg mt-5 max-w-[52rem] text-ivory/90">{style.hero.subtitle}</p>
      </HeroBanner>

      {/* 2. Introduction. One rule for every section on this page:
             - with an image: two columns (picture, then heading and text);
             - without an image: ONE column, the heading above the paragraphs, all on the same left edge.
             Both sit in the same Container, so the outer left and right edges never change. */}
      <section id="about" className="scroll-mt-32 section-y">
        <Container>
          {style.about.image ? (
            <div className="editorial-split">
              <Image
                src={style.about.image.src}
                alt={style.about.image.alt}
                width={style.about.image.width}
                height={style.about.image.height}
                sizes="(max-width: 1023px) 92vw, 36vw"
                className="h-auto w-full rounded-sm shadow-sm"
              />
              <div>
                <h2 className="text-h2 text-charcoal">{aboutTitle}</h2>
                <div className="mt-6 space-y-5">
                  {aboutParagraphs.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-body-lg text-charcoal/85">{paragraph}</p>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div>
              <h2 className="text-h2 text-charcoal">{aboutTitle}</h2>
              <div className="mt-6 space-y-5">
                {aboutParagraphs.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)} className="text-body-lg text-charcoal/85">{paragraph}</p>
                ))}
              </div>
            </div>
          )}
        </Container>
      </section>

      {/* 3. Compact editorial options; a single format is introduced above. One column: heading above the list.
             No line between the introduction and this heading (the section spacing is enough); the list keeps its own
             separators between the individual sessions. */}
      {style.formats.length > 1 && (
        <section id="classes" className="scroll-mt-32 section-pb">
          <Container>
            <div>
              <div>
                <h2 className="text-h2 text-charcoal">
                  {style.formatSection?.title ?? withName(detailLabels.formats, style.name)}
                </h2>
              </div>
              <ul className="mt-8 divide-y divide-taupe/40 border-y border-taupe/40">
                {style.formats.map((format) => (
                  <li
                    key={format.name}
                    className={`py-7 ${format.image ? "grid items-start gap-6 md:grid-cols-[minmax(0,1fr)_12rem] md:gap-12" : ""}`}
                  >
                    <div>
                      <h3 className="text-h3 text-charcoal">{format.title ?? format.name}</h3>
                      <p className="text-body-lg mt-3 text-charcoal/85">{format.summary}</p>
                    </div>
                    {format.image && (
                      <Image
                        src={format.image.src}
                        alt={format.image.alt}
                        width={format.image.width}
                        height={format.image.height}
                        sizes="192px"
                        className="h-auto w-44 rounded-sm md:w-48 md:justify-self-end"
                      />
                    )}
                  </li>
                ))}
              </ul>
              {style.formatsNote && <p className="text-body mt-5 text-charcoal/70">{style.formatsNote}</p>}
            </div>
          </Container>
        </section>
      )}

      {/* 4. Optional additional information (a heading above a grid of cards: one column of content). */}
      {!!style.expect?.items.length && (
        <section id="expect" className="scroll-mt-32 section-pb">
          <Container>
            <div>
              <h2 className="text-h2 text-charcoal">{style.expect.title ?? detailLabels.expect}</h2>
              <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {style.expect.items.map((item) => (
                  <li key={item.title} className="rounded-sm border border-taupe/40 bg-white/50 p-6">
                    <h3 className="text-h4 text-charcoal">{item.title}</h3>
                    <p className="text-body mt-3 text-charcoal/80">{item.description}</p>
                  </li>
                ))}
              </ul>
            </div>
          </Container>
        </section>
      )}

      {/* 5. The instructor(s). The portrait is an image, so this section has two columns under one heading. */}
      <section id="instructor" className="scroll-mt-32 bg-blush/30 section-y">
        <Container>
          <h2 className="text-h2 text-charcoal">{style.instructorHeading}</h2>
          <div className="portrait-split mt-10">
            <div className="flex items-center gap-6 lg:flex-col lg:items-start lg:gap-5">
              <div className="relative size-36 shrink-0 overflow-hidden rounded-full border-4 border-ivory shadow-md sm:size-40 lg:size-52">
                <Image
                  src={instructor.image.src}
                  alt={instructor.image.alt}
                  fill
                  className="object-cover"
                  sizes="208px"
                />
              </div>
              <div>
                <h3 className="text-h3 text-charcoal">{instructor.name}</h3>
                {instructor.role && <p className="text-body mt-1 text-charcoal/70">{instructor.role}</p>}
              </div>
            </div>
            <div className="space-y-5">
              <p className="text-body-lg text-charcoal/85">{instructor.bio}</p>
              {instructor.moreBio?.map((paragraph) => (
                <p key={paragraph.slice(0, 32)} className="text-body-lg text-charcoal/85">
                  {paragraph}
                </p>
              ))}
            </div>
          </div>
        </Container>
      </section>

      {/* 6. Next step */}
      <section id="next" className="section-y">
        <Container>
          <div className="cta-block">
            <h2 className="text-h2 text-charcoal">{style.closing.title}</h2>
            <p className="text-body-lg mt-5 text-charcoal/85">{style.closing.body}</p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4">
              <Button {...style.cta} />
              <Button label={detailLabels.askUs} href="/contact?subject=classes" variant="secondary" />
            </div>
          </div>
        </Container>
      </section>
    </PageShell>
  );
}
