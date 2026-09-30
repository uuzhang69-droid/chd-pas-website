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
      className="bg-ivory pt-6 md:pt-8"
      aria-roledescription="carousel"
      aria-label={heroUi.featuredHighlights}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocusCapture={() => setIsPaused(true)}
      onBlurCapture={() => setIsPaused(false)}
    >
      <Container>
        <div className="relative min-h-[72vh] overflow-hidden rounded-sm bg-charcoal md:min-h-[85vh]">
          {hero.slides.map((item, index) => (
            <div
              key={item.id}
              className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                index === activeIndex ? "opacity-100" : "pointer-events-none opacity-0"
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
                    sizes="(max-width: 1280px) 100vw, 1280px"
                  />
                );
              })()}
              <div className="absolute inset-0 bg-gradient-to-r from-charcoal/75 via-charcoal/45 to-charcoal/20" />
            </div>
          ))}

          <div className="relative z-10 flex min-h-[72vh] items-center px-5 py-20 sm:px-8 md:min-h-[85vh]">
            <div key={slide.id} className="max-w-2xl animate-fade-up text-ivory">
              <h1 className="font-[family-name:var(--font-cormorant)] text-[calc(2.5rem*2/3)] leading-[1.05] tracking-[0.02em] font-normal text-ivory md:text-[calc(3.5rem*2/3)]">
                {slide.headline}
              </h1>
              <p className="text-body-lg mt-6 max-w-xl text-ivory/90">{slide.blurb}</p>
              <div className="mt-10">
                <Button {...slide.cta} />
              </div>
            </div>
          </div>

          <div className="absolute bottom-8 left-0 right-0 z-10 px-5 sm:px-8">
            <div className="flex items-center justify-between gap-4">
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
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
