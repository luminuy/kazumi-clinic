import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { serviceCategoryListSchema, breadcrumbSchema } from '@/lib/schema';
import { ServiceIcon } from '@/components/service-icon';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';

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

      <PageHero
        eyebrow="Services & Treatments"
        title="บริการ / หัตถการ"
        lead={`${site.name} ให้บริการหัตถการความงามครบวงจร ดูแลโดยแพทย์ผู้เชี่ยวชาญ เลือกหมวดบริการที่สนใจเพื่อดูรายละเอียดและราคา`}
        breadcrumb={[{ name: 'หน้าหลัก', href: '/' }, { name: 'บริการ / หัตถการ' }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="divide-y divide-olive/15 border-y border-olive/15">
          {serviceCategories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <Link
                href={`/${c.slug}`}
                className="group flex items-center gap-6 py-7 transition-colors hover:bg-cream/60"
              >
                <span className="w-10 font-serif text-sm text-olive-light">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ServiceIcon
                  slug={c.slug}
                  className="size-6 shrink-0 text-olive transition-transform group-hover:scale-110"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-2xl text-olive-deep">{c.title}</p>
                  <p className="mt-1 truncate text-sm text-ink/60">{c.shortDescription}</p>
                </div>
                <span className="hidden text-xs uppercase tracking-widest text-olive-light md:block">
                  {c.titleEn}
                </span>
                <ArrowUpRight className="size-6 shrink-0 text-olive-light transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-olive" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
