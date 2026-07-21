'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
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
 * A circular, media-first home service navigator. Cards are reordered after a completed move
 * rather than cloned, so the stream can loop without ever showing duplicate services.
 */
export function ServiceCarousel({ categories, heroOverrides = {} }: ServiceCarouselProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const pickerRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const settleRef = useRef<number | null>(null);
  const isTransitioningRef = useRef(false);
  const initialIndex = Math.min(2, Math.max(categories.length - 1, 0));
  const [activeIndex, setActiveIndex] = useState(initialIndex);
  const [isPaused, setIsPaused] = useState(false);
  const activeIndexRef = useRef(initialIndex);

  const orderedItems = categories.map((_, position) => {
    const categoryIndex = (activeIndex - 1 + position + categories.length) % categories.length;
    return {
      category: categories[categoryIndex],
      categoryIndex,
      position,
    };
  });

  const targetFor = useCallback((position: number) => {
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-service-index="${position}"]`);
    if (!rail || !card) return null;

    return Math.max(0, card.offsetLeft - (rail.clientWidth - card.clientWidth) / 2);
  }, []);

  const pickerTargetFor = useCallback((position: number) => {
    const picker = pickerRef.current;
    const card = picker?.querySelector<HTMLElement>(`[data-service-picker-index="${position}"]`);
    if (!picker || !card) return null;

    return Math.max(0, card.offsetLeft - picker.clientWidth * 0.12);
  }, []);

  const scrollToPosition = useCallback((position: number, behavior: ScrollBehavior) => {
    const railTarget = targetFor(position);
    const pickerTarget = pickerTargetFor(position);
    const rail = railRef.current;
    const picker = pickerRef.current;

    if (rail && railTarget !== null) {
      if (behavior === 'auto') rail.scrollLeft = railTarget;
      else rail.scrollTo({ left: railTarget, behavior });
    }
    if (picker && pickerTarget !== null) {
      if (behavior === 'auto') picker.scrollLeft = pickerTarget;
      else picker.scrollTo({ left: pickerTarget, behavior });
    }
  }, [pickerTargetFor, targetFor]);

  const normaliseIndex = useCallback((index: number) => (
    ((index % categories.length) + categories.length) % categories.length
  ), [categories.length]);

  const commitActiveIndex = useCallback((index: number) => {
    const nextIndex = normaliseIndex(index);
    activeIndexRef.current = nextIndex;
    isTransitioningRef.current = false;
    setActiveIndex(nextIndex);
  }, [normaliseIndex]);

  const moveOne = useCallback((direction: 1 | -1) => {
    if (categories.length < 2 || isTransitioningRef.current) return;

    isTransitioningRef.current = true;
    const nextIndex = normaliseIndex(activeIndexRef.current + direction);
    scrollToPosition(direction === 1 ? 2 : 0, 'smooth');

    if (settleRef.current !== null) window.clearTimeout(settleRef.current);
    settleRef.current = window.setTimeout(() => commitActiveIndex(nextIndex), 650);
  }, [categories.length, commitActiveIndex, normaliseIndex, scrollToPosition]);

  const goTo = useCallback((requestedIndex: number) => {
    if (categories.length === 0 || isTransitioningRef.current) return;

    const nextIndex = normaliseIndex(requestedIndex);
    const forwardDistance = normaliseIndex(nextIndex - activeIndexRef.current);
    const backwardDistance = normaliseIndex(activeIndexRef.current - nextIndex);

    if (forwardDistance === 1) {
      moveOne(1);
      return;
    }
    if (backwardDistance === 1) {
      moveOne(-1);
      return;
    }

    commitActiveIndex(nextIndex);
  }, [categories.length, commitActiveIndex, moveOne, normaliseIndex]);

  useLayoutEffect(() => {
    scrollToPosition(1, 'auto');
  }, [activeIndex, scrollToPosition]);

  useEffect(() => {
    if (isPaused || categories.length < 2) return;

    const interval = window.setInterval(() => moveOne(1), 4000);
    return () => window.clearInterval(interval);
  }, [categories.length, isPaused, moveOne]);

  const handleScroll = () => {
    if (isTransitioningRef.current || frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      if (!rail) return;

      const railCentre = rail.scrollLeft + rail.clientWidth / 2;
      let nearestPosition = 1;
      let nearestDistance = Number.POSITIVE_INFINITY;

      orderedItems.forEach(({ position }) => {
        const card = rail.querySelector<HTMLElement>(`[data-service-index="${position}"]`);
        if (!card) return;

        const distance = Math.abs(card.offsetLeft + card.clientWidth / 2 - railCentre);
        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestPosition = position;
        }
      });

      frameRef.current = null;
      if (nearestPosition === 1) return;

      if (settleRef.current !== null) window.clearTimeout(settleRef.current);
      settleRef.current = window.setTimeout(() => {
        const item = orderedItems[nearestPosition];
        if (item) commitActiveIndex(item.categoryIndex);
      }, 160);
    });
  };

  useEffect(() => () => {
    if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
    if (settleRef.current !== null) window.clearTimeout(settleRef.current);
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
          {orderedItems.map(({ category, position }) => {
            const imageSrc = heroOverrides[category.slug] ?? category.heroImage;
            const hasImage = Boolean(imageSrc);

            return (
              <article key={category.slug} data-service-index={position} className="service-stream-card">
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
                        <span className="service-stream-card__fallback-badge">
                          <ServiceIcon slug={category.slug} className="size-8" strokeWidth={1} />
                        </span>
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

      <div ref={pickerRef} className="service-stream-picker" aria-label="บริการของเรา">
        {orderedItems.map(({ category, categoryIndex, position }) => {
          const imageSrc = heroOverrides[category.slug] ?? category.heroImage;
          return (
            <Link
              key={category.slug}
              data-service-picker-index={position}
              href={`/${category.slug}`}
              aria-current={activeIndex === categoryIndex ? 'true' : undefined}
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
            </Link>
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
