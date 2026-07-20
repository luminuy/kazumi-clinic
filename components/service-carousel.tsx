'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import type { ServiceCategory } from '@/lib/services';
import { ServiceIcon } from '@/components/service-icon';

type ServiceCarouselProps = {
  categories: ServiceCategory[];
  /** slug → Cloudinary public ID, resolved by the home server component from the /admin layer. */
  heroOverrides?: Record<string, string>;
};

/**
 * The homepage service navigator borrows the composition—not the content—from Apple's
 * entertainment shelf: one media-first feature in the centre, full-height adjacent cards at
 * each edge, then a separate full-width tile row beneath it. Image slots are resolved by the
 * server; categories without a real image remain honest icon panels.
 */
export function ServiceCarousel({ categories, heroOverrides = {} }: ServiceCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const initialIndex = Math.min(2, Math.max(categories.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const activeIndexRef = useRef(initialIndex);

  const targetFor = useCallback((index: number) => {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-service-index="${index}"]`);
    if (!rail || !card) return null;

    return Math.max(0, card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2);
  }, []);

  const pickerTargetFor = useCallback((index: number) => {
    const picker = pickerRef.current;
    const card = picker?.querySelector<HTMLElement>(`[data-service-picker-index="${index}"]`);
    if (!picker || !card) return null;

    return Math.max(0, card.offsetLeft - picker.clientWidth * 0.12);
  }, []);

  const syncPicker = useCallback((index: number, behavior: ScrollBehavior) => {
    const target = pickerTargetFor(index);
    if (target === null) return;

    pickerRef.current?.scrollTo({ left: target, behavior });
  }, [pickerTargetFor]);

  const goTo = useCallback((requestedIndex: number, behavior: ScrollBehavior = 'smooth') => {
    if (categories.length === 0) return;
    const index = (requestedIndex + categories.length) % categories.length;
    const target = targetFor(index);
    if (target === null) return;

    railRef.current?.scrollTo({ left: target, behavior });
    syncPicker(index, behavior);
    activeIndexRef.current = index;
    setActiveIndex(index);
  }, [categories.length, syncPicker, targetFor]);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => goTo(initialIndex, 'auto'));
    return () => window.cancelAnimationFrame(frame);
  }, [goTo, initialIndex]);

  useEffect(() => {
    if (isPaused || categories.length < 2) return;

    const interval = window.setInterval(() => {
      goTo(activeIndexRef.current + 1);
    }, 4000);

    return () => window.clearInterval(interval);
  }, [categories.length, goTo, isPaused]);

  const handleScroll = () => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      if (rail) {
        const railCentre = rail.scrollLeft + rail.clientWidth / 2;
        let nearestIndex = activeIndexRef.current;
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

        if (activeIndexRef.current !== nearestIndex) {
          activeIndexRef.current = nearestIndex;
          setActiveIndex(nearestIndex);
          syncPicker(nearestIndex, 'smooth');
        }
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
                className="service-stream-card"
              >
                <Link href={`/${category.slug}`} className="service-stream-card__link group">
                  <div className="service-stream-card__media">
                    {hasImage ? (
                      <Image
                        src={imageSrc!}
                        alt={category.heroAlt ?? ''}
                        aria-hidden={category.heroAlt ? undefined : 'true'}
                        fill
                        sizes="(min-width: 768px) 65vw, 84vw"
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

      </div>

      <div ref={pickerRef} className="service-stream-picker" role="group" aria-label="เลือกบริการ">
        {categories.map((category, index) => {
          const imageSrc = heroOverrides[category.slug] ?? category.heroImage;
          return (
            <button
              key={category.slug}
              data-service-picker-index={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`ไปที่ ${category.title}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className="service-stream-picker__item"
            >
              {imageSrc ? (
                <Image
                  src={imageSrc}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 768px) 24vw, 58vw"
                  className="object-cover"
                />
              ) : (
                <ServiceIcon slug={category.slug} className="size-7" strokeWidth={1.1} aria-hidden="true" />
              )}
              <span className="service-stream-picker__title">{category.title}</span>
              <span className="service-stream-picker__action">ดูรายละเอียด</span>
            </button>
          );
        })}
      </div>

      <div className="service-stream-footer">
        <div className="service-stream-dots" role="group" aria-label="ตำแหน่งบริการ">
          {categories.map((category, index) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`ดูบริการ ${category.title}`}
              aria-current={activeIndex === index ? 'true' : undefined}
              className={activeIndex === index ? 'is-active' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="service-stream-pause"
          onClick={() => setIsPaused((current) => !current)}
          aria-label={isPaused ? 'เริ่มการเลื่อนบริการอัตโนมัติ' : 'หยุดการเลื่อนบริการอัตโนมัติ'}
          aria-pressed={isPaused}
        >
          {isPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
        </button>
      </div>
    </div>
  );
}
