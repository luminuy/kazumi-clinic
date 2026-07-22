import type { Metadata } from 'next';
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

const pageTitle = 'โปรโมชั่น / แพ็กเกจ';
const pageDescription = `โปรโมชั่นและแพ็กเกจราคาพิเศษของ ${site.name} — ฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ และ IV Drip วิตามิน`;

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage(
    'hero-skin-booster',
    `${site.name} โปรโมชั่นและแพ็กเกจ`,
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

export default async function PromotionsPage() {
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
    { name: 'หน้าหลัก', path: '/' },
    { name: 'โปรโมชั่น / แพ็กเกจ', path: '/promotions' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHero
        eyebrow="Promotions & Pricing"
        title="โปรโมชั่น / แพ็กเกจ"
        lead={`โปรโมชั่นและแพ็กเกจราคาพิเศษประจำเดือนของ ${site.name} จองคิวหรือสอบถามรายละเอียดเพิ่มเติมผ่าน LINE`}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {cards.length > 0 ? (
          <PromotionsGrid promos={cards} tabs={tabs} />
        ) : (
          <Reveal className="rounded-2xl border border-dashed border-olive/30 bg-cream p-14 text-center">
            <Sparkles className="mx-auto size-8 text-olive-light" />
            <p className="mt-4 font-serif text-xl text-olive-deep">ยังไม่มีโปรโมชั่นในขณะนี้</p>
            <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
              ติดตามโปรโมชั่นและแพ็กเกจใหม่ได้ทาง LINE Official Account และ Instagram ของเรา
            </p>
          </Reveal>
        )}

        <Button
          render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
          size="lg"
          className="mt-12 rounded-full bg-line px-8 text-white hover:bg-line/90"
        >
          <LineIcon className="size-4" />
          สอบถามโปรโมชั่นผ่าน LINE
        </Button>
      </section>
    </>
  );
}
