import Image from "next/image";
import type { BookingEmbed } from "@/content/types";
import { Container } from "@/components/ui/Container";

type BookingEmbedProps = BookingEmbed & {
  id?: string;
};

export function BookingEmbedPlaceholder({
  id = "booking-widget",
  title,
  description,
  placeholderLabel,
  placeholderHint,
  providerNote,
  image,
}: BookingEmbedProps) {
  return (
    <section id={id} className="scroll-mt-28 py-16 md:py-20" aria-labelledby="booking-heading">
      <Container>
        <h2 id="booking-heading" className="text-h2 text-charcoal">
          {title}
        </h2>
        <p className="text-body-lg mt-4 max-w-3xl text-charcoal/75">{description}</p>

        {image ? (
          <div className="mt-10 overflow-hidden rounded-sm border border-taupe/30 bg-ivory">
            <Image
              src={image.src}
              alt={image.alt}
              width={image.width ?? 853}
              height={image.height ?? 1024}
              className="h-auto w-full"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority
            />
          </div>
        ) : (
          <div
            className="mt-10 flex min-h-[420px] flex-col items-center justify-center rounded-sm border-2 border-dashed border-rose/40 bg-ivory px-6 py-16 text-center"
            role="region"
            aria-label={placeholderLabel}
          >
            <p className="text-overline text-rose">{placeholderLabel}</p>
            <p className="text-body mt-4 max-w-lg text-charcoal/70">{placeholderHint}</p>
            <p className="text-small mt-6 max-w-md text-charcoal/55">{providerNote}</p>
          </div>
        )}
      </Container>
    </section>
  );
}
