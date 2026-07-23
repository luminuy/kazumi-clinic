'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type BlogGridPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  coverImagePublicId: string | null;
  publishedAt: number | null;
  category: string | null;
};

/** Filter tabs — derived from the categories actually present among the grid's posts. */
export type BlogTab = { slug: string; title: string };

function formatThaiDate(ms: number | null, locale: string) {
  if (ms === null) return null;
  return new Date(ms).toLocaleDateString(locale === 'th' ? 'th-TH' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

/**
 * The filterable article grid on /blog. The category tabs used to be static markup that did
 * nothing; this filters the bento grid client-side by the post's `category` (a serviceCategories
 * slug). Tabs are only rendered when there are at least two categories to switch between.
 */
export function BlogFilterGrid({
  posts,
  tabs,
  locale,
  emptyText,
}: {
  posts: BlogGridPost[];
  tabs: BlogTab[];
  locale: string;
  emptyText: string;
}) {
  const [active, setActive] = useState<string>('all');
  const showTabs = tabs.length >= 2;
  const current = showTabs ? active : 'all';

  const visible = useMemo(
    () => (current === 'all' ? posts : posts.filter((post) => post.category === current)),
    [posts, current],
  );

  return (
    <>
      {showTabs && (
        <div
          role="tablist"
          aria-label="กรองบทความตามหมวด"
          className="mb-8 overflow-x-auto no-scrollbar"
        >
          <div className="flex gap-2 whitespace-nowrap pb-2">
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
                    'px-5 py-2.5 rounded-full text-sm font-medium transition-all active:scale-95',
                    selected
                      ? 'bg-clinical-blue text-pure-white'
                      : 'bg-pure-white border border-outline-variant text-charcoal hover:bg-surface-container-low',
                  )}
                >
                  {tab.title}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {visible.length > 0 ? (
        <div className="bento-grid">
          {visible.map((post, i) => {
            // Varied heights recreate the Apple-style bento rhythm.
            const isTall = i % 5 === 1;
            const isWide = i % 5 === 3;

            return (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className={`bg-pure-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/10 flex flex-col group transition-transform hover:-translate-y-1 ${isTall ? 'bento-tall' : ''} ${isWide ? 'col-span-1 sm:col-span-2' : ''}`}
              >
                <div
                  className={`relative w-full overflow-hidden ${isTall ? 'h-64 sm:h-full sm:min-h-[20rem]' : 'h-48'}`}
                >
                  {post.coverImagePublicId ? (
                    <Image
                      src={post.coverImagePublicId}
                      alt={post.title}
                      fill
                      sizes={
                        isWide
                          ? '(max-width: 640px) 100vw, 90vw'
                          : '(max-width: 640px) 100vw, 50vw'
                      }
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-surface-container-low grid place-items-center">
                      <FileText className="size-8 text-outline-variant" />
                    </div>
                  )}
                </div>
                <div className="p-5 flex-grow flex flex-col justify-center">
                  <span className="text-xs font-medium text-slate-gray mb-1.5 block">
                    {formatThaiDate(post.publishedAt, locale) || 'Article'}
                  </span>
                  <h3
                    className={`text-base font-bold text-charcoal line-clamp-2 ${isTall ? 'mb-2 text-lg' : ''}`}
                  >
                    {post.title}
                  </h3>
                  {isTall && post.excerpt && (
                    <p className="text-sm text-slate-gray line-clamp-3 leading-relaxed mt-2">
                      {post.excerpt}
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      ) : (
        <p className="rounded-2xl border border-dashed border-outline-variant/30 bg-pure-white px-6 py-12 text-center text-sm text-slate-gray">
          {emptyText}
        </p>
      )}
    </>
  );
}
