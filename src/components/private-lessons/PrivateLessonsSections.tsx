import type { SectionedPageSection } from "@/content/types";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

type PrivateLessonsSectionsProps = {
    sections: readonly SectionedPageSection[];
};

/** These sections have no image, so each is ONE column: the heading above its text, on the same left edge, inside the page container. */
export function PrivateLessonsSections({ sections }: PrivateLessonsSectionsProps) {
    return (
        <Container>
            <div className="border-t border-taupe/40">
                {sections.map((section, index) => (
                    <section
                        key={section.id}
                        id={section.id}
                        className={`scroll-mt-32 section-y-tight ${index > 0 ? "border-t border-taupe/40" : ""}`}
                    >
                        <div>
                            <h2 className="text-h2 text-charcoal">{section.title}</h2>
                            {section.body && <p className="text-body-lg mt-5 text-charcoal/85">{section.body}</p>}
                            {section.cta && (
                                <div className="mt-7">
                                    <Button {...section.cta} />
                                </div>
                            )}
                        </div>
                    </section>
                ))}
            </div>
        </Container>
    );
}
