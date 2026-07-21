import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, BadgeCheck, ChevronDown, Clock, MapPin, Sparkles, Stethoscope } from 'lucide-react';
import { site } from '@/lib/site';
import { doctor, doctorEesha } from '@/lib/doctor';
import { serviceCategories } from '@/lib/services';
import { faqSchema, homePageSchema } from '@/lib/schema';
import { cloudAssets, heroHomePortrait } from '@/lib/cloud';
import { getImageOverrides } from '@/lib/site-images-store';
import { categoryImageKey, posterKeyByDefaultId } from '@/lib/site-images';
import { siteSocialImage } from '@/lib/metadata-images';
import { promotionPosters } from '@/lib/promotions';
import { Reveal } from '@/components/reveal';
import { PromotionCarousel } from '@/components/promotion-carousel';
import { ServiceCarousel } from '@/components/service-carousel';

const homeTitle = 'คลินิกความงามสุขุมวิท กรุงเทพฯ | Kazumi Clinic';
const homeDescription =
  'Kazumi Clinic คลินิกความงามย่านสุขุมวิท กรุงเทพฯ ให้บริการฟิลเลอร์ โบท็อกซ์ IV Drip วิตามิน สกินบูสเตอร์ และคอลลาเจนบูสเตอร์ โดยแพทย์ประเมินและวางแผนการดูแลเฉพาะบุคคล';

type PhysicianPanelProps = {
  label: string;
  name: string;
  nameSecondary: string;
  role: string;
  licenseNo: string;
  summary: string;
  expertise: readonly string[];
  languages: readonly string[];
  imageSrc?: string;
  imageAlt: string;
  delay?: number;
};

function PhysicianPanel({
  label,
  name,
  nameSecondary,
  role,
  licenseNo,
  summary,
  expertise,
  languages,
  imageSrc,
  imageAlt,
  delay = 0,
}: PhysicianPanelProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="apple-doctor-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] text-[var(--store-ink)]">
        {/* Photo on top — Apple-style card image */}
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-sand md:aspect-[2/1]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 768px) 40rem, 100vw"
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-24 items-center justify-center rounded-full border border-[var(--store-control)]">
                <Sparkles className="size-8 text-[var(--store-muted)]" strokeWidth={1} />
              </div>
            </div>
          )}
        </div>

        {/* Text below */}
        <div className="flex flex-1 flex-col px-7 pb-8 pt-7 text-center sm:px-10 md:px-8 lg:px-12">
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[var(--store-muted)]">{label}</p>
          <h3 className="mt-2.5 font-serif text-[1.9rem] leading-tight md:text-[2.15rem]">{name}</h3>
          <p lang="en" className="mt-1 font-serif text-base italic text-[var(--store-muted)]">
            {nameSecondary}
          </p>
          <p className="mt-2.5 text-[0.68rem] uppercase tracking-[0.17em] text-forest">{role}</p>
          <p className="mx-auto mt-4 max-w-lg text-sm leading-[1.8] text-[var(--store-muted)]">{summary}</p>

          <ul lang="en" className="mx-auto mt-5 flex max-w-lg flex-wrap justify-center gap-2">
            {expertise.map((item) => (
              <li
                key={item}
                className="rounded-full bg-[var(--store-surface)] px-3 py-1.5 text-[0.7rem] text-[var(--store-control-ink)]"
              >
                {item}
              </li>
            ))}
          </ul>

          <dl className="mx-auto mt-5 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[0.72rem] text-[var(--store-muted)]">
            <div className="flex items-center gap-1.5">
              <dt className="uppercase tracking-[0.16em] text-[var(--store-muted)]/70">ใบประกอบวิชาชีพ</dt>
              <dd className="text-[var(--store-ink)]">เลขที่ {licenseNo}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="uppercase tracking-[0.16em] text-[var(--store-muted)]/70">ภาษา</dt>
              <dd className="text-[var(--store-ink)]">{languages.join(' · ')}</dd>
            </div>
          </dl>

          <div className="mt-auto pt-6">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
            >
              ดูประวัติฉบับเต็ม <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage('hero-home', `${site.name} คลินิกความงามสุขุมวิท`);

  return {
    title: homeTitle,
    description: homeDescription,
    alternates: { canonical: site.url },
    openGraph: {
      title: homeTitle,
      description: homeDescription,
      url: site.url,
      siteName: site.name,
      type: 'website',
      locale: 'th_TH',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: homeTitle,
      description: homeDescription,
      images: [socialImage.url],
    },
  };
}

const faqs = [
  {
    question: `${site.name} ให้บริการอะไรบ้าง?`,
    answer: `${site.name} ให้บริการ${serviceCategories.map((c) => c.title).join(' ')} โดยแพทย์เป็นผู้ประเมินก่อนรับบริการ`,
  },
  {
    question: 'คลินิกเปิดกี่โมงถึงกี่โมง?',
    answer: `${site.hoursDisplay.weekdays} และ${site.hoursDisplay.sunday}`,
  },
  {
    question: 'คลินิกอยู่ที่ไหน?',
    answer: `${site.name} ตั้งอยู่ที่ ${site.addressFull} ใบอนุญาตสถานพยาบาลเลขที่ ${site.license}`,
  },
  {
    question: 'ใครเป็นผู้ทำหัตถการ?',
    answer: `หัตถการดำเนินการโดยแพทย์ผู้มีใบประกอบวิชาชีพเวชกรรม — ${site.doctors
      .map((d) => `${d.name} (เลขที่ ${d.licenseNo})`)
      .join(', ')}`,
  },
  {
    question: 'จองคิวได้ที่ไหน?',
    answer: `จองคิวผ่าน LINE Official Account หรือโทร ${site.phone}`,
  },
];

export const revalidate = 3600;

export default async function HomePage() {
  const overrides = await getImageOverrides();
  const pick = (key: string, fallback: string) => overrides.get(key)?.public_id ?? fallback;

  const heroSrc = overrides.has('hero-home') ? pick('hero-home', '') : heroHomePortrait;
  const doctorSrc = pick('doctor-pratch', doctor.image);
  const eeshaSrc = overrides.get('doctor-eesha')?.public_id;
  const visitPhoto = overrides.get('home-visit')?.public_id;

  const posters = promotionPosters
    .map((poster) => {
      const key = posterKeyByDefaultId.get(poster.src);
      const override = key ? overrides.get(key)?.public_id : undefined;
      return override ? { ...poster, src: override } : poster;
    });
  const serviceHeroOverrides = Object.fromEntries(
    serviceCategories.flatMap((category) => {
      const key = categoryImageKey[category.slug];
      const override = overrides.get(key)?.public_id;
      return override ? [[category.slug, override]] : [];
    }),
  );

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(homePageSchema(pick('hero-home', cloudAssets.heroHome))) }}
      />

      {/* ── Hero: full-bleed portrait with overlaid copy ─────── */}
      <section className="relative isolate flex min-h-[86vh] items-end overflow-hidden bg-olive-deep text-sand md:min-h-[92vh] md:items-center">
        <Image
          src={heroSrc}
          alt=""
          aria-hidden="true"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[38%_28%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-olive-deep/70 via-olive-deep/35 to-olive-deep/5 md:bg-gradient-to-r md:from-olive-deep/70 md:via-olive-deep/25 md:to-transparent"
        />
        <div className="hero-grid absolute inset-0 opacity-[0.1]" aria-hidden="true" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-24 sm:px-10 md:grid-cols-[minmax(0,1.55fr)_minmax(15rem,1fr)] md:items-center md:gap-12 md:px-12 lg:px-16">
          <div className="max-w-2xl">
            <div className="hero-enter flex items-center gap-3 text-[0.64rem] uppercase tracking-[0.32em] text-sand/60">
              <span aria-hidden="true" className="h-px w-10 bg-mint-glow" />
              Kazumi Clinic · เวชศาสตร์ความงาม สุขุมวิท
            </div>
            <h1
              lang="en"
              className="hero-enter hero-enter--slow mt-7 font-serif text-[13.5vw] leading-[0.95] tracking-[-0.03em] text-sand sm:text-6xl md:text-[4rem] lg:text-[4.7rem]"
            >
              Where thoughtful care
              <br />
              becomes <span className="text-mint-glow">natural</span> beauty.
            </h1>
            <p className="hero-enter hero-enter--later mt-7 max-w-xl text-sm leading-[1.95] text-sand/75 md:text-base">
              <span lang="ja" className="text-sand/55">
                純粋さは永遠の美へ
              </span>{' '}
              — ความงามที่เริ่มจากความเข้าใจ แพทย์ประเมินและออกแบบการดูแลเฉพาะคุณ ในบรรยากาศที่สงบและเป็นส่วนตัว
            </p>
            <div className="hero-enter hero-enter--later mt-9 flex flex-wrap items-center gap-3">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-forest active:translate-y-0"
              >
                จองคิวผ่าน LINE <ArrowUpRight className="size-4" />
              </a>
              <Link
                href="/services"
                className="inline-flex items-center rounded-full border border-sand/35 px-7 py-3 text-sm font-medium text-sand transition-colors duration-200 hover:border-sand/70 hover:bg-sand/10"
              >
                ดูบริการทั้งหมด
              </Link>
            </div>
          </div>

          <div
            aria-hidden="true"
            className="hero-enter hero-enter--image hidden flex-col items-center justify-center gap-5 text-center md:flex"
          >
            <FlowerMark className="size-24 text-sand/25 lg:size-32" />
            <div>
              <p lang="en" className="font-serif text-xl italic leading-snug text-sand/25 lg:text-2xl">
                Where thoughtful care becomes natural beauty.
              </p>
              <p lang="ja" className="mt-2 font-serif text-base text-sand/20 lg:text-lg">
                純粋さは永遠の美へ
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Trust strip: verifiable credibility signals ──────── */}
      <section className="border-b border-olive/10 bg-cream">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-7 text-olive-deep sm:px-10 md:grid-cols-4 md:gap-8 md:px-12">
          {[
            { icon: Stethoscope, label: 'ดูแลโดยแพทย์เวชกรรม', sub: 'ประเมินทุกเคสก่อนหัตถการ' },
            { icon: BadgeCheck, label: 'ใบอนุญาตสถานพยาบาล', sub: site.license },
            { icon: MapPin, label: 'ใจกลางสุขุมวิท', sub: 'กรุงเทพฯ' },
            { icon: Clock, label: 'เปิดทุกวัน', sub: site.hoursDisplay.short },
          ].map(({ icon: Icon, label, sub }) => (
            <li key={label} className="flex items-center gap-3">
              <Icon className="size-5 shrink-0 text-forest" strokeWidth={1.5} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[0.8rem] font-medium leading-tight">{label}</p>
                <p className="mt-0.5 text-[0.72rem] leading-tight text-ink/55">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Services: Apple-inspired media stream ────────────── */}
      <section className="apple-services-section overflow-hidden">
        <Reveal className="apple-services-heading">
          <div>
            <h2>บริการของเรา.</h2>
            <p lang="en">
              {site.taglineTh}
            </p>
          </div>
        </Reveal>

        <ServiceCarousel categories={serviceCategories} heroOverrides={serviceHeroOverrides} />
      </section>

      {/* ── Physicians: Apple-style cards, photo on top ──────── */}
      <section className="bg-[var(--store-surface)] px-4 py-12 md:px-6 md:py-20">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <p lang="en" className="text-[0.62rem] uppercase tracking-[0.3em] text-[var(--store-muted)]">
            Physician Profiles
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[var(--store-ink)] md:text-5xl">ทีมแพทย์ของเรา</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-[1.8] text-[var(--store-muted)]">
            รู้จักประวัติการศึกษา ขอบเขตการดูแล และข้อมูลใบประกอบวิชาชีพของแพทย์ประจำคลินิก
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
          <PhysicianPanel
            label="The Lead Physician"
            name={doctor.nameTh}
            nameSecondary={doctor.name}
            role={doctor.role}
            licenseNo={doctor.licenseNo}
            summary={doctor.summary}
            expertise={doctor.expertise}
            languages={doctor.languages}
            imageSrc={doctorSrc}
            imageAlt={`${doctor.nameTh} ${doctor.role} ของ ${site.name}`}
          />
          <PhysicianPanel
            label="Clinic Physician"
            name={doctorEesha.name}
            nameSecondary={doctorEesha.nameTh}
            role={doctorEesha.role}
            licenseNo={doctorEesha.licenseNo}
            summary={doctorEesha.summary}
            expertise={doctorEesha.expertise}
            languages={doctorEesha.languages}
            imageSrc={eeshaSrc}
            imageAlt={`${doctorEesha.name} ${doctorEesha.role} ของ ${site.name}`}
            delay={80}
          />
        </div>
      </section>

      {/* ── Promotions: Apple-style peeking carousel ─────────── */}
      <section className="apple-promotion-section overflow-hidden">
        <Reveal className="apple-promotion-heading">
          <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
            <h2 className="text-[1.35rem] font-semibold tracking-[-0.025em] md:text-[1.55rem]">
              โปรโมชั่นล่าสุด
            </h2>
            <p className="text-[1.15rem] tracking-[-0.02em] md:text-[1.3rem]">
              เลือกดูโปรแกรมที่คลินิกคัดสรรไว้ได้เลย
            </p>
          </div>
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
                  <span aria-hidden="true" className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-[var(--store-muted)]/50">
                    <MapPin className="size-10" strokeWidth={0.9} />
                    <span className="text-xs uppercase tracking-[0.2em]">สุขุมวิท · กรุงเทพฯ</span>
                  </span>
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Reviews + FAQ: paired two-column block ───────────── */}
      <section className="bg-cream px-4 py-20 md:px-6 md:py-32">
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-stretch gap-4 md:grid-cols-2 md:gap-5">
          {/* Reviews — voice of our patients */}
          <Reveal className="h-full">
            <div className="apple-doctor-card flex h-full flex-col rounded-[1.75rem] bg-[var(--store-card)] px-8 py-10 text-[var(--store-ink)] sm:px-10 md:py-12">
              <p lang="en" className="text-[0.62rem] uppercase tracking-[0.3em] text-forest">
                Reviews &amp; Results
              </p>
              <h2 className="mt-3 font-serif text-3xl text-olive-deep md:text-4xl">เสียงจากผู้ใช้บริการ</h2>
              <p className="mt-4 max-w-md text-sm leading-[1.9] text-[var(--store-muted)]">
                อ่านรีวิวจริงและผลลัพธ์ก่อน–หลังจากผู้ใช้บริการของเราได้บน Google และ Instagram
                หรือสอบถามผลลัพธ์เฉพาะบุคคลกับทีมแพทย์ผ่าน LINE
              </p>
              <p className="mt-3 text-xs text-[var(--store-muted)]/70">
                *ผลลัพธ์ขึ้นอยู่กับสภาพผิวและปัญหาเฉพาะบุคคล
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:bg-forest"
                >
                  ดูรีวิวบน Google <ArrowUpRight className="size-4" />
                </a>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2 rounded-full border border-olive-deep/25 px-7 py-3 text-sm font-medium text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
                >
                  Instagram {site.instagramHandle} <ArrowUpRight className="size-4" />
                </a>
                <Link
                  href="/reviews"
                  className="inline-flex items-center gap-1.5 rounded-full border border-olive-deep/25 px-7 py-3 text-sm font-medium text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
                >
                  ดูหน้ารีวิวทั้งหมด
                </Link>
              </div>
            </div>
          </Reveal>

          {/* FAQ — accordion (content + FAQPage schema parity) */}
          <Reveal delay={80} className="h-full">
            <div className="apple-doctor-card flex h-full flex-col rounded-[1.75rem] bg-[var(--store-card)] px-8 py-10 text-[var(--store-ink)] sm:px-10 md:py-12">
              <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.22em] text-forest">
                <span aria-hidden="true" className="h-px w-10 bg-forest" /> คำถามที่พบบ่อย
              </div>
              <dl className="mt-4 border-t border-olive/12">
                {faqs.map((f, index) => (
                  <details
                    key={f.question}
                    open={index === 0}
                    className="visit-accordion group border-b border-olive/12"
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-3 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="mt-1 font-sans text-xs tracking-[0.15em] text-forest">0{index + 1}</span>
                      <dt className="flex-1 font-serif text-base leading-snug text-olive-deep md:text-lg">
                        {f.question}
                      </dt>
                      <ChevronDown className="mt-1 size-4 shrink-0 text-olive-light transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <dd className="pb-5 pl-9 pr-2 text-sm leading-relaxed text-ink/65">{f.answer}</dd>
                  </details>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}

// Decorative echo of the brand mark — six overlapping petals, used as a faint
// background texture rather than a literal logo reproduction.
function FlowerMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 200" fill="none" className={className} aria-hidden="true">
      {Array.from({ length: 6 }).map((_, i) => (
        <ellipse
          key={i}
          cx="100"
          cy="60"
          rx="28"
          ry="44"
          fill="currentColor"
          transform={`rotate(${i * 60} 100 100)`}
        />
      ))}
    </svg>
  );
}
