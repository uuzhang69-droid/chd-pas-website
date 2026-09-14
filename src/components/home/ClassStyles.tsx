import Image from "next/image";
import Link from "next/link";
import { siteContent } from "@/content/site";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function ClassStyles() {
  const { classStyles } = siteContent.home;

  return (
    <section className="bg-ivory py-16 md:py-20" aria-labelledby="class-styles-heading">
      <Container>
        <SectionHeading
          overline={classStyles.overline}
          title={classStyles.title}
          subtitle={classStyles.subtitle}
          align="center"
          className="mx-auto mb-10 text-center md:mb-12"
        />

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 md:gap-4">
          {classStyles.items.map((style) => (
            <Link
              key={style.id}
              href={style.href}
              className="group relative aspect-[3/4] overflow-hidden rounded-sm md:aspect-[4/5]"
            >
              <Image
                src={style.image.src}
                alt={style.image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/15 to-transparent transition-opacity group-hover:from-rose/80" />
              <div className="absolute inset-x-0 bottom-0 p-3 md:p-4">
                <h3 className="font-[family-name:var(--font-cormorant)] text-base leading-tight text-ivory md:text-xl">
                  {style.name}
                </h3>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
