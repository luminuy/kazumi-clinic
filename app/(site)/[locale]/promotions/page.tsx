import { jsonLdHtml } from '@/lib/json-ld';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Sparkles } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { getActivePromotions } from '@/lib/promotions-store';
import { breadcrumbSchema } from '@/lib/schema';
import { siteSocialImage } from '@/lib/metadata-images';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';
import { PromotionsGrid, type PromoCard, type PromoTab } from '@/components/promotions-grid';
import { LineIcon } from '@/components/brand-icons';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'PromotionsPage' });
  const pageTitle = t('metaTitle');
  const pageDescription = t('metaDescription', { siteName: site.name });

  const socialImage = await siteSocialImage(
    'hero-skin-booster',
    `${site.name} ${pageTitle}`,
  );

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/promotions` },
    openGraph: {
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/promotions`,
      type: 'website',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      images: [socialImage.url],
    },
  };
}

// ISR: promos are date-gated, so re-render hourly instead of freezing at build time —
// an expired promo drops off within the hour without a redeploy.
export const revalidate = 3600;

export default async function PromotionsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('PromotionsPage');
  const tHome = await getTranslations('HomePage');
  
  const promos = await getActivePromotions();

  // Cards for the client grid, each carrying its category slug for filtering.
  const cards: PromoCard[] = promos.map((p, i) => ({
    key: `${p.name}-${p.detail ?? ''}-${i}`,
    name: p.name,
    detail: p.detail ?? null,
    price: p.price,
    originalPrice: p.originalPrice ?? null,
    note: p.note ?? null,
    validUntil: p.validUntil,
    categorySlug: p.categorySlug ?? null,
  }));

  // Filter tabs = the categories actually present among the active promos, in catalogue order.
  const present = new Set(cards.map((c) => c.categorySlug).filter(Boolean));
  const tabs: PromoTab[] = serviceCategories
    .filter((category) => present.has(category.slug))
    .map((category) => ({ slug: category.slug, title: category.title }));

  const breadcrumb = breadcrumbSchema([
    { name: tHome('Navigation.home'), path: '/' },
    { name: t('breadcrumb'), path: '/promotions' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />

      <PageHero
        eyebrow={t('hero.eyebrow')}
        title={t('hero.title')}
        lead={t('hero.lead', { siteName: site.name })}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {cards.length > 0 ? (
          <PromotionsGrid promos={cards} tabs={tabs} />
        ) : (
          <Reveal className="rounded-2xl border border-dashed border-olive/30 bg-cream p-14 text-center">
            <Sparkles className="mx-auto size-8 text-olive-light" />
            <p className="mt-4 font-serif text-xl text-olive-deep">{t('empty.title')}</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              {t('empty.desc')}
            </p>
          </Reveal>
        )}

        <Button
          render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
          size="lg"
          className="mt-12 rounded-full bg-line px-8 text-white hover:bg-line/90"
        >
          <LineIcon className="size-4" />
          {t('inquireLine')}
        </Button>
      </section>
    </>
  );
}
