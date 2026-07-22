import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ChevronDown } from 'lucide-react';
import { site } from '@/lib/site';
import { doctor, doctorEesha } from '@/lib/doctor';
import { cloudAssets } from '@/lib/cloud';
import { getImageOverrides } from '@/lib/site-images-store';
import { categoryImageKey, posterKeyByDefaultId } from '@/lib/site-images';
import { siteSocialImage } from '@/lib/metadata-images';
import { promotionPosters } from '@/lib/promotions';
import { serviceCategories, type ServiceCategory } from '@/lib/services';
import { getAllMergedCategories } from '@/lib/service-products-store';
import { serviceCategoryListSchema, breadcrumbSchema } from '@/lib/schema';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { PromotionCarousel } from '@/components/promotion-carousel';
import { LineIcon } from '@/components/brand-icons';
import { PhysicianPanel } from '@/components/physician-panel';

const pageTitle = 'บริการ / หัตถการ';
const pageDescription = `บริการและหัตถการทั้งหมดของ ${site.name} — ฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ คอลลาเจนบูสเตอร์ และ IV Drip วิตามิน ดูแลโดยแพทย์`;

export async function generateMetadata(): Promise<Metadata> {
  // This is the same slot rendered as the page hero, so an admin replacement updates both.
  const socialImage = await siteSocialImage(
    'hero-iv-drip-2',
    `${site.name} บริการและหัตถการ`,
  );

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/services` },
    openGraph: {
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/services`,
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

/**
 * One card in the Treatment Atlas. Only three categories have a hero photo in Cloudinary; the
 * rest show a tonal panel with the category's icon rather than borrowing an unrelated photo,
 * which would caption e.g. an IV Drip portrait as botox.
 */
function TreatmentCard({
  category,
  index,
  image,
}: {
  category: ServiceCategory;
  index: number;
  image?: string;
}) {
  // The clinic lists the same product at several volumes (Neura Deep 1 CC / 3 CC), so dedupe
  // by name — this is a category index, not a price list.
  const programNames = Array.from(new Set(category.items.map((item) => item.name)));

  return (
    <Reveal delay={(index % 3) * 60}>
      <article className="h-full">
        <Link
          href={`/${category.slug}`}
          className="apple-doctor-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] border border-black/[0.08] shadow-[0_4px_24px_rgba(0,0,0,0.04)] text-[var(--store-ink)]"
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-sand md:aspect-[1.618]">
            {image ? (
              <Image
                src={image}
                alt={category.heroAlt ?? ''}
                aria-hidden={category.heroAlt ? undefined : 'true'}
                fill
                sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 88vw"
                className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-105"
              />
            ) : (
              <div
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center border border-[var(--store-control)]"
              >
                <ServiceIcon
                  slug={category.slug}
                  className="size-8 text-[var(--store-muted)] transition-transform duration-700 ease-out group-hover:scale-110"
                  strokeWidth={1}
                />
              </div>
            )}
          </div>

          <div className="flex flex-1 flex-col px-6 pb-8 pt-6 sm:px-8">
            <p className="text-[0.62rem] tracking-[0.18em] text-[var(--store-muted)]">
              {String(index + 1).padStart(2, '0')}
            </p>
            <h3 className="mt-2 font-serif text-[1.65rem] leading-none text-[var(--store-ink)]">
              {category.titleEn}
            </h3>
            <p className="mt-2 text-xs tracking-[0.04em] text-[var(--store-muted)]">{category.title}</p>
            <p className="mt-3 text-[0.82rem] leading-[1.75] text-[var(--store-muted)]">{category.shortDescription}</p>

            <p className="mt-4 text-[0.68rem] leading-[1.7] text-[var(--store-muted)]/70">
              {programNames.slice(0, 3).join(' · ')}
              {programNames.length > 3 && ` · +${programNames.length - 3}`}
            </p>

            <span className="mt-auto inline-flex items-center gap-2 pt-6 text-[0.72rem] tracking-wide text-forest transition-[gap] duration-200 ease-out group-hover:gap-3 group-hover:text-mint">
              Explore Details <ArrowUpRight className="size-3" />
            </span>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}

export const revalidate = 3600;

export default async function ServicesPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'บริการ / หัตถการ', path: '/services' },
  ]);

  const overrides = await getImageOverrides();
  const pick = (key: string, fallback: string) => overrides.get(key)?.public_id ?? fallback;

  // Merged so a product the clinic renamed/added through /admin shows in each card's program list.
  const categories = await getAllMergedCategories();

  // Posters resolve here, in the server component, so the client carousel stays free of the
  // override layer and the D1 read happens once per render.
  const posters = promotionPosters.map((poster) => {
    const key = posterKeyByDefaultId.get(poster.src);
    const override = key ? overrides.get(key)?.public_id : undefined;
    return override ? { ...poster, src: override } : poster;
  });

  const visitPhoto = overrides.get('home-visit')?.public_id;

  return (
    <div className="bg-sand">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceCategoryListSchema(serviceCategories)),
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 pb-20 pt-28 sm:px-10 md:px-14 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-6">

            <div className="mt-10 flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-olive/60">
              <span className="h-px w-8 bg-clay" />
              Clinical Services
            </div>

            <h1 className="mt-5">
              <span className="block font-serif text-5xl leading-[1.05] text-olive-deep md:text-6xl">
                Treatment Atlas
              </span>
              <span className="mt-4 block text-base leading-[1.7] text-ink/70">
                บริการและหัตถการทั้งหมดของ {site.nameTh}
              </span>
            </h1>

            <p className="mt-6 max-w-md text-sm leading-[1.9] text-ink/60">
              ความงามที่พอดีเริ่มจากการประเมินโดยแพทย์
              ทุกหัตถการด้านล่างออกแบบตามโครงหน้าและสภาพผิวของแต่ละบุคคล
              เพื่อผลลัพธ์ที่เป็นธรรมชาติในแบบของคุณ
            </p>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-7 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
              >
                <LineIcon className="size-4" />
                ปรึกษาแพทย์ผ่าน LINE
              </a>
              <a
                href="#treatment-atlas"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-olive-deep/30 bg-transparent px-7 py-3.5 text-xs font-medium text-olive-deep transition-all duration-200 hover:border-olive-deep hover:bg-olive-deep/5 active:scale-[0.98]"
              >
                ดูหัตถการทั้งหมด
              </a>
            </div>
          </Reveal>

          {/* justify-self-end would shrink this column to fit its content, and a `fill` image has
              no intrinsic width — the box collapses to a sliver. Keep the column stretched and
              push the image to the right edge with a margin instead. */}
          <Reveal className="md:col-span-6" delay={80}>
            <div className="relative ml-auto w-full sm:max-w-sm">
              <div className="relative aspect-[0.72] w-full overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] shadow-2xl shadow-black/5 md:aspect-[0.618]">
                <Image
                  src={pick('hero-iv-drip-2', cloudAssets.heroIvDrip2)}
                  alt="ผู้หญิงในแสงธรรมชาติ สื่อถึงการดูแลความงามอย่างเป็นส่วนตัว"
                  fill
                  priority
                  fetchPriority="high"
                  sizes="(min-width: 768px) 24rem, 90vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Treatment Atlas ──────────────────────────────────── */}
      <section
        id="treatment-atlas"
        className="scroll-mt-24 bg-cream px-6 py-24 sm:px-10 md:px-14 lg:px-20"
      >
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 flex flex-col justify-between gap-6 md:flex-row md:items-baseline">
            <Reveal>
              <span className="mb-2 block text-[0.68rem] uppercase tracking-[0.24em] text-olive/60">
                {serviceCategories.length} Treatments
              </span>
              <h2 className="font-serif text-4xl leading-tight text-olive-deep md:text-5xl">
                หัตถการทั้งหมด
              </h2>
            </Reveal>
            <Reveal delay={60}>
              <p className="max-w-xs text-xs leading-[1.9] text-ink/60">
                นิยามความสวยที่เป็นปัจเจก
                ผ่านการดูแลอย่างพิถีพิถันและเครื่องมือแพทย์ที่ได้มาตรฐาน
              </p>
            </Reveal>
          </div>

          <div className="grid gap-12 sm:grid-cols-2 sm:gap-8 lg:grid-cols-3 lg:gap-10">
            {categories.map((category, index) => {
              const key = categoryImageKey[category.slug];
              const image = key ? pick(key, category.heroImage ?? '') : category.heroImage;
              return (
                <TreatmentCard
                  key={category.slug}
                  category={category}
                  index={index}
                  image={image || undefined}
                />
              );
            })}
          </div>

          <Reveal className="mt-16 border-t border-olive/10 pt-8">
            <p className="text-[0.68rem] leading-[1.9] text-ink/45">
              ราคาและรายละเอียดของแต่ละโปรแกรมอยู่ในหน้าหัตถการนั้น ๆ
              การเลือกโปรแกรมและปริมาณที่เหมาะสมขึ้นอยู่กับการประเมินของแพทย์เป็นรายบุคคล
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Doctor-led assessment ────────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-4 py-16 md:px-6 md:py-24">
        <Reveal className="mx-auto mb-10 flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-12">
          <div>
            <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
              <span className="h-px w-8 bg-[var(--store-control)]" />
              Aesthetic Discipline
            </div>
            <h2 className="mt-5 font-serif text-4xl text-[var(--store-ink)] md:text-5xl">Doctor-led Assessment</h2>
            <p className="mt-4 max-w-2xl text-sm leading-[1.8] text-[var(--store-muted)]">
              ที่ {site.name} หัตถการทุกขั้นตอนดูแลโดยแพทย์ผู้มีใบประกอบวิชาชีพเวชกรรม
              เริ่มจากการประเมินโครงสร้างใบหน้าและสภาพผิวอย่างละเอียด
              เพื่อแนะนำแนวทางที่เหมาะกับแต่ละบุคคล
            </p>
          </div>
        </Reveal>

        <div className="home-swipe-rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-auto md:grid md:max-w-6xl md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          <div className="w-[85%] shrink-0 snap-center md:w-auto md:shrink">
            <PhysicianPanel
              label="The Lead Physician"
              name={doctor.nameTh}
              nameSecondary={doctor.name}
              role={doctor.role}
              licenseNo={doctor.licenseNo}
              summary={doctor.summary}
              expertise={doctor.expertise}
              languages={doctor.languages}
              imageSrc={pick('doctor-pratch', doctor.image)}
              imageAlt={`${doctor.nameTh} ${doctor.role} ของ ${site.name}`}
            />
          </div>
          <div className="w-[85%] shrink-0 snap-center md:w-auto md:shrink">
            <PhysicianPanel
              label="Clinic Physician"
              name={doctorEesha.name}
              nameSecondary={doctorEesha.nameTh}
              role={doctorEesha.role}
              licenseNo={doctorEesha.licenseNo}
              summary={doctorEesha.summary}
              expertise={doctorEesha.expertise}
              languages={doctorEesha.languages}
              imageSrc={overrides.get('doctor-eesha')?.public_id}
              imageAlt={`${doctorEesha.name} ${doctorEesha.role} ของ ${site.name}`}
              delay={80}
            />
          </div>
        </div>
      </section>

      {/* ── Curated promotions ───────────────────────────────── */}
      <section className="apple-promotion-section overflow-hidden">
        <Reveal className="apple-promotion-heading">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.025em] md:text-[1.55rem]">
                โปรแกรมแนะนำ
              </h2>
            </div>
          </div>
          <p className="mt-2 max-w-md text-[0.85rem] leading-[1.8] text-[var(--store-muted)]">
            ภาพโปรแกรมที่คลินิกจัดทำไว้ กรุณาสอบถามราคาและช่วงเวลาที่ใช้ได้กับทีม {site.name} ก่อนจองทุกครั้ง
          </p>
        </Reveal>

        <Reveal>
          <PromotionCarousel
            posters={posters}
            className="homepage-promotion-shelf"
            hidePreviousAtStart
            imageSizes="(min-width: 1440px) 19vw, (min-width: 1024px) 22vw, (min-width: 640px) 42vw, 78vw"
          />
        </Reveal>
      </section>

      {/* ── Location: Apple-style accordion card ─────────────── */}
      <section className="bg-cream py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h2 className="font-serif text-4xl text-olive-deep md:text-5xl">มาเยี่ยมเรา</h2>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
            >
              เปิดใน Google Maps <ArrowUpRight className="size-4" />
            </a>
          </Reveal>

          <Reveal delay={80} className="overflow-hidden rounded-[1.75rem] bg-[var(--store-surface)]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: intro + accordion */}
              <div className="flex flex-col justify-center px-7 py-10 sm:px-12 md:py-14 lg:px-16">
                <p className="max-w-md text-sm leading-[1.9] text-[var(--store-muted)]">
                  คลินิกความงามใจกลางสุขุมวิท พื้นที่สงบเป็นส่วนตัวสำหรับการปรึกษาและดูแลอย่างพิถีพิถัน
                </p>

                <div className="mt-8">
                  <details open className="visit-accordion group border-t border-[var(--store-control)]/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-serif text-xl text-[var(--store-ink)] md:text-2xl">ที่ตั้ง</span>
                      <ChevronDown className="size-5 text-[var(--store-muted)] transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="pb-6 pr-6 text-sm leading-[1.9] text-[var(--store-muted)]">
                      <a href={site.mapsUrl} target="_blank" rel="noopener" className="transition-colors hover:text-forest">
                        {site.addressFull}
                      </a>
                    </div>
                  </details>

                  <details className="visit-accordion group border-t border-[var(--store-control)]/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-serif text-xl text-[var(--store-ink)] md:text-2xl">เวลาทำการ</span>
                      <ChevronDown className="size-5 text-[var(--store-muted)] transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="pb-6 pr-6 text-sm leading-[1.9] text-[var(--store-muted)]">
                      {site.hoursDisplay.weekdays}
                      <br />
                      {site.hoursDisplay.sunday}
                    </div>
                  </details>

                  <details className="visit-accordion group border-y border-[var(--store-control)]/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-serif text-xl text-[var(--store-ink)] md:text-2xl">ช่องทางติดต่อ</span>
                      <ChevronDown className="size-5 text-[var(--store-muted)] transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="space-y-1.5 pb-6 pr-6 text-sm leading-[1.9] text-[var(--store-muted)]">
                      <a href={site.phoneUrl} className="block transition-colors hover:text-forest">
                        {site.phone}
                      </a>
                      <a href={site.lineUrl} target="_blank" rel="noopener" className="block transition-colors hover:text-forest">
                        LINE Official
                      </a>
                    </div>
                  </details>
                </div>
              </div>

              {/* Right: clinic photo / map */}
              <div className="relative order-first min-h-[16rem] bg-sand md:order-last md:min-h-[30rem]">
                {visitPhoto ? (
                  <Image
                    src={visitPhoto}
                    alt={`หน้าคลินิก ${site.name}`}
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <iframe
                    src={site.mapsEmbedUrl}
                    title={`แผนที่ ${site.name} — ${site.addressFull}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
