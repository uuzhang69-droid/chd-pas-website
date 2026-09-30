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
          align="center"
          className="mx-auto mb-10 text-center md:mb-12"
        />

        <div className="flex flex-nowrap justify-center gap-2 overflow-x-auto pb-1 sm:gap-3 md:gap-4 md:overflow-visible">
          {classStyles.items.map((style) => (
            <Link
              key={style.id}
              href={style.href}
              className="group relative aspect-[3/4] w-[29%] min-w-[5.75rem] max-w-[11.5rem] shrink-0 overflow-hidden rounded-sm sm:w-auto sm:min-w-0 sm:max-w-none sm:flex-1 md:aspect-[4/5]"
            >
              <Image
                src={style.image.src}
                alt={style.image.alt}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                sizes="(max-width: 768px) 18vw, 20vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-charcoal/80 via-charcoal/15 to-transparent transition-opacity group-hover:from-rose/80" />
              <div className="absolute inset-x-0 bottom-0 p-2 sm:p-3 md:p-4">
                <h3 className="font-[family-name:var(--font-cormorant)] text-sm leading-tight whitespace-nowrap text-ivory sm:text-base md:text-xl">
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
