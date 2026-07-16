'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, ArrowRight, ArrowUpRight } from 'lucide-react';
import { serviceCategories, type ServiceCategory } from '@/lib/services';
import { cloudAssets } from '@/lib/cloud';
import { cn } from '@/lib/utils';

const fallbackImages = [
  cloudAssets.heroFiller,
  cloudAssets.heroIvDrip1,
  cloudAssets.heroIvDrip2,
  cloudAssets.heroIvDrip3,
  cloudAssets.heroSkinBooster,
];

export function ServiceAtlas() {
  const railRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const activeIndexRef = useRef(0);
  const [activeIndex, setActiveIndex] = useState(0);

  const goTo = (requestedIndex: number) => {
    const nextIndex = (requestedIndex + serviceCategories.length) % serviceCategories.length;
    const rail = railRef.current;
    const card = rail?.querySelector<HTMLElement>(`[data-service-index="${nextIndex}"]`);
    if (!card) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    card.scrollIntoView({
      behavior: prefersReducedMotion ? 'auto' : 'smooth',
      block: 'nearest',
      inline: 'start',
    });
    activeIndexRef.current = nextIndex;
    setActiveIndex(nextIndex);
  };

  const handleScroll = () => {
    if (frameRef.current !== null) return;

    frameRef.current = window.requestAnimationFrame(() => {
      const rail = railRef.current;
      const firstCard = rail?.querySelector<HTMLElement>('[data-service-index="0"]');
      if (rail && firstCard) {
        const gap = Number.parseFloat(getComputedStyle(rail).columnGap) || 0;
        const step = firstCard.getBoundingClientRect().width + gap;
        const nextIndex = Math.min(serviceCategories.length - 1, Math.max(0, Math.round(rail.scrollLeft / step)));
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
    <div className="service-atlas-layout">
      <div className="service-atlas-intro">
        <div className="section-eyebrow flex items-center gap-3">
          <span className="h-px w-10 bg-clay" />
          01 / Treatment atlas
        </div>
        <h2 className="mt-7 max-w-lg font-serif text-5xl leading-[0.9] tracking-[-0.04em] text-olive-deep sm:text-6xl md:text-8xl">
          พอดีใน
          <br />
          <span className="text-clay">แบบของคุณ.</span>
        </h2>
        <p className="mt-8 max-w-md text-sm leading-[1.9] text-ink/65 md:text-base">
          ทุกโปรแกรมเริ่มต้นจากการฟังเป้าหมายและประเมินโดยแพทย์
          ก่อนเลือกแนวทางที่เหมาะกับผิวและรูปหน้าของแต่ละคน
        </p>
        <div className="mt-8 flex flex-wrap items-center gap-4">
          <Link
            href="/services"
            className="group inline-flex items-center gap-2 rounded-full bg-olive-deep px-5 py-3 text-sm text-sand transition-[background-color,transform] duration-200 ease-out hover:-translate-y-0.5 hover:bg-olive active:scale-[0.98]"
          >
            สำรวจ treatment ทั้งหมด
            <ArrowUpRight className="size-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </Link>
          <span className="text-xs uppercase tracking-[0.22em] text-olive-light">
            {serviceCategories.length} โปรแกรม / curated care
          </span>
        </div>
        <div className="service-atlas-controls mt-10">
          <button
            type="button"
            className="service-atlas-arrow"
            onClick={() => goTo(activeIndex - 1)}
            aria-label="ดูบริการก่อนหน้า"
          >
            <ArrowLeft className="size-4" />
          </button>
          <button
            type="button"
            className="service-atlas-arrow"
            onClick={() => goTo(activeIndex + 1)}
            aria-label="ดูบริการถัดไป"
          >
            <ArrowRight className="size-4" />
          </button>
          <span className="ml-2 text-xs uppercase tracking-[0.22em] text-olive-light">
            {String(activeIndex + 1).padStart(2, '0')} / {String(serviceCategories.length).padStart(2, '0')}
          </span>
        </div>
      </div>

      <div className="min-w-0">
        <div
          ref={railRef}
          className="service-atlas-rail"
          onScroll={handleScroll}
          role="region"
          aria-label="รายการบริการของ Kazumi Clinic"
        >
          {serviceCategories.map((category, index) => (
            <ServiceAtlasCard
              key={category.slug}
              category={category}
              index={index}
              active={activeIndex === index}
            />
          ))}
        </div>
        <div className="service-atlas-dots" role="group" aria-label="เลือกบริการ">
          {serviceCategories.map((category, index) => (
            <button
              key={category.slug}
              type="button"
              aria-current={activeIndex === index ? 'true' : undefined}
              aria-label={`ดูบริการ ${category.title}`}
              className={cn('service-atlas-dot', activeIndex === index && 'service-atlas-dot--active')}
              onClick={() => goTo(index)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ServiceAtlasCard({
  category,
  index,
  active,
}: {
  category: ServiceCategory;
  index: number;
  active: boolean;
}) {
  const imageSrc = category.heroImage ?? fallbackImages[index % fallbackImages.length];
  const hasSemanticImage = Boolean(category.heroImage && category.heroAlt);

  return (
    <article
      data-service-card
      data-service-index={index}
      className={cn('service-atlas-card', active && 'service-atlas-card--active')}
    >
      <Link href={`/${category.slug}`} className="service-atlas-card__link group">
        <div className="service-atlas-card__media">
          <Image
            src={imageSrc}
            alt={hasSemanticImage ? category.heroAlt! : ''}
            aria-hidden={hasSemanticImage ? undefined : 'true'}
            fill
            sizes="(min-width: 1024px) 22vw, (min-width: 640px) 42vw, 78vw"
            className="service-atlas-card__image object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/65 via-transparent to-transparent" />
          <span className="absolute left-5 top-5 font-serif text-sm text-sand/75">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="absolute bottom-5 right-5 rounded-full border border-sand/40 bg-olive-deep/35 px-3 py-1 text-[0.62rem] uppercase tracking-[0.2em] text-sand/80 backdrop-blur-sm">
            ดูรายละเอียด
          </span>
        </div>
        <div className="service-atlas-card__caption">
          <p className="text-[0.65rem] uppercase tracking-[0.24em] text-olive-light">{category.titleEn}</p>
          <h3 className="mt-2 flex items-center justify-between gap-3 font-serif text-2xl text-olive-deep">
            {category.title}
            <ArrowUpRight className="service-atlas-card__arrow size-5 shrink-0 text-clay" />
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-ink/60">{category.shortDescription}</p>
        </div>
      </Link>
    </article>
  );
}
