'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import type { ServiceCategory } from '@/lib/services';
import { ServiceIcon } from '@/components/service-icon';
import { cn } from '@/lib/utils';

/**
 * Peeking service carousel in the Apple "browse the shelf" style: a wide card sits at the gutter
 * with the next cards peeking on the right, scroll-snap pages between them, and the non-active
 * cards dim so focus stays on the front one. Cards keep the site's editorial language (sharp
 * corners, olive/green, Thai) rather than Apple's rounded image tiles.
 *
 * The scroll mechanics mirror the shipped PromotionCarousel (snap-start, small gutter padding, and
 * measuring `card.offsetLeft − firstCard.offsetLeft` so the offsetParent cancels out) — a version
 * that used snap-center with large vw spacers wouldn't scroll at all.
 */
export function ServiceCarousel({ categories }: { categories: ServiceCategory[] }) {
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const programmaticTargetRef = useRef<number | null>(null);
  const activeRef = useRef(0);
  const [active, setActive] = useState(0);

  const goTo = (requested: number) => {
    const index = (requested + categories.length) % categories.length;
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-idx="${index}"]`);
    const first = rail?.querySelector<HTMLElement>('[data-idx="0"]');
    if (!rail || !card || !first) return;
    const target = Math.max(0, card.offsetLeft - first.offsetLeft);
    programmaticTargetRef.current = target;
    activeRef.current = index;
    setActive(index);

    // Animate scrollLeft by hand rather than via native smooth scrollTo: `scroll-snap-type:
    // mandatory` snaps a programmatic smooth scroll back to the current card, so snap is switched
    // off for the animation and restored once it lands on the target (itself a snap point). The
    // rAF loop also works where a headless browser won't run native smooth scrolling.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      rail.scrollLeft = target;
      return;
    }
    if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    rail.style.scrollSnapType = 'none';
    const startLeft = rail.scrollLeft;
    const distance = target - startLeft;
    const startTime = performance.now();
    const duration = 420;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
    const step = (now: number) => {
      const progress = Math.min(1, (now - startTime) / duration);
      rail.scrollLeft = startLeft + distance * easeOutCubic(progress);
      if (progress < 1) {
        animationRef.current = window.requestAnimationFrame(step);
      } else {
        animationRef.current = null;
        rail.style.scrollSnapType = '';
      }
    };
    animationRef.current = window.requestAnimationFrame(step);
  };

  const handleScroll = () => {
    if (frameRef.current !== null) return;
    frameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      const first = rail?.querySelector<HTMLElement>('[data-idx="0"]');
      if (rail && first) {
        // Ignore scroll events until a programmatic scroll has arrived, so the active index doesn't
        // flicker through the cards it passes over on the way.
        if (programmaticTargetRef.current !== null) {
          if (Math.abs(rail.scrollLeft - programmaticTargetRef.current) <= 2) {
            programmaticTargetRef.current = null;
          }
        } else {
          const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
          const step = first.getBoundingClientRect().width + gap;
          const index = Math.min(
            categories.length - 1,
            Math.max(0, Math.round(rail.scrollLeft / step)),
          );
          if (index !== activeRef.current) {
            activeRef.current = index;
            setActive(index);
          }
        }
      }
      frameRef.current = null;
    });
  };

  useEffect(() => {
    return () => {
      if (frameRef.current !== null) window.cancelAnimationFrame(frameRef.current);
      if (animationRef.current !== null) window.cancelAnimationFrame(animationRef.current);
    };
  }, []);

  return (
    <div>
      <div
        ref={railRef}
        onScroll={handleScroll}
        role="region"
        aria-label="แกลเลอรีบริการของ Kazumi Clinic"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-2 [-ms-overflow-style:none] [scrollbar-width:none] scroll-pl-6 sm:px-10 sm:scroll-pl-10 md:gap-6 md:px-14 md:scroll-pl-14 lg:px-20 lg:scroll-pl-20 [&::-webkit-scrollbar]:hidden"
      >
        {categories.map((category, index) => (
          <article
            key={category.slug}
            data-idx={index}
            className={cn(
              'w-[82vw] shrink-0 snap-start transition-opacity duration-500 sm:w-[52vw] md:w-[40vw] lg:w-[30vw]',
              active === index ? 'opacity-100' : 'opacity-55',
            )}
          >
            <Link
              href={`/${category.slug}`}
              className="group flex h-full min-h-[19rem] flex-col justify-between border border-olive/12 bg-cream p-8 transition-colors duration-300 hover:border-forest/40 md:min-h-[22rem] md:p-10"
            >
              <div>
                <ServiceIcon slug={category.slug} className="size-8 text-forest" strokeWidth={1.25} />
                <p lang="en" className="mt-6 text-[0.62rem] uppercase tracking-[0.2em] text-olive/55">
                  {category.titleEn}
                </p>
                <h3 className="mt-2 font-serif text-2xl text-olive-deep md:text-3xl">
                  {category.title}
                </h3>
                <p className="mt-3 text-sm leading-[1.8] text-ink/60">{category.shortDescription}</p>
              </div>
              <span className="mt-8 inline-flex items-center gap-2 border-t border-olive/12 pt-5 text-[0.64rem] uppercase tracking-[0.18em] text-forest">
                ดูรายละเอียด
                <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </span>
            </Link>
          </article>
        ))}
      </div>

      <div className="mx-auto mt-8 flex max-w-7xl items-center justify-between gap-6 px-6 sm:px-10 md:px-14 lg:px-20">
        <div className="flex gap-2" role="group" aria-label="เลื่อนบริการ">
          <button
            type="button"
            onClick={() => goTo(active - 1)}
            aria-label="บริการก่อนหน้า"
            className="flex size-10 items-center justify-center border border-olive/25 text-olive-deep transition-colors hover:border-forest hover:text-forest"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            onClick={() => goTo(active + 1)}
            aria-label="บริการถัดไป"
            className="flex size-10 items-center justify-center border border-olive/25 text-olive-deep transition-colors hover:border-forest hover:text-forest"
          >
            <ArrowRight className="size-4" />
          </button>
        </div>

        <div className="flex items-center gap-1.5" role="group" aria-label="เลือกบริการ">
          {categories.map((category, index) => (
            <button
              key={category.slug}
              type="button"
              onClick={() => goTo(index)}
              aria-label={`ไปที่ ${category.title}`}
              aria-current={active === index ? 'true' : undefined}
              className={cn(
                'h-1.5 transition-all duration-300',
                active === index ? 'w-6 bg-forest' : 'w-1.5 bg-olive/25 hover:bg-olive/50',
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
