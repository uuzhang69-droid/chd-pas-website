import type { SectionedPageSection } from "@/content/types";
import { AutoPlayGallery } from "@/components/ui/AutoPlayGallery";
import { Container } from "@/components/ui/Container";

type PrivateLessonsSectionsProps = {
  sections: SectionedPageSection[];
};

function SectionBlock({
  section,
  index,
}: {
  section: SectionedPageSection;
  index: number;
}) {
  const galleryOnLeft =
    section.galleryPosition === "left" ||
    (section.galleryPosition !== "right" && index % 2 === 1);

  const textBlock = (
    <div className={galleryOnLeft ? "md:order-2" : "md:order-1"}>
      <h2 className="text-h2 text-charcoal">{section.title}</h2>
      {section.body && (
        <p className="text-body-lg mt-5 text-charcoal/80">{section.body}</p>
      )}
    </div>
  );

  const galleryBlock = section.gallery?.length ? (
    <div className={galleryOnLeft ? "md:order-1" : "md:order-2"}>
      <AutoPlayGallery images={section.gallery} label={`${section.title} gallery`} />
    </div>
  ) : null;

  return (
    <section
      id={section.id}
      className={`scroll-mt-32 py-16 md:py-24 ${index % 2 === 1 ? "bg-ivory" : ""}`}
    >
      <Container>
        <div className="grid items-center gap-10 md:grid-cols-2 md:gap-12 lg:gap-16">
          {textBlock}
          {galleryBlock}
        </div>
      </Container>
    </section>
  );
}

export function PrivateLessonsSections({ sections }: PrivateLessonsSectionsProps) {
  return (
    <>
      {sections.map((section, index) => (
        <SectionBlock key={section.id} section={section} index={index} />
      ))}
    </>
  );
}
