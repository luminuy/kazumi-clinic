'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import type { PromotionPoster } from '@/lib/promotions';
import { cn } from '@/lib/utils';

export function PromotionCardGrid({
  posters,
  className,
}: {
  posters: PromotionPoster[];
  className?: string;
}) {
  const railRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const rail = railRef.current;
    if (!rail) return;
    setCanScrollLeft(rail.scrollLeft > 4);
    setCanScrollRight(rail.scrollLeft < rail.scrollWidth - rail.clientWidth - 4);
  };

  useEffect(() => {
    checkScroll();
    const rail = railRef.current;
    if (!rail) return;
    const observer = new ResizeObserver(checkScroll);
    observer.observe(rail);
    return () => observer.disconnect();
  }, []);

  const scroll = (direction: -1 | 1) => {
    const rail = railRef.current;
    if (!rail) return;
    const cardWidth = rail.querySelector<HTMLElement>('[data-promo-card]')?.offsetWidth ?? 320;
    rail.scrollBy({ left: direction * (cardWidth + 16), behavior: 'smooth' });
  };

  return (
    <div className={cn('promo-card-grid', className)}>
      <div className="promo-card-grid__viewport">
        <div
          ref={railRef}
          className="promo-card-grid__rail"
          onScroll={checkScroll}
        >
          {posters.map((poster) => (
            <article key={poster.src} data-promo-card className="promo-card-grid__card">
              <Link href={`/${poster.categorySlug}`} className="promo-card-grid__link group">
                <div className="promo-card-grid__image-wrap">
                  <Image
                    src={poster.src}
                    alt={poster.alt}
                    fill
                    sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 85vw"
                    className="promo-card-grid__image object-cover"
                  />
                  {poster.badge && (
                    <span
                      className={cn(
                        'promo-card-grid__badge',
                        poster.badgeVariant === 'red'
                          ? 'promo-card-grid__badge--red'
                          : 'promo-card-grid__badge--blue',
                      )}
                    >
                      {poster.badge}
                    </span>
                  )}
                </div>
                <div className="promo-card-grid__meta">
                  <span className="promo-card-grid__category">{poster.categoryLabel}</span>
                  <h3 className="promo-card-grid__title">{poster.title}</h3>
                  <p className="promo-card-grid__subtitle">{poster.subtitle}</p>
                </div>
              </Link>
            </article>
          ))}
        </div>

        {/* Navigation arrows */}
        <button
          type="button"
          className={cn(
            'promo-card-grid__arrow promo-card-grid__arrow--left',
            !canScrollLeft && 'promo-card-grid__arrow--hidden',
          )}
          onClick={() => scroll(-1)}
          aria-label="ดูโปรโมชั่นก่อนหน้า"
          disabled={!canScrollLeft}
        >
          <ArrowLeft className="size-4" />
        </button>
        <button
          type="button"
          className={cn(
            'promo-card-grid__arrow promo-card-grid__arrow--right',
            !canScrollRight && 'promo-card-grid__arrow--hidden',
          )}
          onClick={() => scroll(1)}
          aria-label="ดูโปรโมชั่นถัดไป"
          disabled={!canScrollRight}
        >
          <ArrowRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
