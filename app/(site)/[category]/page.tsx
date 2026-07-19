import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ShieldCheck, Stethoscope } from 'lucide-react';
import { site } from '@/lib/site';
import {
  serviceCategories,
  getServiceBySlug,
  type ServiceCategory,
  type ServiceItem,
} from '@/lib/services';
import { serviceItemListSchema, breadcrumbSchema } from '@/lib/schema';
import { getImage, getImageOverrides } from '@/lib/site-images-store';
import { socialImage } from '@/lib/metadata-images';
import { categoryImageKey, itemImageKey } from '@/lib/site-images';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { FillerServicePage } from '@/components/filler-service-page';
import { ThreadLiftServicePage } from '@/components/thread-lift-service-page';
import { MesotherapyServicePage } from '@/components/mesotherapy-service-page';
import { IvDripServicePage } from '@/components/iv-drip-service-page';
import { LaserHifuServicePage } from '@/components/laser-hifu-service-page';
import { AcneCareServicePage } from '@/components/acne-care-service-page';
import { SkinBoosterServicePage } from '@/components/skin-booster-service-page';

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

function ItemSpec({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-between gap-4 border-b border-olive/10 py-3">
      <dt className="text-[0.62rem] uppercase tracking-[0.18em] text-olive/55">{label}</dt>
      <dd className="text-right">{children}</dd>
    </div>
  );
}

function TreatmentItem({
  item,
  headingLevel: Heading,
}: {
  item: ServiceItem;
  headingLevel: 'h3' | 'h4';
}) {
  return (
    // Open, not boxed: the reference keeps this column as editorial type on the page rather than
    // a card. Multi-item categories get a hairline rule between items instead (see the list).
    <article>
      <Heading className="font-serif text-2xl text-olive-deep">{item.name}</Heading>
      {item.tagline && (
        <p lang="en" className="mt-1 font-serif text-sm italic text-olive-light">
          {item.tagline}
        </p>
      )}

      {item.benefits && (
        <ul className="mt-5 space-y-2.5">
          {item.benefits.map((benefit) => (
            <li key={benefit} className="flex gap-3 text-xs leading-[1.75] text-ink/65">
              {/* Editorial dash marker rather than a bullet — docs/design.md "Lists". */}
              <span aria-hidden="true" className="mt-2.5 h-px w-3 shrink-0 bg-clay" />
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      )}

      <dl className="mt-6">
        {item.detail && (
          <ItemSpec label="รายละเอียด">
            <span className="text-sm text-ink/75">{item.detail}</span>
          </ItemSpec>
        )}
        <ItemSpec label="ราคา">
          {item.priceFrom !== undefined ? (
            <>
              <span className="font-serif text-xl text-olive-deep">
                {item.priceFrom.toLocaleString('th-TH')} บาท
              </span>
              <span className="ml-1 text-xs text-ink/50">/ {item.unit}</span>
            </>
          ) : (
            <span className="text-sm text-ink/60">สอบถามราคา</span>
          )}
        </ItemSpec>
      </dl>
    </article>
  );
}

/** The reference puts the booking CTA under the specs in the left column, not in the side panel. */
function BookingCta({ service, hasPrice }: { service: ServiceCategory; hasPrice: boolean }) {
  return (
    <div className="mt-10">
      <a
        href={site.lineUrl}
        target="_blank"
        rel="noopener"
        className="block w-full bg-olive-deep py-4 text-center text-[0.7rem] uppercase tracking-[0.18em] text-sand transition-opacity duration-200 hover:opacity-90 active:scale-[0.99]"
      >
        จองคิว {service.title} ผ่าน LINE
      </a>
      {hasPrice && (
        <p className="mt-4 text-center text-[0.66rem] leading-[1.8] text-ink/45">
          ราคาที่แสดงอาจมีการเปลี่ยนแปลง
          กรุณาสอบถามราคาปัจจุบันและเงื่อนไขกับคลินิกก่อนเข้ารับบริการ
        </p>
      )}
      <p className="mt-2 text-center text-[0.66rem] leading-[1.8] text-ink/45">
        *ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
        ขึ้นอยู่กับการประเมินของแพทย์
      </p>
    </div>
  );
}

export default async function ServiceCategoryPage({ params }: Props) {
  const { category } = await params;
  const service = getServiceBySlug(category);
  if (!service) notFound();

  // A hero the clinic replaced through /admin wins over the one compiled into lib/services.ts.
  const overrides = await getImageOverrides();
  const slotKey = categoryImageKey[service.slug];
  const heroImage = (slotKey && overrides.get(slotKey)?.public_id) || service.heroImage;

  // Only categories with a published price need the price caveat — the rest already say
  // "สอบถามราคา", and a note about prices changing would be about nothing.
  const hasPrice = service.items.some((item) => item.priceFrom !== undefined);

  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: service.title, path: `/${service.slug}` },
  ]);

  // Per-item product shots for the filler cards. Resolved here, in the server component, so the
  // page component never touches the override layer — same rule the atlas and carousel follow.
  const itemImages: Record<string, string> = {};
  for (const item of service.items) {
    const key = item.id ? itemImageKey[item.id] : undefined;
    const publicId = key ? overrides.get(key)?.public_id : undefined;
    if (item.id && publicId) itemImages[item.id] = publicId;
  }

  // Filler and thread lift each have a bespoke page built to their own supplied design; every
  // other category renders the shared editorial template below. All three are the same visual
  // language, so they read as one site rather than compete.
  //
  // Thread lift is deliberately not gated on `heroImage` the way filler is: it has no photo yet,
  // and gating would drop it back to the generic template — its own page handles the empty slot.
  const pageContent =
    service.slug === 'filler' && heroImage ? (
      <FillerServicePage service={service} heroImage={heroImage} itemImages={itemImages} />
    ) : service.slug === 'thread-lift' ? (
      <ThreadLiftServicePage
        service={service}
        heroImage={heroImage}
        productImage={overrides.get('thread-lift-product')?.public_id}
      />
    ) : service.slug === 'mesotherapy' ? (
      <MesotherapyServicePage
        service={service}
        heroImage={heroImage}
        treatmentImage={overrides.get('mesotherapy-treatment')?.public_id}
      />
    ) : service.slug === 'iv-drip' ? (
      <IvDripServicePage
        service={service}
        heroImage={heroImage}
        treatmentImage={overrides.get('iv-drip-booking')?.public_id}
      />
    ) : service.slug === 'laser-hifu' ? (
      <LaserHifuServicePage
        service={service}
        heroImage={heroImage}
        editorialImage={overrides.get('laser-hifu-editorial')?.public_id}
        interiorImage={overrides.get('laser-hifu-interior')?.public_id}
      />
    ) : service.slug === 'acne-care' ? (
      <AcneCareServicePage
        service={service}
        heroImage={heroImage}
        interstitialImage={overrides.get('acne-care-interstitial')?.public_id}
      />
    ) : service.slug === 'skin-booster' ? (
      <SkinBoosterServicePage
        service={service}
        heroImage={heroImage}
        disciplineImage={overrides.get('skin-booster-discipline')?.public_id}
      />
    ) : (
      <div className="bg-sand">
        {/* ── Hero ─────────────────────────────────────────────── */}
        <section className="px-6 pb-20 pt-28 sm:px-10 md:px-14 lg:px-20">
          {/* Centred, not end-aligned: a 1:1.618 portrait is much taller than the text column,
              so bottom-aligning the text opened a dead gap above it. */}
          <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-12 md:gap-10">
            <Reveal className="md:col-span-7">
              <nav
                aria-label="เส้นทางหน้า"
                className="flex flex-wrap items-center gap-1.5 text-xs text-ink/40"
              >
                <Link href="/" className="transition-colors hover:text-olive-deep">
                  หน้าหลัก
                </Link>
                <span className="text-ink/25">/</span>
                <Link href="/services" className="transition-colors hover:text-olive-deep">
                  บริการ
                </Link>
                <span className="text-ink/25">/</span>
                <span className="text-ink/70">{service.title}</span>
              </nav>

              <p
                lang="en"
                className="mt-10 text-[0.68rem] uppercase tracking-[0.24em] text-olive/60"
              >
                {service.titleEn}
              </p>

              <h1 className="mt-4 max-w-xl">
                <span className="block font-serif text-4xl leading-[1.15] text-olive-deep md:text-5xl">
                  {service.title}
                </span>
                <span
                  lang="en"
                  className="mt-2 block font-serif text-2xl font-light italic leading-tight text-olive/65 md:text-3xl"
                >
                  {service.titleEn}
                </span>
              </h1>

              {/* The reference's `.japanese-border` — a left rule instead of a box. */}
              <p className="mt-8 max-w-lg border-l border-olive/40 pl-5 text-sm leading-[1.9] text-ink/65">
                {service.description}
              </p>

              <div className="mt-8 flex flex-wrap gap-x-8 gap-y-3">
                <span className="flex items-center gap-2 text-xs text-ink/60">
                  <Stethoscope aria-hidden="true" className="size-4 shrink-0 text-olive/60" />
                  ประเมินและดูแลโดยแพทย์
                </span>
                <span className="flex items-center gap-2 text-xs text-ink/60">
                  <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-olive/60" />
                  ใบอนุญาตเลขที่ {site.license}
                </span>
              </div>
            </Reveal>

            <Reveal className="md:col-span-5" delay={80}>
              <div className="relative ml-auto w-full max-w-[17rem] sm:max-w-[20rem]">
                <div className="relative aspect-[1/1.618] overflow-hidden border border-olive/10 bg-olive-deep/[0.06]">
                  {heroImage ? (
                    <>
                      <Image
                        src={heroImage}
                        alt={service.heroAlt ?? ''}
                        aria-hidden={service.heroAlt ? undefined : 'true'}
                        fill
                        priority
                        fetchPriority="high"
                        sizes="(min-width: 640px) 24rem, 80vw"
                        className="object-cover"
                      />
                      <p
                        lang="en"
                        className="absolute bottom-6 left-6 bg-sand/60 px-4 py-3 text-[0.62rem] uppercase tracking-[0.2em] text-olive-deep backdrop-blur-[2px]"
                      >
                        Precision &amp; Refinement
                      </p>
                    </>
                  ) : (
                    // No photo for this category yet — a tonal panel with its icon, never another
                    // category's photo (docs/design.md "Imagery").
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 flex items-center justify-center"
                    >
                      <ServiceIcon
                        slug={service.slug}
                        className="size-12 text-olive/25"
                        strokeWidth={0.75}
                      />
                    </div>
                  )}
                </div>
                <span
                  aria-hidden="true"
                  className="absolute -bottom-6 -right-6 -z-10 hidden size-32 border-[0.5px] border-olive/20 md:block"
                />
              </div>
            </Reveal>
          </div>
        </section>

        {/* ── Treatment detail ─────────────────────────────────── */}
        <section className="border-t border-olive/10 bg-cream px-6 py-24 sm:px-10 md:px-14 lg:px-20">
          <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-14">
            <div className="md:col-span-7">
              {/* This label is the section's heading, not decoration — as a <p> it left the page
                  jumping h1 → h3, since item names are the next headings down. */}
              <Reveal>
                <h2
                  lang="en"
                  className="inline-block border-b border-olive/20 pb-2 text-[0.68rem] font-normal uppercase tracking-[0.24em] text-olive/70"
                >
                  {service.items.length > 1 ? 'Treatment Menu' : 'Recommended Session'}
                </h2>
              </Reveal>

              <div className="mt-10 space-y-12">
                {groupItems(service.items).map(({ collection, items }) => (
                  <div key={collection ?? '_'}>
                    {collection && (
                      <Reveal>
                        <h3 lang="en" className="mb-5 font-serif text-2xl text-olive-deep">
                          {collection}
                        </h3>
                      </Reveal>
                    )}
                    {/* A hairline between items is all the separation an unboxed list needs;
                        a single-item category never draws one, matching the reference. */}
                    <div className="space-y-8">
                      {items.map((item, i) => (
                        <Reveal key={`${item.name}-${item.detail ?? ''}`} delay={i * 50}>
                          <div className={i > 0 ? 'border-t border-olive/10 pt-8' : undefined}>
                            {/* Items sit one level under their collection heading when they have
                                one, so the outline stays contiguous either way. */}
                            <TreatmentItem item={item} headingLevel={collection ? 'h4' : 'h3'} />
                          </div>
                        </Reveal>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <Reveal>
                <BookingCta service={service} hasPrice={hasPrice} />
              </Reveal>
            </div>

            {/* The reference floats a blurred "glass" card here. docs/design.md rules out
                glassmorphism and heavy shadows, so the same composition is rendered as a tonal
                panel with a hairline rule and an offset square behind it. It stays a quote —
                the CTA and the caveats live under the specs, where the reference puts them. */}
            <Reveal className="md:col-span-5" delay={60}>
              <aside className="md:sticky md:top-24">
                {/* This wrapper is what the offset square anchors to. Hanging it off <aside>
                    would only work at md+, where `sticky` happens to make it a positioned
                    ancestor — below that it would escape to some far-away container. */}
                <div className="relative">
                  <div className="border border-olive/15 bg-sand p-8">
                    <p
                      lang="en"
                      className="font-serif text-[1.6rem] italic leading-snug text-olive-deep"
                    >
                      “{site.taglineTh}”
                    </p>
                    <span aria-hidden="true" className="mt-6 block h-px w-full bg-olive/15" />
                    <div className="mt-6 flex items-center gap-4">
                      <span
                        aria-hidden="true"
                        className="flex size-12 shrink-0 items-center justify-center border border-olive/15 bg-olive-deep/[0.06]"
                      >
                        <ServiceIcon
                          slug={service.slug}
                          className="size-5 text-olive/45"
                          strokeWidth={1}
                        />
                      </span>
                      <p lang="en" className="font-serif text-sm italic text-ink/55">
                        The Kazumi Discipline
                      </p>
                    </div>
                  </div>
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-6 -right-6 -z-10 hidden size-32 border-[0.5px] border-olive/20 lg:block"
                  />
                </div>
              </aside>
            </Reveal>
          </div>
        </section>

        {/* ── Closing CTA ──────────────────────────────────────── */}
        <section className="px-6 py-24 sm:px-10 md:px-14 lg:px-20">
          <Reveal className="mx-auto max-w-3xl text-center">
            <h2 lang="en" className="font-serif text-3xl text-olive-deep md:text-4xl">
              Ready for your transformation?
            </h2>
            <p className="mt-5 text-sm leading-[1.9] text-ink/60">
              ปรึกษาทีมแพทย์เพื่อประเมินว่า{service.title}เหมาะกับคุณหรือไม่
              ก่อนตัดสินใจเข้ารับบริการ
            </p>
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="w-full border border-olive-deep bg-olive-deep px-10 py-4 text-[0.7rem] uppercase tracking-[0.18em] text-sand transition-opacity duration-200 hover:opacity-90 sm:w-auto"
              >
                จองคิวผ่าน LINE
              </a>
              <Link
                href="/services"
                className="group inline-flex w-full items-center justify-center gap-2 border border-olive-deep px-10 py-4 text-[0.7rem] uppercase tracking-[0.18em] text-olive-deep transition-colors duration-200 hover:bg-olive-deep/5 sm:w-auto"
              >
                ดูบริการอื่น
                <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
            </div>
          </Reveal>
        </section>
      </div>
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
