'use client';

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { ArrowUpRight, Pause, Play } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { ServiceIcon } from '@/components/service-icon';

/**
 * Deliberately NOT `ServiceCategory` — this is a client component, so every field named here is
 * serialised into the RSC flight payload inlined in the HTML *and* re-parsed during hydration.
 * A full `ServiceCategory` drags along `description`, `aftercare`, `contraindications`,
 * `downtime` and the entire `items[]` array (each with `detail`, `tagline`, `benefits[]`), none of
 * which this carousel renders — that was ~143KB of flight payload on the home page. Keep this type
 * to what the JSX below actually reads; widen it only when you render the new field.
 */
export type ServiceCarouselCategory = {
  slug: string;
  title: string;
  titleEn: string;
  shortDescription: string;
  heroImage?: string;
  heroAlt?: string;
  /** Lowest `priceFrom` across the category's products, precomputed on the server. Undefined when
   *  the clinic hasn't published a fixed price for any of them (the card then shows no price). */
  startingPrice?: number;
};

type ServiceCarouselProps = {
  categories: ServiceCarouselCategory[];
  /** slug → Cloudinary public ID, resolved by the home server component from the /admin layer. */
  heroOverrides?: Record<string, string>;
};

/**
 * A circular, media-first home service navigator. Cards are reordered after a completed move
 * rather than cloned, so the stream can loop without ever showing duplicate services.
 */
export function ServiceCarousel({ categories, heroOverrides = {} }: ServiceCarouselProps) {
  const locale = useLocale();
  const t = useTranslations('A11y');
  const tCopy = useTranslations('ServiceCarousel');
  const railRef = useRef<HTMLDivElement>(null);
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

  const scrollToPosition = useCallback((position: number, behavior: ScrollBehavior) => {
    const railTarget = targetFor(position);
    const rail = railRef.current;

    if (rail && railTarget !== null) {
      if (behavior === 'auto') rail.scrollLeft = railTarget;
      else rail.scrollTo({ left: railTarget, behavior });
    }
  }, [targetFor]);

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
          aria-label={t('serviceGallery')}
        >
          {orderedItems.map(({ category, position }) => {
            const imageSrc = heroOverrides[category.slug] ?? category.heroImage;
            const hasImage = Boolean(imageSrc);
            const { startingPrice } = category;

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
                    {startingPrice !== undefined && (
                      <p className="mt-2 text-[0.82rem] text-[rgb(238_233_223/0.85)]">
                        {tCopy('startingFrom')}{' '}
                        <span className="font-medium text-sand">
                          {tCopy('price', {
                            price: startingPrice.toLocaleString('th-TH'),
                          })}
                        </span>
                      </p>
                    )}
                    <span className="service-stream-card__action">
                      {tCopy('details')} <ArrowUpRight className="size-4" />
                    </span>
                  </div>
                </Link>
              </article>
            );
          })}
        </div>
      </div>

      <div className="service-stream-footer">
        <div className="service-stream-dots" role="group" aria-label={t('servicePosition')}>
          {categories.map((category, index) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={t('viewService', {
                name: locale === 'en' ? category.titleEn : category.title,
              })}
              aria-current={activeIndex === index ? 'true' : undefined}
              className={activeIndex === index ? 'is-active' : undefined}
            />
          ))}
        </div>
        <button
          type="button"
          className="service-stream-pause"
          onClick={() => setIsPaused((current) => !current)}
          aria-label={isPaused ? t('serviceAutoplayStart') : t('serviceAutoplayStop')}
          aria-pressed={isPaused}
        >
          {isPaused ? <Play className="size-3" /> : <Pause className="size-3" />}
        </button>
      </div>
    </div>
  );
}
