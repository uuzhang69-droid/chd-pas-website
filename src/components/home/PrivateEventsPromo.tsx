import Image from "next/image";
import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function PrivateEventsPromo() {
  const { privateEvents } = siteContent.home;

  return (
    <section className="bg-charcoal py-16 md:py-24" aria-labelledby="private-events-heading">
      <Container>
        <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div className="order-2 lg:order-1">
            <p className="text-overline text-rose mb-3">{privateEvents.overline}</p>
            <h2 id="private-events-heading" className="text-h1 text-ivory">
              {privateEvents.title}
            </h2>
            <p className="text-body-lg mt-6 text-ivory/85">{privateEvents.body}</p>
            <div className="mt-8">
              <Button {...privateEvents.cta} />
            </div>
          </div>
          <div className="relative order-1 aspect-[4/3] overflow-hidden rounded-sm lg:order-2">
            <Image
              src={privateEvents.image.src}
              alt={privateEvents.image.alt}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}
