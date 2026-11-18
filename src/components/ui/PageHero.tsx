import type { PageHeroContent } from "@/content/types";
import { Container } from "@/components/ui/Container";
import { Eyebrow, HeroBanner } from "@/components/ui/HeroParts";

type PageHeroProps = PageHeroContent & {
  compact?: boolean;
  imageClassName?: string;
};

export function PageHero({
  overline,
  title,
  subtitle,
  image,
  compact = false,
  imageClassName = "",
}: PageHeroProps) {
  if (image) {
    return (
      <HeroBanner image={image} imageClassName={imageClassName}>
        {overline && <Eyebrow className="mb-5">{overline}</Eyebrow>}
        <h1 className="text-h1 md:text-display max-w-4xl text-ivory">{title}</h1>
        {subtitle && <p className="text-body-lg mt-5 max-w-[52rem] text-ivory/90">{subtitle}</p>}
      </HeroBanner>
    );
  }

  return (
    <section className="border-b border-taupe/30 bg-blush/20">
      <Container className={compact ? "py-12 md:py-16" : "section-y"}>
        {overline && <Eyebrow tone="light" className="mb-5">{overline}</Eyebrow>}
        <h1 className="text-h1 md:text-display max-w-4xl text-charcoal">{title}</h1>
        {subtitle && <p className="text-body-lg mt-5 max-w-[52rem] text-charcoal/80">{subtitle}</p>}
      </Container>
    </section>
  );
}
