import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Check, ArrowRight } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories, getServiceBySlug } from '@/lib/services';
import { serviceItemListSchema, breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';

type Props = { params: Promise<{ category: string }> };

export function generateStaticParams() {
  return serviceCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const service = getServiceBySlug(category);
  if (!service) return {};

  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `${site.url}/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.description,
      url: `${site.url}/${service.slug}`,
      type: 'website',
      images: [{ url: service.ogImage, width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image', images: [service.ogImage] },
  };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { category } = await params;
  const service = getServiceBySlug(category);
  if (!service) notFound();

  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: service.title, path: `/${service.slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceItemListSchema(service)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHero
        eyebrow={service.titleEn}
        title={service.title}
        lead={service.description}
        image={service.heroImage}
        imageAlt={service.heroAlt}
        breadcrumb={[
          { name: 'หน้าหลัก', href: '/' },
          { name: 'บริการ', href: '/services' },
          { name: service.title },
        ]}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.items.map((item, i) => (
            <Reveal key={`${item.name}-${item.detail ?? ''}`} delay={i * 50}>
              <Card className="h-full rounded-2xl border-olive/15 ring-0">
                <CardContent className="flex h-full flex-col">
                  <p className="font-serif text-lg text-olive-deep">{item.name}</p>
                  {item.tagline && (
                    <p className="mt-0.5 font-serif text-sm italic text-olive-light">
                      {item.tagline}
                    </p>
                  )}
                  {item.detail && (
                    <Badge variant="outline" className="mt-2 w-fit border-olive/30 text-ink/60">
                      {item.detail}
                    </Badge>
                  )}
                  {item.benefits && (
                    <ul className="mt-3 space-y-1.5">
                      {item.benefits.map((b) => (
                        <li key={b} className="flex items-start gap-2 text-sm text-ink/70">
                          <Check className="mt-0.5 size-4 shrink-0 text-olive" />
                          {b}
                        </li>
                      ))}
                    </ul>
                  )}
                  <p className="mt-4 text-xl font-medium text-olive">
                    {item.priceFrom !== undefined ? (
                      <>
                        {item.priceFrom.toLocaleString('th-TH')} บาท
                        <span className="ml-1 text-sm font-normal text-ink/50">/ {item.unit}</span>
                      </>
                    ) : (
                      <span className="text-base font-medium text-ink/60">สอบถามราคา</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </Reveal>
          ))}
        </div>

        <div className="mt-12 flex flex-wrap items-center gap-4">
          <Button
            render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
            size="lg"
            className="rounded-full bg-line px-8 text-white hover:bg-line/90"
          >
            <MessageCircle className="size-4" />
            จองคิว {service.title} ผ่าน LINE
          </Button>
          <Link
            href="/services"
            className="flex items-center gap-1 text-sm text-olive hover:text-olive-deep"
          >
            ดูบริการอื่น <ArrowRight className="size-4" />
          </Link>
        </div>

        <p className="mt-6 text-xs text-ink/40">
          *ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
        </p>
      </section>
    </>
  );
}
