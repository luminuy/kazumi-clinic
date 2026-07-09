import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { site } from '@/lib/site';
import { serviceCategories, getServiceBySlug } from '@/lib/services';
import { serviceItemListSchema, breadcrumbSchema } from '@/lib/schema';

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
        <p className="font-serif text-sm uppercase tracking-[0.3em] text-olive-light">
          {service.titleEn}
        </p>
        <h1 className="mt-2 font-serif text-3xl text-olive-deep md:text-4xl">{service.title}</h1>
        <p className="mt-4 max-w-2xl text-ink/70">{service.description}</p>

        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {service.items.map((item) => (
            <div
              key={`${item.name}-${item.detail ?? ''}`}
              className="rounded-2xl border border-olive/15 bg-white p-6"
            >
              <p className="font-serif text-lg text-olive-deep">{item.name}</p>
              {item.detail && <p className="mt-1 text-xs text-ink/50">{item.detail}</p>}
              <p className="mt-4 text-xl font-medium text-olive">
                {item.priceFrom.toLocaleString('th-TH')} บาท
                <span className="ml-1 text-sm font-normal text-ink/50">/ {item.unit}</span>
              </p>
            </div>
          ))}
        </div>

        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          className="mt-10 inline-block rounded-full bg-line px-8 py-3 text-sm font-medium text-white"
        >
          จองคิว {service.title} ผ่าน LINE
        </a>
      </section>
    </>
  );
}
