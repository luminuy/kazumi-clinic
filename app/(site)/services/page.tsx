import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowDown, ArrowUpRight } from 'lucide-react';
import { site } from '@/lib/site';
import { cloudAssets } from '@/lib/cloud';
import { getOgImage } from '@/lib/site-images-store';
import { serviceCategories, type ServiceCategory } from '@/lib/services';
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

const editorialImages: Record<string, { src: string; alt: string }> = {
  filler: { src: cloudAssets.heroFiller, alt: 'ใบหน้าด้านข้างของผู้หญิงในแสงธรรมชาติ' },
  botox: { src: cloudAssets.heroIvDrip3, alt: 'ผู้หญิงกำลังรับการดูแลผิวหน้าโดยผู้เชี่ยวชาญ' },
  'iv-drip': { src: cloudAssets.heroIvDrip1, alt: 'ใบหน้าผู้หญิงในแสงนุ่ม ผิวดูกระจ่างใส' },
  'skin-booster': { src: cloudAssets.heroSkinBooster, alt: 'ใบหน้าผู้หญิงท่ามกลางแสงและเงาใบไม้' },
  'collagen-booster': {
    src: cloudAssets.heroIvDrip2,
    alt: 'ภาพผู้หญิงในบรรยากาศสงบและแสงธรรมชาติ',
  },
  'thread-lift': { src: cloudAssets.heroFiller, alt: 'ใบหน้าด้านข้างของผู้หญิง เห็นแนวกรอบหน้า' },
  mesotherapy: { src: cloudAssets.heroIvDrip3, alt: 'การดูแลผิวหน้าในบรรยากาศของคลินิก' },
  'acne-care': { src: cloudAssets.heroSkinBooster, alt: 'ภาพผิวหน้าผู้หญิงในแสงธรรมชาติ' },
  'laser-hifu': { src: cloudAssets.heroIvDrip1, alt: 'ใบหน้าผู้หญิงถ่ายตรงในแสงนุ่ม' },
};

function TreatmentEntry({ category, index }: { category: ServiceCategory; index: number }) {
  const image = editorialImages[category.slug] ?? editorialImages.filler;
  const isEven = index % 2 === 0;

  return (
    <Reveal delay={Math.min(index * 35, 180)}>
      <article className="group border-t border-olive/20 py-10 sm:py-14 lg:py-20">
        <Link
          href={`/${category.slug}`}
          className="grid items-center gap-7 active:scale-[0.995] sm:grid-cols-12 sm:gap-10 lg:gap-16"
        >
          <div
            className={`relative aspect-[1/1.18] overflow-hidden bg-muted sm:col-span-5 lg:col-span-4 ${
              isEven ? 'sm:order-1' : 'sm:order-2 sm:col-start-8 lg:col-start-9'
            }`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 1024px) 31vw, (min-width: 640px) 40vw, 90vw"
              className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:scale-[1.025]"
            />
            <span className="absolute left-4 top-4 bg-sand/90 px-2 py-1 font-serif text-xs text-olive-deep">
              {String(index + 1).padStart(2, '0')}
            </span>
          </div>

          <div
            className={`sm:col-span-7 lg:col-span-6 ${
              isEven ? 'sm:order-2 lg:col-start-6' : 'sm:order-1 lg:col-start-2'
            }`}
          >
            <p className="text-[0.65rem] uppercase tracking-[0.28em] text-olive-light">
              {category.titleEn}
            </p>
            <h2 className="mt-3 font-serif text-3xl leading-none tracking-[-0.025em] text-olive-deep sm:text-4xl lg:text-5xl">
              {category.title}
            </h2>
            <p className="mt-5 max-w-lg text-sm leading-[1.85] text-ink/65 sm:text-base">
              {category.shortDescription}
            </p>
            <span className="mt-7 inline-flex items-center gap-3 border-b border-olive/35 pb-1.5 text-xs uppercase tracking-[0.16em] text-olive transition-[gap,border-color] duration-200 ease-out group-hover:gap-5 group-hover:border-olive">
              Explore details
              <ArrowUpRight className="size-3.5" />
            </span>
          </div>
        </Link>
      </article>
    </Reveal>
  );
}

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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceCategoryListSchema(serviceCategories)),
        }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <section className="relative min-h-[calc(100svh-4.5rem)] overflow-hidden bg-[#f6f3eb]">
        <div className="mx-auto grid min-h-[calc(100svh-4.5rem)] max-w-7xl items-center gap-12 px-5 py-14 sm:px-10 md:grid-cols-12 md:px-12 lg:px-16">
          <div className="relative z-10 md:col-span-6 lg:col-span-5">
            <nav className="text-[0.65rem] uppercase tracking-[0.22em] text-olive-light">
              <Link href="/" className="transition-colors hover:text-olive-deep">
                Home
              </Link>
              <span className="mx-2 text-olive/30">/</span>
              <span className="text-olive">Services</span>
            </nav>
            <p className="mt-16 flex items-center gap-3 text-[0.65rem] uppercase tracking-[0.3em] text-olive-light md:mt-20">
              <span className="h-px w-9 bg-olive/40" /> Our treatments
            </p>
            <h1 className="mt-6 font-serif text-[3.35rem] leading-[0.88] tracking-[-0.055em] text-olive-deep sm:text-7xl lg:text-[5.5rem]">
              Care, shaped
              <br />
              <span className="italic text-olive-light">around you.</span>
            </h1>
            <p className="mt-7 max-w-md text-sm leading-[1.9] text-ink/65 sm:text-base">
              บริการความงามที่เริ่มจากการรับฟังและประเมินโดยแพทย์
              เพื่อเลือกแนวทางที่เหมาะกับแต่ละบุคคล
            </p>
            <a
              href="#treatments"
              className="mt-10 inline-flex items-center gap-3 text-xs uppercase tracking-[0.18em] text-olive transition-[gap] duration-200 ease-out hover:gap-5"
            >
              Discover treatments <ArrowDown className="size-3.5" />
            </a>
          </div>

          <div className="relative md:col-span-6 md:col-start-7 lg:col-span-6 lg:col-start-7">
            <div className="relative ml-auto aspect-[0.72] w-[88%] max-w-[31rem] overflow-hidden bg-olive-deep sm:w-[82%] md:w-full">
              <Image
                src={cloudAssets.heroIvDrip2}
                alt="ผู้หญิงในบรรยากาศสงบ สื่อถึงการดูแลอย่างเป็นส่วนตัว"
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 44vw, (min-width: 768px) 48vw, 82vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/25 via-transparent to-transparent" />
            </div>
            <div className="absolute -bottom-7 left-0 border-l border-olive/30 bg-[#f6f3eb] px-5 py-4 sm:px-7">
              <p className="font-serif text-2xl text-olive-deep">Medical aesthetics</p>
              <p className="mt-1 text-[0.62rem] uppercase tracking-[0.2em] text-olive-light">
                Sukhumvit · Bangkok
              </p>
            </div>
          </div>
        </div>
      </section>

      <section
        id="treatments"
        className="scroll-mt-24 bg-background px-5 py-24 sm:px-10 md:px-12 md:py-32 lg:px-16"
      >
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-8 pb-12 sm:grid-cols-12 sm:items-end md:pb-16">
            <div className="sm:col-span-7">
              <p className="text-[0.65rem] uppercase tracking-[0.3em] text-olive-light">
                Treatment index
              </p>
              <h2 className="mt-5 font-serif text-4xl leading-none tracking-[-0.035em] text-olive-deep sm:text-5xl md:text-6xl">
                บริการของเรา
              </h2>
            </div>
            <p className="max-w-md text-sm leading-[1.85] text-ink/60 sm:col-span-5 sm:justify-self-end">
              เลือกดูรายละเอียดของแต่ละโปรแกรม ราคา และข้อมูลก่อนรับบริการ
            </p>
          </div>

          {serviceCategories.map((category, index) => (
            <TreatmentEntry key={category.slug} category={category} index={index} />
          ))}
          <div className="border-t border-olive/20" />
        </div>
      </section>

      <section className="bg-olive-deep px-5 py-20 text-sand sm:px-10 md:px-12 md:py-28 lg:px-16">
        <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <p className="text-[0.65rem] uppercase tracking-[0.3em] text-sand/45">
              Personal consultation
            </p>
            <h2 className="mt-5 max-w-2xl font-serif text-4xl leading-[1.05] tracking-[-0.035em] sm:text-5xl md:text-6xl">
              ไม่แน่ใจว่าควรเริ่มจากบริการไหน?
            </h2>
          </div>
          <div className="md:col-span-4 md:col-start-9">
            <p className="text-sm leading-[1.85] text-sand/60">
              นัดหมายเพื่อพูดคุยเป้าหมายและรับการประเมินจากแพทย์ก่อนตัดสินใจ
            </p>
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="mt-7 inline-flex items-center gap-4 border-b border-sand/45 pb-2 text-xs uppercase tracking-[0.18em] transition-[gap,border-color] duration-200 ease-out hover:gap-6 hover:border-sand active:scale-[0.98]"
            >
              Book via LINE <ArrowUpRight className="size-4" />
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
