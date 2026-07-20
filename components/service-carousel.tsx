'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ServiceCategory } from '@/lib/services';
import { ServiceIcon } from '@/components/service-icon';
import { cn } from '@/lib/utils';

type ServiceCarouselProps = {
  categories: ServiceCategory[];
  /** slug → Cloudinary public ID, resolved by the home server component from the /admin layer. */
  heroOverrides?: Record<string, string>;
};

/**
 * The homepage service navigator borrows the composition—not the content—from Apple's
 * entertainment shelf: one media-first feature in the centre, adjacent cards peeking at each
 * edge, then a compact strip that lets visitors choose any category. Image slots are resolved
 * by the server; categories without a real image remain honest icon panels.
 */
export function ServiceCarousel({ categories, heroOverrides = {} }: ServiceCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const initialIndex = Math.min(2, Math.max(categories.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(initialIndex);

  const targetFor = (index: number) => {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-service-index="${index}"]`);
    if (!rail || !card) return null;

    return Math.max(0, card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2);
  };

  const goTo = (requestedIndex: number, behavior: ScrollBehavior = 'smooth') => {
    if (categories.length === 0) return;
    const index = (requestedIndex + categories.length) % categories.length;
    const target = targetFor(index);
    if (target === null) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    railRef.current?.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : behavior });
    setActiveIndex(index);
  };

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => goTo(initialIndex, 'auto'));
    return () => window.cancelAnimationFrame(frame);
    // The opening card is deliberately IV Drip: it has a clinic-supplied hero image and leaves
    // a real service card visible at each edge, matching the reference composition.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = () => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      if (rail) {
        const railCentre = rail.scrollLeft + rail.clientWidth / 2;
        let nearestIndex = activeIndex;
        let nearestDistance = Number.POSITIVE_INFINITY;

        categories.forEach((_, index) => {
          const card = rail.querySelector<HTMLElement>(`[data-service-index="${index}"]`);
          if (!card) return;
          const distance = Math.abs(card.offsetLeft + card.clientWidth / 2 - railCentre);
          if (distance < nearestDistance) {
            nearestDistance = distance;
            nearestIndex = index;
          }
        });

        setActiveIndex((current) => (current === nearestIndex ? current : nearestIndex));
      }
      frameRef.current = null;
    });
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    };
  }, []);

  return (
    <div className="service-stream">
      <div className="service-stream-main">
        <div
          ref={railRef}
          id="home-service-stream"
          className="service-stream-rail"
          onScroll={handleScroll}
          role="region"
          aria-label="แกลเลอรีบริการของ Kazumi Clinic"
        >
          {categories.map((category, index) => {
            const imageSrc = heroOverrides[category.slug] ?? category.heroImage;
            const hasImage = Boolean(imageSrc);

            return (
              <article
                key={category.slug}
                data-service-index={index}
                className={cn('service-stream-card', activeIndex === index && 'service-stream-card--active')}
              >
                <Link href={`/${category.slug}`} className="service-stream-card__link group">
                  <div className="service-stream-card__media">
                    {hasImage ? (
                      <Image
                        src={imageSrc!}
                        alt={category.heroAlt ?? ''}
                        aria-hidden={category.heroAlt ? undefined : 'true'}
                        fill
                        sizes="(min-width: 768px) 58vw, 84vw"
                        className="object-cover"
                      />
                    ) : (
                      <div className="service-stream-card__fallback" aria-hidden="true">
                        <ServiceIcon slug={category.slug} className="size-16" strokeWidth={1} />
                        <span>{category.titleEn}</span>
                      </div>
                    )}
                    <div className="service-stream-card__wash" aria-hidden="true" />
                  </div>

                  <div className="service-stream-card__content">
                    <p className="service-stream-card__eyebrow">{category.titleEn}</p>
                    <h3>{category.title}</h3>
                    <p>{category.shortDescription}</p>
                    <span className="service-stream-card__action">
                      ดูรายละเอียด <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>

        <div className="service-stream-controls" role="group" aria-label="เลื่อนบริการ">
          <button
            type="button"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="บริการก่อนหน้า"
            aria-controls="home-service-stream"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="บริการถัดไป"
            aria-controls="home-service-stream"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="service-stream-picker" role="group" aria-label="เลือกบริการ">
        {categories.map((category, index) => {
          const imageSrc = heroOverrides[category.slug] ?? category.heroImage;
          return (
            <button
              key={category.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`ไปที่ ${category.title}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className={cn('service-stream-picker__item', activeIndex === index && 'is-active')}
            >
              {imageSrc ? (
                <Image src={imageSrc} alt="" aria-hidden="true" fill sizes="16rem" className="object-cover" />
              ) : (
                <ServiceIcon slug={category.slug} className="size-7" strokeWidth={1.1} aria-hidden="true" />
              )}
              <span>{category.title}</span>
            </button>
          );
        })}
      </div>

      <div className="service-stream-dots" role="group" aria-label="ตำแหน่งบริการ">
        {categories.map((category, index) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => goTo(index)}
            aria-label={`ดูบริการ ${category.title}`}
            aria-current={activeIndex === index ? 'true' : undefined}
            className={cn(activeIndex === index && 'is-active')}
          />
        ))}
      </div>
    </div>
  );
}
