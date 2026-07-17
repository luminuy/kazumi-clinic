import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight } from 'lucide-react';
import { site } from '@/lib/site';
import { cld, cloudAssets } from '@/lib/cloud';
import { getImageOverrides, getOgImage } from '@/lib/site-images-store';
import { categoryImageKey } from '@/lib/site-images';
import { getServiceBySlug, serviceCategories, type ServiceCategory } from '@/lib/services';
import { serviceCategoryListSchema, breadcrumbSchema } from '@/lib/schema';
import { Reveal } from '@/components/reveal';

export async function generateMetadata(): Promise<Metadata> {
  const ogImage = await getOgImage('hero-filler');
  return {
    title: 'บริการ / หัตถการ',
    description: `บริการและหัตถการทั้งหมดของ ${site.name} — ฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ คอลลาเจนบูสเตอร์ และ IV Drip วิตามิน ดูแลโดยแพทย์`,
    alternates: { canonical: `${site.url}/services` },
    openGraph: {
      title: `บริการ / หัตถการ — ${site.name}`,
      description: site.description,
      url: `${site.url}/services`,
      type: 'website',
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
  };
}

const featuredServiceSlugs = ['filler', 'botox', 'skin-booster'] as const;

const featuredImageFallbacks: Record<(typeof featuredServiceSlugs)[number], string> = {
  filler: cloudAssets.heroFiller,
  botox: cloudAssets.heroIvDrip3,
  'skin-booster': cloudAssets.heroSkinBooster,
};

const featuredImageAlts: Record<(typeof featuredServiceSlugs)[number], string> = {
  filler: 'ภาพใบหน้าด้านข้างของผู้หญิงในแสงธรรมชาติ',
  botox: 'ผู้หญิงกำลังรับการดูแลผิวหน้าในคลินิก',
  'skin-booster': 'ภาพผิวหน้าผู้หญิงท่ามกลางแสงและเงาใบไม้',
};

function FeaturedService({
  category,
  index,
  image,
  imageAlt,
}: {
  category: ServiceCategory;
  index: number;
  image: string;
  imageAlt: string;
}) {
  return (
    <Reveal delay={index * 60}>
      <article>
        <Link href={`/${category.slug}`} className="group block active:scale-[0.99]">
          <div className="relative aspect-[1.64] overflow-hidden bg-[#deddd5]">
            <Image
              src={image}
              alt={imageAlt}
              fill
              sizes="(min-width: 1024px) 25vw, (min-width: 640px) 42vw, 88vw"
              className="object-cover transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.025]"
            />
          </div>
          <p className="mt-4 text-[0.58rem] tracking-[0.18em] text-olive/45">
            {String(index + 1).padStart(2, '0')}
          </p>
          <h2 className="mt-1 font-serif text-[1.72rem] leading-none text-olive-deep">
            {category.titleEn}
          </h2>
          <p className="mt-2 min-h-10 text-xs leading-[1.75] text-ink/65">
            {category.shortDescription}
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-[0.68rem] tracking-wide text-olive-deep transition-[gap] duration-200 ease-out group-hover:gap-3">
            Explore Details <ArrowUpRight className="size-3" />
          </span>
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
  const featuredServices = featuredServiceSlugs.map((slug) => {
    const category = getServiceBySlug(slug);
    if (!category) throw new Error(`Missing featured service category: ${slug}`);
    return category;
  });

  return (
    <div className="services-reference-page bg-[#fbf9f1]">
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

      <section className="relative min-h-[72rem] sm:min-h-[60rem] lg:min-h-[68rem]">
        <Reveal className="absolute inset-x-5 top-[24rem] sm:left-auto sm:right-[8%] sm:top-[12rem] sm:w-[52%] lg:right-[10%] lg:top-[14rem] lg:w-[42%]">
          <div className="relative aspect-[0.66] overflow-hidden bg-[#e4e3db] sm:aspect-[0.76]">
            <Image
              src={pick('hero-iv-drip-2', cloudAssets.heroIvDrip2)}
              alt="ผู้หญิงในแสงธรรมชาติ สื่อถึงการดูแลความงามอย่างเป็นส่วนตัว"
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 1024px) 42vw, (min-width: 640px) 52vw, 90vw"
              className="object-cover"
            />
          </div>
          <span
            aria-hidden="true"
            className="absolute -bottom-8 left-[44%] h-16 w-px bg-olive/20"
          />
          <span
            aria-hidden="true"
            className="absolute -bottom-8 left-[44%] h-px w-16 bg-olive/20"
          />
        </Reveal>
      </section>

      <section className="px-5 pb-[42rem] sm:px-10 sm:pb-[28rem] md:px-14 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-16 sm:grid-cols-3 sm:gap-7 lg:gap-12">
          {featuredServices.map((category, index) => {
            const slug = featuredServiceSlugs[index];
            const imageKey = categoryImageKey[slug];
            const image = imageKey
              ? pick(imageKey, featuredImageFallbacks[slug])
              : featuredImageFallbacks[slug];
            return (
              <FeaturedService
                key={category.slug}
                category={category}
                index={index}
                image={image}
                imageAlt={featuredImageAlts[slug]}
              />
            );
          })}
        </div>
      </section>

      <section className="bg-[#e4e3db] px-5 py-16 sm:px-10 md:px-14 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <p className="text-[0.62rem] tracking-[0.04em] text-olive-deep/70">Curated Promotions</p>
          <Reveal className="mt-16 max-w-xl bg-white sm:mt-20">
            <Link href="/promotions" className="group block active:scale-[0.995]">
              <div className="relative aspect-[1.42] overflow-hidden bg-[#d9d8d0]">
                <Image
                  src={pick('promo-filler-neura', cloudAssets.promoFillerNeura)}
                  alt="โปสเตอร์โปรแกรมฟิลเลอร์ของ Kazumi Clinic"
                  fill
                  sizes="(min-width: 640px) 36rem, 90vw"
                  className="object-cover object-top transition-transform duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.02]"
                />
              </div>
              <div className="p-6 sm:p-8">
                <p className="font-serif text-lg text-olive-deep">Filler Perfection</p>
                <p className="mt-2 text-xs leading-[1.75] text-ink/60">
                  โปรแกรมฟิลเลอร์ที่ออกแบบตามโครงหน้าและประเมินโดยแพทย์
                </p>
                <p className="mt-3 text-[0.62rem] leading-relaxed text-ink/45">
                  กรุณาสอบถามราคาและช่วงเวลาโปรโมชั่นปัจจุบันกับคลินิกก่อนจอง
                </p>
                <span className="mt-7 inline-flex items-center gap-2 text-[0.68rem] text-olive-deep transition-[gap] duration-200 ease-out group-hover:gap-3">
                  Book Now <ArrowUpRight className="size-3" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      <section className="px-5 pb-14 pt-[42rem] sm:px-10 sm:pt-[30rem] md:px-14 lg:px-20">
        <Reveal className="mx-auto max-w-6xl overflow-hidden bg-[#e4e3db]">
          <iframe
            src={site.mapsEmbedUrl}
            width="100%"
            height="340"
            className="block grayscale"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            title={`แผนที่ ${site.name}`}
          />
        </Reveal>
      </section>
    </div>
  );
}
