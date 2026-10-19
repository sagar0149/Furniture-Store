
"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

export type HeroSlide = {
  id: string;
  imageUrl: string;
  imageAlt: string;
  eyebrow: string;
  title: string;
  description: string;
  buttonText: string;
  href: string;
};

type HeroCarouselProps = {
  slides: HeroSlide[];
};

const SLIDE_DURATION = 6000;

export default function HeroCarousel({ slides }: HeroCarouselProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const [progressKey, setProgressKey] = useState(0);

  useEffect(() => {
    if (paused || slides.length < 2) return;

    const timer = window.setTimeout(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
      setProgressKey((current) => current + 1);
    }, SLIDE_DURATION);

    return () => window.clearTimeout(timer);
  }, [activeIndex, paused, slides.length, progressKey]);

  function navigateTo(index: number) {
    setActiveIndex((index + slides.length) % slides.length);
    setProgressKey((current) => current + 1);
  }

  if (slides.length === 0) {
    return (
      <section className="flex min-h-[360px] w-full items-center justify-center bg-[#e8dfd1] px-6 py-16 text-center sm:min-h-[440px] lg:min-h-[520px]">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-[#806747]">
            A considered collection
          </p>

          <h1 className="mt-5 font-serif text-4xl text-[#28251f] sm:text-6xl lg:text-7xl">
            Room to live beautifully.
          </h1>

          <Link
            href="/products"
            className="premium-button mt-8 inline-flex rounded-full bg-[#28251f] px-7 py-4 text-sm text-white"
          >
            Explore the collection ↗
          </Link>
        </div>
      </section>
    );
  }

  const slide = slides[activeIndex] ?? slides[0];

  return (
    <section
      aria-label="Featured furniture promotions"
      className="relative isolate w-full overflow-hidden bg-[#211e19] text-[#fbf7ef]"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (
          !event.currentTarget.contains(
            event.relatedTarget as Node | null,
          )
        ) {
          setPaused(false);
        }
      }}
    >
      <div className="relative h-[420px] w-full sm:h-[500px] lg:h-[min(620px,65vw)] lg:min-h-[500px]">
        {slides.map((item, index) => (
          <div
            key={item.id}
            aria-hidden={index !== activeIndex}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              index === activeIndex
                ? "z-0 opacity-100"
                : "pointer-events-none z-0 opacity-0"
            }`}
          >
            <Image
              src={item.imageUrl}
              alt={item.imageAlt}
              fill
              priority={index === 0}
              sizes="100vw"
              className={`object-cover transition-transform duration-[7000ms] ease-out ${
                index === activeIndex ? "scale-105" : "scale-100"
              }`}
            />

            <div className="absolute inset-0 bg-gradient-to-r from-[#211e19]/90 via-[#211e19]/55 to-[#211e19]/10" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#211e19]/65 via-transparent to-black/10" />
          </div>
        ))}

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-3 z-10 border border-white/15 sm:inset-5 lg:inset-6"
        />

        <div className="relative z-20 flex h-full w-full items-center px-7 py-16 sm:px-12 lg:px-16 xl:px-20 2xl:px-24">
          <div key={slide.id} className="max-w-4xl">
            <div className="animate-reveal flex items-center gap-4">
              <span className="h-px w-12 bg-[#c7a879]" />

              <p className="text-[10px] font-medium uppercase tracking-[0.28em] text-[#e2c49b] sm:text-xs">
                {slide.eyebrow}
              </p>
            </div>

            <h1 className="animate-reveal-delay-1 mt-6 max-w-4xl font-serif text-4xl font-normal leading-[1.08] tracking-[-0.035em] sm:mt-7 sm:text-6xl lg:text-7xl xl:text-8xl">
              {slide.title}
            </h1>

            <p className="animate-reveal-delay-2 mt-5 max-w-xl text-sm leading-7 text-white/80 sm:mt-6 sm:text-base sm:leading-8">
              {slide.description}
            </p>

            <div className="animate-reveal-delay-2 mt-7 flex flex-wrap items-center gap-5 sm:mt-9">
              <Link
                href={slide.href}
                className="premium-button inline-flex min-h-12 items-center justify-center rounded-full bg-[#e2c49b] px-7 text-sm font-medium text-[#211e19]"
              >
                {slide.buttonText}
                <span className="ml-4 text-lg" aria-hidden="true">
                  ↗
                </span>
              </Link>

              <span className="hidden text-[10px] uppercase tracking-[0.2em] text-white/65 sm:inline">
                Thoughtfully chosen · Made for living
              </span>
            </div>
          </div>
        </div>

        {slides.length > 1 && (
          <div className="absolute bottom-5 left-6 right-6 z-30 flex items-end justify-between sm:bottom-7 sm:left-12 sm:right-12 lg:bottom-8 lg:left-16 lg:right-16 xl:left-20 xl:right-20">
            <div className="flex items-center gap-3 sm:gap-6">
              <span className="font-serif text-xl text-[#e2c49b] sm:text-2xl">
                {String(activeIndex + 1).padStart(2, "0")}
              </span>

              <div className="flex gap-1 sm:gap-2">
                {slides.map((item, index) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateTo(index)}
                    aria-label={`Show slide ${index + 1}`}
                    aria-current={index === activeIndex ? "true" : undefined}
                    className="group flex h-8 items-center"
                  >
                    <span className="relative block h-[2px] w-6 overflow-hidden bg-white/35 sm:w-10">
                      {index === activeIndex && (
                        <span
                          key={`${item.id}-${progressKey}`}
                          className={`absolute inset-y-0 left-0 bg-[#e2c49b] ${
                            paused ? "w-full" : "hero-progress"
                          }`}
                        />
                      )}
                    </span>
                  </button>
                ))}
              </div>

              <span className="text-xs tracking-widest text-white/60">
                {String(slides.length).padStart(2, "0")}
              </span>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => navigateTo(activeIndex - 1)}
                aria-label="Previous slide"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-lg transition-colors hover:border-[#e2c49b] hover:bg-[#e2c49b] hover:text-[#211e19] sm:h-11 sm:w-11 sm:text-xl"
              >
                ←
              </button>

              <button
                type="button"
                onClick={() => navigateTo(activeIndex + 1)}
                aria-label="Next slide"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/35 text-lg transition-colors hover:border-[#e2c49b] hover:bg-[#e2c49b] hover:text-[#211e19] sm:h-11 sm:w-11 sm:text-xl"
              >
                →
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
