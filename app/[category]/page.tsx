import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories, getServiceBySlug } from '@/lib/services';
import { serviceItemListSchema, breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ServiceIcon } from '@/components/service-icon';

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

      <nav className="mx-auto max-w-6xl px-6 pt-8 text-xs text-ink/50">
        <Link href="/" className="hover:text-olive">
          หน้าหลัก
        </Link>{' '}
        / <span className="text-ink/70">{service.title}</span>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <ServiceIcon slug={service.slug} className="size-8 text-olive" />
        <p className="mt-3 font-serif text-sm uppercase tracking-[0.3em] text-olive-light">
          {service.titleEn}
        </p>
        <h1 className="mt-2 font-serif text-3xl text-olive-deep md:text-4xl">{service.title}</h1>
        <p className="mt-4 max-w-2xl text-ink/70">{service.description}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.items.map((item) => (
            <Card
              key={`${item.name}-${item.detail ?? ''}`}
              className="rounded-2xl border-olive/15 ring-0"
            >
              <CardContent>
                <p className="font-serif text-lg text-olive-deep">{item.name}</p>
                {item.detail && (
                  <Badge variant="outline" className="mt-2 border-olive/30 text-ink/60">
                    {item.detail}
                  </Badge>
                )}
                <p className="mt-4 text-xl font-medium text-olive">
                  {item.priceFrom.toLocaleString('th-TH')} บาท
                  <span className="ml-1 text-sm font-normal text-ink/50">/ {item.unit}</span>
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        <Button
          render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
          size="lg"
          className="mt-10 rounded-full bg-line px-8 text-white hover:bg-line/90"
        >
          <MessageCircle className="size-4" />
          จองคิว {service.title} ผ่าน LINE
        </Button>
      </section>
    </>
  );
}
