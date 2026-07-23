'use client';

import { useMemo, useState } from 'react';
import { Search as SearchIcon, ArrowUpRight } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { formatSatang } from '@/lib/members/money';
import { AddToCartButton } from '@/components/account/add-to-cart-button';

export type SearchEntry = {
  kind: 'category' | 'product';
  title: string;
  subtitle?: string;
  href: string;
  productId?: string;
  priceSatang?: number;
  keywords: string;
};

/**
 * Instant client-side search over the (small, static) service catalog. No network — the index is
 * built server-side and passed in. Purchasable products show their price and an add-to-cart button
 * right in the results; everything else links through to its category page.
 */
export function SearchClient({ index }: { index: SearchEntry[] }) {
  const t = useTranslations('Search');
  const [query, setQuery] = useState('');

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return index.filter((e) => e.kind === 'category');
    const terms = q.split(/\s+/);
    return index.filter((e) => terms.every((term) => e.keywords.includes(term)));
  }, [query, index]);

  return (
    <div>
      <div className="relative">
        <SearchIcon className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-[var(--store-muted)]" />
        <input
          autoFocus
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('placeholder')}
          aria-label={t('placeholder')}
          className="w-full rounded-full border border-olive/20 bg-[var(--store-card)] py-3.5 pl-12 pr-4 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-olive/50"
        />
      </div>

      <p className="mt-4 text-xs text-[var(--store-muted)]">
        {query.trim() ? t('resultCount', { count: results.length }) : t('browseHint')}
      </p>

      {results.length === 0 ? (
        <p className="mt-10 text-center text-sm text-[var(--store-muted)]">{t('noResults')}</p>
      ) : (
        <ul className="mt-4 divide-y divide-black/[0.08] overflow-hidden rounded-[1.25rem] border border-black/5 bg-[var(--store-card)]">
          {results.map((e) => (
            <li key={`${e.kind}-${e.href}-${e.title}`} className="flex items-center gap-4 p-4">
              <Link href={e.href} className="group min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-[var(--store-ink)] group-hover:text-forest">
                  {e.title}
                </p>
                <p className="mt-0.5 text-xs text-[var(--store-muted)]">
                  {e.kind === 'category' ? t('type.category') : e.subtitle}
                  {e.priceSatang !== undefined && ` · ${formatSatang(e.priceSatang)}`}
                </p>
              </Link>
              {e.productId && e.priceSatang !== undefined ? (
                <AddToCartButton productId={e.productId} />
              ) : (
                <Link
                  href={e.href}
                  aria-label={e.title}
                  className="grid size-9 shrink-0 place-items-center rounded-full border border-black/10 text-[var(--store-muted)] transition-colors hover:bg-[var(--store-control)] hover:text-[var(--store-ink)]"
                >
                  <ArrowUpRight className="size-4" />
                </Link>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
