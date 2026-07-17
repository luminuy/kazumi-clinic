import type { Metadata } from 'next';
import { MessageCircle, Sparkles } from 'lucide-react';
import { site } from '@/lib/site';
import { getOgImage } from '@/lib/site-images-store';
import { activePromotions } from '@/lib/promotions';
import { breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';

// Derived from the Cloudinary hero rather than a file in public/ — the previous
// `/images/og/promotions.jpg` was never actually added, so every share of this page
// rendered with no preview image at all.
export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage('hero-skin-booster');
  return {
    title: 'โปรโมชั่น / แพ็กเกจ',
    description: `โปรโมชั่นและแพ็กเกจราคาพิเศษของ ${site.name} — ฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ และ IV Drip วิตามิน`,
    alternates: { canonical: `${site.url}/promotions` },
    openGraph: {
      title: `โปรโมชั่น / แพ็กเกจ — ${site.name}`,
      description: site.description,
      url: `${site.url}/promotions`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}

// ISR: promos are date-gated, so re-render hourly instead of freezing at build time —
// an expired promo drops off within the hour without a redeploy.
export const revalidate = 3600;

export default function PromotionsPage() {
  const promos = activePromotions();

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
        breadcrumb={[{ name: 'หน้าหลัก', href: '/' }, { name: 'โปรโมชั่น / แพ็กเกจ' }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        {promos.length > 0 ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promos.map((p, i) => (
              <Reveal key={`${p.name}-${p.detail ?? ''}`} delay={i * 50}>
                <Card className="h-full rounded-2xl border-olive/15 ring-0">
                  <CardContent>
                    <p className="font-serif text-lg text-olive-deep">{p.name}</p>
                    {p.detail && (
                      <Badge variant="outline" className="mt-2 border-olive/30 text-ink/60">
                        {p.detail}
                      </Badge>
                    )}
                    <p className="mt-4 text-xl font-medium text-olive">
                      {p.price.toLocaleString('th-TH')} บาท
                      {p.originalPrice && (
                        <span className="ml-2 text-sm font-normal text-ink/40 line-through">
                          {p.originalPrice.toLocaleString('th-TH')}
                        </span>
                      )}
                    </p>
                    {p.note && <p className="mt-1 text-xs text-olive-light">{p.note}</p>}
                    <p className="mt-2 text-xs text-ink/50">
                      ใช้ได้ถึง{' '}
                      {new Date(p.validUntil).toLocaleDateString('th-TH', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric',
                      })}
                    </p>
                  </CardContent>
                </Card>
              </Reveal>
            ))}
          </div>
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
          <MessageCircle className="size-4" />
          สอบถามโปรโมชั่นผ่าน LINE
        </Button>
      </section>
    </>
  );
}
