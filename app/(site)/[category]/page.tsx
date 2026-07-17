import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { MessageCircle, Check, ArrowRight } from 'lucide-react';
import { site } from '@/lib/site';
import {
  serviceCategories,
  getServiceBySlug,
  type ServiceItem,
} from '@/lib/services';
import { serviceItemListSchema, breadcrumbSchema } from '@/lib/schema';
import { getImage, getImageOverrides } from '@/lib/site-images-store';
import { socialImage } from '@/lib/metadata-images';
import { categoryImageKey } from '@/lib/site-images';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';
import { FillerServicePage } from '@/components/filler-service-page';

type Props = { params: Promise<{ category: string }> };

/**
 * Splits a category's items into their `collection` sub-headings, preserving the order they're
 * declared in. Categories without collections come back as one unlabelled group, so the page
 * renders exactly as before for them.
 */
function groupItems(items: ServiceItem[]) {
  const groups: { collection?: string; items: ServiceItem[] }[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last && last.collection === item.collection) last.items.push(item);
    else groups.push({ collection: item.collection, items: [item] });
  }
  return groups;
}

// ISR, not a one-shot build: these pages read the clinic's image overrides, so they have to be
// regenerable. /api/admin/images revalidates the affected paths on save; this hourly window is
// the backstop for when that call is the thing that failed.
export const revalidate = 3600;

export function generateStaticParams() {
  return serviceCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const service = getServiceBySlug(category);
  if (!service) return {};

  const imageKey = categoryImageKey[service.slug];
  const publicId = imageKey ? await getImage(imageKey) : service.heroImage;
  const socialPreview = publicId
    ? socialImage(publicId, `${service.title} — ${site.name}`)
    : undefined;

  return {
    title: service.title,
    description: service.description,
    alternates: { canonical: `${site.url}/${service.slug}` },
    openGraph: {
      title: service.title,
      description: service.description,
      url: `${site.url}/${service.slug}`,
      type: 'website',
      ...(socialPreview && { images: [socialPreview] }),
    },
    // A category with no hero photo gets no social image at all: the `twitter` key must still be
    // set to override the root layout's default, which would otherwise leak the homepage hero
    // onto this page (CLAUDE.md §6 — every category needs its own image, never the homepage's).
    twitter: {
      title: service.title,
      description: service.description,
      ...(socialPreview
        ? { card: 'summary_large_image' as const, images: [socialPreview.url] }
        : { card: 'summary' as const }),
    },
  };
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { category } = await params;
  const service = getServiceBySlug(category);
  if (!service) notFound();

  // A hero the clinic replaced through /admin wins over the one compiled into lib/services.ts.
  const overrides = await getImageOverrides();
  const slotKey = categoryImageKey[service.slug];
  const heroImage = (slotKey && overrides.get(slotKey)?.public_id) || service.heroImage;

  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: service.title, path: `/${service.slug}` },
  ]);

  const pageContent =
    service.slug === 'filler' && heroImage ? (
      <FillerServicePage service={service} heroImage={heroImage} />
    ) : (
      <>
        <PageHero
          eyebrow={service.titleEn}
          title={service.title}
          lead={service.description}
          image={heroImage}
          imageAlt={service.heroAlt}
          breadcrumb={[
            { name: 'หน้าหลัก', href: '/' },
            { name: 'บริการ', href: '/services' },
            { name: service.title },
          ]}
        />

        <section className="mx-auto max-w-6xl px-6 py-20">
          {groupItems(service.items).map(({ collection, items }) => (
            <div key={collection ?? '_'} className="mb-12 last:mb-0">
              {collection && (
                <Reveal>
                  <h2 className="mb-5 font-serif text-2xl text-olive-deep">{collection}</h2>
                </Reveal>
              )}
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((item, i) => (
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
                              <span className="ml-1 text-sm font-normal text-ink/50">
                                / {item.unit}
                              </span>
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
            </div>
          ))}

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

      {pageContent}
    </>
  );
}
