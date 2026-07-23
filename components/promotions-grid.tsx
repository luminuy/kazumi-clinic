'use client';

import { useMemo, useState } from 'react';
import { Reveal } from '@/components/reveal';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { cn } from '@/lib/utils';

export type PromoCard = {
  key: string;
  name: string;
  detail: string | null;
  price: number | null;
  originalPrice: number | null;
  note: string | null;
  validUntil: string;
  categorySlug: string | null;
  imagePublicId?: string | null;
};

/** Category filter tabs — derived from the categories actually present in the active promos. */
export type PromoTab = { slug: string; title: string };

function formatValidUntil(iso: string) {
  return new Date(iso).toLocaleDateString('th-TH', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export function PromotionsGrid({ promos, tabs }: { promos: PromoCard[]; tabs: PromoTab[] }) {
  const [active, setActive] = useState<string>('all');

  // Only worth showing the filter when there's more than one category to choose between.
  const showTabs = tabs.length >= 2;
  const current = showTabs ? active : 'all';

  const visible = useMemo(
    () => (current === 'all' ? promos : promos.filter((p) => p.categorySlug === current)),
    [promos, current],
  );

  return (
    <>
      {showTabs && (
        <div
          role="tablist"
          aria-label="กรองโปรโมชั่นตามหมวด"
          className="mb-8 flex flex-wrap gap-2"
        >
          {[{ slug: 'all', title: 'ทั้งหมด' }, ...tabs].map((tab) => {
            const selected = current === tab.slug;
            return (
              <button
                key={tab.slug}
                type="button"
                role="tab"
                aria-selected={selected}
                onClick={() => setActive(tab.slug)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200',
                  selected
                    ? 'bg-olive-deep text-cream'
                    : 'bg-olive/[0.07] text-olive-deep hover:bg-olive/15',
                )}
              >
                {tab.title}
              </button>
            );
          })}
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p, i) => (
          <Reveal key={p.key} delay={i * 40}>
            <Card className="h-full overflow-hidden rounded-2xl border border-olive/20 bg-white shadow-sm ring-0 transition-[transform,box-shadow] duration-200 hover:shadow-[0_10px_34px_rgba(38,40,31,0.08)] motion-safe:hover:-translate-y-1 flex flex-col">
              {p.imagePublicId && (
                <div className="w-full bg-sand">
                  <Image
                    src={p.imagePublicId}
                    alt={p.name}
                    width={800}
                    height={1000}
                    sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                    className="w-full h-auto object-contain"
                  />
                </div>
              )}
              <CardContent className={cn("flex-1", p.imagePublicId ? "pt-6" : "pt-6")}>
                <p className="font-serif text-lg text-olive-deep">{p.name}</p>
                {p.detail && (
                  <Badge variant="outline" className="mt-2 border-olive/30 text-ink/60">
                    {p.detail}
                  </Badge>
                )}
                {p.price !== null ? (
                  <p className="mt-4 text-xl font-medium text-forest">
                    {p.price.toLocaleString('th-TH')} บาท
                    {p.originalPrice && (
                      <span className="ml-2 text-sm font-normal text-ink/40 line-through">
                        {p.originalPrice.toLocaleString('th-TH')}
                      </span>
                    )}
                  </p>
                ) : (
                  <p className="mt-4 text-sm font-medium text-forest">สอบถามราคาเพิ่มเติม</p>
                )}
                {p.note && <p className="mt-1 text-xs text-olive-light">{p.note}</p>}
                <p className="mt-2 text-xs text-ink/50">ใช้ได้ถึง {formatValidUntil(p.validUntil)}</p>
              </CardContent>
            </Card>
          </Reveal>
        ))}
      </div>

      {visible.length === 0 && (
        <p className="rounded-2xl border border-dashed border-olive/30 bg-cream px-6 py-12 text-center text-sm text-ink/50">
          ไม่มีโปรโมชั่นในหมวดนี้ — ลองเลือกหมวดอื่น
        </p>
      )}
    </>
  );
}
