import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { serviceCategoryListSchema, breadcrumbSchema } from '@/lib/schema';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceIcon } from '@/components/service-icon';

export const metadata: Metadata = {
  title: 'บริการ / หัตถการ',
  description: `บริการและหัตถการทั้งหมดของ ${site.name} — ฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ คอลลาเจนบูสเตอร์ และ IV Drip วิตามิน โดยแพทย์ผู้เชี่ยวชาญ`,
  alternates: { canonical: `${site.url}/services` },
  openGraph: {
    title: `บริการ / หัตถการ — ${site.name}`,
    description: site.description,
    url: `${site.url}/services`,
    type: 'website',
    images: [{ url: `${site.url}/images/og/services.jpg`, width: 1200, height: 630 }],
  },
};

export default function ServicesPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'บริการ / หัตถการ', path: '/services' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceCategoryListSchema(serviceCategories)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <nav className="mx-auto max-w-6xl px-6 pt-8 text-xs text-ink/50">
        <Link href="/" className="hover:text-olive">
          หน้าหลัก
        </Link>{' '}
        / <span className="text-ink/70">บริการ / หัตถการ</span>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-serif text-3xl text-olive-deep md:text-4xl">บริการ / หัตถการ</h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          {site.name} ให้บริการหัตถการความงามครบวงจร ดูแลโดยแพทย์ผู้เชี่ยวชาญ
          เลือกหมวดบริการที่สนใจเพื่อดูรายละเอียดและราคา
        </p>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="block">
              <Card className="h-full rounded-2xl border-olive/15 ring-0 transition hover:border-olive hover:shadow-md">
                <CardContent>
                  <ServiceIcon slug={c.slug} className="size-6 text-olive" />
                  <p className="mt-3 font-serif text-lg text-olive-deep">{c.title}</p>
                  <p className="mt-1 text-xs uppercase tracking-wide text-olive-light">
                    {c.titleEn}
                  </p>
                  <p className="mt-3 text-sm text-ink/70">{c.shortDescription}</p>
                  <p className="mt-4 flex items-center gap-1 text-sm font-medium text-olive">
                    ดูรายละเอียด
                    <ArrowRight className="size-4" />
                  </p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}
