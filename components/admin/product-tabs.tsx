'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ProductCategoryEditor, type AdminProduct } from './product-category-editor';

export type ProductCategoryData = {
  slug: string;
  title: string;
  products: AdminProduct[];
  hiddenProducts: AdminProduct[];
};

/**
 * Replaces the old "9 categories stacked vertically + anchor-scroll nav" layout — the most-cited
 * "confusing, can't find things" spot on /admin/products. One category visible at a time behind
 * a tab bar instead; each category's own editor (add/edit/reorder/hide) is unchanged, only the
 * page-level navigation around it changed.
 */
export function ProductTabs({ categories }: { categories: ProductCategoryData[] }) {
  const [activeSlug, setActiveSlug] = useState(categories[0]?.slug ?? '');
  const active = categories.find((c) => c.slug === activeSlug) ?? categories[0];

  return (
    <div>
      <nav
        aria-label="หมวดสินค้า"
        className="sticky top-14 z-10 -mx-6 flex gap-1.5 overflow-x-auto border-b border-black/[0.06] bg-sand/80 px-6 py-3 backdrop-blur-xl lg:top-0"
      >
        {categories.map((category) => (
          <button
            key={category.slug}
            type="button"
            onClick={() => setActiveSlug(category.slug)}
            aria-current={activeSlug === category.slug ? 'true' : undefined}
            className={cn(
              'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              activeSlug === category.slug
                ? 'bg-ink text-white'
                : 'bg-black/[0.04] text-ink/55 hover:bg-black/[0.08] hover:text-ink',
            )}
          >
            {category.title}
            <span className="ml-1.5 text-[0.68rem] opacity-60">{category.products.length}</span>
          </button>
        ))}
      </nav>

      <div className="mt-10">
        {active && (
          <ProductCategoryEditor
            key={active.slug}
            slug={active.slug}
            title={active.title}
            products={active.products}
            hiddenProducts={active.hiddenProducts}
          />
        )}
      </div>
    </div>
  );
}
