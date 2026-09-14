import Image from "next/image";
import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function AboutTeaser() {
  const { aboutTeaser } = siteContent.home;

  return (
    <section className="py-16 md:py-24" aria-labelledby="about-teaser-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sm">
            <Image
              src={aboutTeaser.image.src}
              alt={aboutTeaser.image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
          <div>
            <p className="text-overline text-rose mb-3">{aboutTeaser.overline}</p>
            <h2 id="about-teaser-heading" className="text-h1 text-charcoal">
              {aboutTeaser.title}
            </h2>
            <div className="mt-6 space-y-4">
              {aboutTeaser.body.map((paragraph) => (
                <p key={paragraph.slice(0, 24)} className="text-body-lg text-charcoal/80">
                  {paragraph}
                </p>
              ))}
            </div>
            <div className="mt-8">
              <Button {...aboutTeaser.cta} />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
