'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { promotionPosters, type PromotionPoster } from '@/lib/promotions';
import { cn } from '@/lib/utils';

export function PromotionCarousel({
  posters = promotionPosters,
  className,
  imageSizes = '(min-width: 1024px) 30vw, (min-width: 640px) 48vw, 88vw',
}: {
  /** Resolved through the /admin override layer by the server component that renders this. */
  posters?: PromotionPoster[];
  /** Page-specific layout treatment while preserving the same accessible carousel controls. */
  className?: string;
  /** Match the responsive image source to the card width for the rendering context. */
  imageSizes?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const programmaticIndexRef = useRef<number | null>(null);
  const programmaticTargetRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (requestedIndex: number) => {
    const nextIndex = (requestedIndex + posters.length) % posters.length;
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-promotion-index="${nextIndex}"]`);
    const firstCard = rail?.querySelector<HTMLElement>('[data-promotion-index="0"]');
    if (!rail || !card || !firstCard) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    // Distance from the first card IS the target scrollLeft — both offsetLeft values are
    // measured from the same offsetParent, so the difference already cancels the rail's
    // padding out. Adding the current scrollLeft on top counted the scroll position twice,
    // so every click overshot by however far the rail had already travelled and scroll-snap
    // yanked it back to a card that wasn't the one asked for.
    const targetLeft = Math.max(0, card.offsetLeft - firstCard.offsetLeft);
    programmaticIndexRef.current = nextIndex;
    programmaticTargetRef.current = targetLeft;
    rail.scrollTo({
      left: targetLeft,
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
    });
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  const handleScroll = () => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      const firstCard = rail?.querySelector<HTMLElement>('[data-promotion-index="0"]');
      if (rail && firstCard) {
        if (programmaticIndexRef.current !== null) {
          if (
            programmaticTargetRef.current !== null &&
            Math.abs(rail.scrollLeft - programmaticTargetRef.current) <= 2
          ) {
            programmaticIndexRef.current = null;
            programmaticTargetRef.current = null;
          }
          frameRef.current = null;
          return;
        }

        const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
        const step = firstCard.getBoundingClientRect().width + gap;
        const nextIndex = Math.min(
          posters.length - 1,
          Math.max(0, Math.round((rail.scrollLeft - firstCard.offsetLeft) / step)),
        );
        if (nextIndex !== activeIndexRef.current) {
          activeIndexRef.current = nextIndex;
          setActiveIndex(nextIndex);
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
    <div className={cn('promotion-carousel', className)} id="promotion-gallery">
      <div className="promotion-carousel-viewport">
        <div
          ref={railRef}
          id="promotion-gallery-rail"
          className="promotion-carousel-rail"
          onScroll={handleScroll}
          role="region"
          aria-label="แกลเลอรีโปรโมชั่นของ Kazumi Clinic"
        >
          {posters.map((poster, index) => (
            <article
              key={poster.src}
              data-promotion-index={index}
              className={cn(
                'promotion-carousel-card',
                activeIndex === index && 'promotion-carousel-card--active',
              )}
            >
              <Link href="/promotions" className="promotion-carousel-card__link group">
                <Image
                  src={poster.src}
                  alt={poster.alt}
                  fill
                  sizes={imageSizes}
                  className="promotion-carousel-card__image object-cover"
                />
                <div className="promotion-carousel-card__veil" aria-hidden="true" />
                <div className="promotion-carousel-card__meta">
                  <span>{poster.label}</span>
                  <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </div>
              </Link>
            </article>
          ))}
        </div>

        <div className="promotion-carousel-controls" role="group" aria-label="เลื่อนโปรโมชั่น">
          <button
            type="button"
            className="promotion-carousel-arrow"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="ดูโปรโมชั่นก่อนหน้า"
            aria-controls="promotion-gallery-rail"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            className="promotion-carousel-arrow"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="ดูโปรโมชั่นถัดไป"
            aria-controls="promotion-gallery-rail"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>
      </div>

      <div className="promotion-carousel-footer">
        <span className="promotion-carousel-note">
          สอบถามช่วงเวลาและสิทธิ์โปรโมชั่นกับทีม Kazumi
        </span>
        <div className="promotion-carousel-dots" role="group" aria-label="เลือกโปรโมชั่น">
          {posters.map((poster, index) => (
            <button
              key={poster.src}
              type="button"
              aria-current={activeIndex === index ? 'true' : undefined}
              aria-label={`ดู ${poster.label}`}
              className={cn(
                'promotion-carousel-dot',
                activeIndex === index && 'promotion-carousel-dot--active',
              )}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
