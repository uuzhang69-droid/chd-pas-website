import Image from "next/image";
import type { PageHeroContent } from "@/content/types";
import { Container } from "@/components/ui/Container";

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
      <section className="relative overflow-hidden bg-charcoal text-ivory">
        <div className="absolute inset-0">
          <Image
            src={image.src}
            alt={image.alt}
            fill
            className={`object-cover opacity-40 ${imageClassName}`.trim()}
            sizes="100vw"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/90 via-charcoal/70 to-charcoal/50" />
        </div>
        <Container className={`relative ${compact ? "py-16 md:py-20" : "py-20 md:py-28"}`}>
          {overline && <p className="text-overline text-rose mb-3">{overline}</p>}
          <h1 className="text-h1 md:text-display max-w-3xl text-ivory">{title}</h1>
          {subtitle && (
            <p className="text-body-lg mt-5 max-w-2xl text-ivory/85">{subtitle}</p>
          )}
        </Container>
      </section>
    );
  }

  return (
    <section className="border-b border-taupe/30 bg-ivory">
      <Container className={`${compact ? "py-14 md:py-16" : "py-16 md:py-24"}`}>
        {overline && <p className="text-overline text-rose mb-3">{overline}</p>}
        <h1 className="text-h1 max-w-3xl text-charcoal">{title}</h1>
        {subtitle && (
          <p className="text-body-lg mt-5 max-w-2xl text-charcoal/75">{subtitle}</p>
        )}
      </Container>
    </section>
  );
}
