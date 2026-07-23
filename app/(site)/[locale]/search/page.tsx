import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { serviceCategories } from '@/lib/services';
import { SearchClient, type SearchEntry } from '@/components/account/search-client';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Search' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

/**
 * Builds the search index from the static catalog: one entry per category, plus one per service
 * item. Items with a fixed price carry their price + product id so the result can be added to the
 * cart directly; the rest link through to their category page. Money is exposed in satang.
 */
function buildIndex(): SearchEntry[] {
  const entries: SearchEntry[] = [];
  for (const category of serviceCategories) {
    const href = `/${category.slug}`;
    entries.push({
      kind: 'category',
      title: category.title,
      subtitle: category.titleEn,
      href,
      keywords: `${category.title} ${category.titleEn} ${category.shortDescription}`.toLowerCase(),
    });
    for (const item of category.items) {
      const label = item.detail ? `${item.name} · ${item.detail}` : item.name;
      const purchasable = item.id && item.priceFrom !== undefined;
      entries.push({
        kind: 'product',
        title: label,
        subtitle: category.title,
        href,
        ...(purchasable && { productId: item.id, priceSatang: Math.round(item.priceFrom! * 100) }),
        keywords: `${item.name} ${item.detail ?? ''} ${category.title} ${category.titleEn}`.toLowerCase(),
      });
    }
  }
  return entries;
}

export default async function SearchPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Search');

  return (
    <section className="bg-[var(--store-surface)] py-16">
      <div className="mx-auto w-full max-w-2xl px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
          {t('eyebrow')}
        </p>
        <h1 className="mb-8 mt-1 font-serif text-3xl text-[var(--store-ink)]">{t('title')}</h1>
        <SearchClient index={buildIndex()} />
      </div>
    </section>
  );
}
