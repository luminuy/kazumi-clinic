import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Sparkles } from 'lucide-react';
import { site } from '@/lib/site';
import { activePromotions } from '@/lib/promotions';
import { breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export const metadata: Metadata = {
  title: 'โปรโมชั่น / แพ็กเกจ',
  description: `โปรโมชั่นและแพ็กเกจราคาพิเศษของ ${site.name} — ฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ และ IV Drip วิตามิน`,
  alternates: { canonical: `${site.url}/promotions` },
  openGraph: {
    title: `โปรโมชั่น / แพ็กเกจ — ${site.name}`,
    description: site.description,
    url: `${site.url}/promotions`,
    type: 'website',
    images: [{ url: `${site.url}/images/og/promotions.jpg`, width: 1200, height: 630 }],
  },
};

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

      <nav className="mx-auto max-w-6xl px-6 pt-8 text-xs text-ink/50">
        <Link href="/" className="hover:text-olive">
          หน้าหลัก
        </Link>{' '}
        / <span className="text-ink/70">โปรโมชั่น / แพ็กเกจ</span>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-serif text-3xl text-olive-deep md:text-4xl">โปรโมชั่น / แพ็กเกจ</h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          โปรโมชั่นและแพ็กเกจราคาพิเศษประจำเดือนของ {site.name} จองคิวหรือสอบถามรายละเอียดเพิ่มเติมผ่าน LINE
        </p>

        {promos.length > 0 ? (
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {promos.map((p) => (
              <Card
                key={`${p.name}-${p.detail ?? ''}`}
                className="rounded-2xl border-olive/15 ring-0"
              >
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
            ))}
          </div>
        ) : (
          <div className="mt-10 rounded-2xl border border-dashed border-olive/30 bg-cream p-10 text-center">
            <Sparkles className="mx-auto size-8 text-olive-light" />
            <p className="mt-4 font-serif text-lg text-olive-deep">
              ยังไม่มีโปรโมชั่นในขณะนี้
            </p>
            <p className="mt-2 text-sm text-ink/60">
              ติดตามโปรโมชั่นและแพ็กเกจใหม่ได้ทาง LINE Official Account และ Instagram ของเรา
            </p>
          </div>
        )}

        <Button
          render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
          size="lg"
          className="mt-10 rounded-full bg-line px-8 text-white hover:bg-line/90"
        >
          <MessageCircle className="size-4" />
          สอบถามโปรโมชั่นผ่าน LINE
        </Button>
      </section>
    </>
  );
}
