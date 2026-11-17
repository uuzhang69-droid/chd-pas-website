import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function DiscoverBand() {
  const { discover } = siteContent.home;

  return (
    <section className="bg-rose/15 section-y" aria-labelledby="discover-heading">
      <Container>
        <div className="cta-block">
          <p className="text-overline text-rose mb-3">{discover.overline}</p>
          <h2 id="discover-heading" className="text-h2 text-charcoal">
            {discover.title}
          </h2>
          <p className="text-body-lg mt-4 text-charcoal/75">{discover.description}</p>
          <div className="mt-8">
            <Button {...discover.cta} />
          </div>
        </div>
      </Container>
    </section>
  );
}
