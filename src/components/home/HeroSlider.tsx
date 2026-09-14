"use client";

import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { siteContent } from "@/content/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

function getVideoSrc(item: (typeof siteContent.home.hero.slides)[number]): string | undefined {
  return "videoSrc" in item && typeof item.videoSrc === "string"
    ? item.videoSrc
    : undefined;
}

export function HeroSlider() {
  const { hero } = siteContent.home;
  const { hero: heroUi } = siteContent.ui;
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goTo = useCallback(
    (index: number) => {
      setActiveIndex((index + hero.slides.length) % hero.slides.length);
    },
    [hero.slides.length],
  );

  useEffect(() => {
    if (isPaused) return;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % hero.slides.length);
    }, hero.autoplayIntervalMs);
    return () => window.clearInterval(timer);
  }, [hero.autoplayIntervalMs, hero.slides.length, isPaused]);

  const slide = hero.slides[activeIndex];

  return (
    <section
      className="relative min-h-[72vh] overflow-hidden bg-charcoal md:min-h-[85vh]"
      aria-roledescription="carousel"
      aria-label={heroUi.featuredHighlights}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      {hero.slides.map((item, index) => (
        <div
          key={item.id}
          className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
          aria-hidden={index !== activeIndex}
        >
          {(() => {
            const videoSrc = getVideoSrc(item);
            return videoSrc ? (
            <video
              className="absolute inset-0 h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster={item.image.src}
            >
              <source src={videoSrc} type="video/mp4" />
            </video>
          ) : (
            <Image
              src={item.image.src}
              alt={item.image.alt}
              fill
              priority={index === 0}
              className="object-cover"
              sizes="100vw"
            />
          );
          })()}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/45 to-charcoal/20" />
        </div>
      ))}

      <Container className="relative z-10 flex min-h-[72vh] items-center py-20 md:min-h-[85vh]">
        <div
          key={slide.id}
          className="max-w-2xl animate-fade-up text-ivory"
        >
          <h1 className="text-display font-normal text-ivory">{slide.headline}</h1>
          <p className="text-body-lg mt-6 max-w-xl text-ivory/90">{slide.blurb}</p>
          <div className="mt-10">
            <Button {...slide.cta} />
          </div>
        </div>
      </Container>

      <div className="absolute bottom-8 left-0 right-0 z-10">
        <Container className="flex items-center justify-between gap-4">
          <div className="flex gap-2" role="tablist" aria-label={heroUi.slideNavigation}>
            {hero.slides.map((item, index) => (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={index === activeIndex}
                aria-label={`${heroUi.slidePrefix} ${index + 1}: ${item.headline}`}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  index === activeIndex
                    ? "w-10 bg-rose"
                    : "w-4 bg-ivory/40 hover:bg-ivory/70"
                }`}
                onClick={() => goTo(index)}
              />
            ))}
          </div>
          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              className="rounded-sm border border-ivory/30 px-4 py-2 text-small text-ivory transition-colors hover:border-rose hover:text-rose"
              onClick={() => goTo(activeIndex - 1)}
            >
              {hero.previousLabel}
            </button>
            <button
              type="button"
              className="rounded-sm border border-ivory/30 px-4 py-2 text-small text-ivory transition-colors hover:border-rose hover:text-rose"
              onClick={() => goTo(activeIndex + 1)}
            >
              {hero.nextLabel}
            </button>
          </div>
        </Container>
      </div>
    </section>
  );
}
