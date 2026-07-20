import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, CircleHelp, MapPin, Navigation, Sparkles } from 'lucide-react';
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
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-sand">
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
        <div className="flex flex-1 flex-col px-7 pb-10 pt-9 text-center sm:px-10 md:px-8 lg:px-12">
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[var(--store-muted)]">{label}</p>
          <h3 className="mt-3 font-serif text-[1.9rem] leading-tight md:text-[2.15rem]">{name}</h3>
          <p lang="en" className="mt-1 font-serif text-base italic text-[var(--store-muted)]">
            {nameSecondary}
          </p>
          <p className="mt-3 text-[0.68rem] uppercase tracking-[0.17em] text-forest">{role}</p>
          <p className="mx-auto mt-5 max-w-md text-sm leading-[1.85] text-[var(--store-muted)]">{summary}</p>

          <ul lang="en" className="mx-auto mt-6 flex max-w-md flex-wrap justify-center gap-2">
            {expertise.map((item) => (
              <li
                key={item}
                className="rounded-full bg-[var(--store-surface)] px-3 py-1.5 text-[0.7rem] text-[var(--store-control-ink)]"
              >
                {item}
              </li>
            ))}
          </ul>

          <dl className="mx-auto mt-6 flex flex-wrap justify-center gap-x-8 gap-y-2 text-[0.72rem] text-[var(--store-muted)]">
            <div className="flex items-center gap-1.5">
              <dt className="uppercase tracking-[0.16em] text-[var(--store-muted)]/70">ใบประกอบวิชาชีพ</dt>
              <dd className="text-[var(--store-ink)]">เลขที่ {licenseNo}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="uppercase tracking-[0.16em] text-[var(--store-muted)]/70">ภาษา</dt>
              <dd className="text-[var(--store-ink)]">{languages.join(' · ')}</dd>
            </div>
          </dl>

          <div className="mt-auto pt-8">
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

      {/* ── Hero: editorial asymmetry — image-dominant left, intro right ─────── */}
      <section className="bg-surface">
        <div className="flex flex-col md:min-h-[88vh] md:flex-row md:items-stretch">
          <div className="relative h-[58vh] w-full overflow-hidden bg-olive-deep/[0.06] md:h-auto md:w-3/5">
            <Image
              src={heroSrc}
              alt=""
              aria-hidden="true"
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-forest/10 mix-blend-multiply" />
          </div>

          <div className="flex w-full flex-col justify-center px-6 py-14 sm:px-10 md:w-2/5 md:py-20 md:pl-16 lg:pl-20">
            <span aria-hidden="true" className="mb-6 block h-px w-10 bg-forest" />
            <p lang="en" className="text-[0.7rem] uppercase tracking-[0.28em] text-olive-deep/70">
              Kazumi Clinic · สุขุมวิท กรุงเทพฯ
            </p>
            <h1
              lang="en"
              className="mt-6 font-serif text-[2.4rem] leading-[1.08] tracking-[-0.02em] text-olive-deep sm:text-5xl md:text-[3.1rem]"
            >
              Where balance purity becomes eternal beauty.
            </h1>
            <p className="mt-7 max-w-md text-sm leading-[1.9] text-ink/65">{site.description}</p>
            <div className="mt-9 flex flex-wrap gap-4">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 bg-mint px-8 py-4 text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-forest active:scale-[0.98]"
              >
                จองคิวผ่าน LINE <ArrowUpRight className="size-4" />
              </a>
              <Link
                href="/services"
                className="inline-flex items-center gap-2 border border-olive-deep/40 px-8 py-4 text-[0.7rem] uppercase tracking-[0.18em] text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
              >
                ดูบริการทั้งหมด
              </Link>
            </div>
          </div>
        </div>
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
      <section className="bg-[var(--store-surface)] px-4 pb-14 pt-14 md:px-6 md:pb-20 md:pt-16">
        <Reveal className="mx-auto mb-10 max-w-3xl text-center md:mb-12">
          <p lang="en" className="text-[0.62rem] uppercase tracking-[0.3em] text-[var(--store-muted)]">
            Physician Profiles
          </p>
          <h2 className="mt-3 font-serif text-4xl text-[var(--store-ink)] md:text-5xl">ทีมแพทย์ของเรา</h2>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-[1.8] text-[var(--store-muted)]">
            รู้จักประวัติการศึกษา ขอบเขตการดูแล และข้อมูลใบประกอบวิชาชีพของแพทย์ประจำคลินิก
          </p>
        </Reveal>

        <div className="mx-auto grid max-w-5xl grid-cols-1 gap-4 md:grid-cols-2 md:gap-5">
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

      {/* ── Location ─────────────────────────────────────────── */}
      <section className="bg-cream py-24 md:py-32">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-14 px-6 sm:px-10 md:grid-cols-2 md:gap-16 md:px-14 lg:px-20">
          <Reveal>
            <span aria-hidden="true" className="mb-6 block h-px w-10 bg-forest" />
            <h2 className="font-serif text-4xl text-olive-deep md:text-5xl">มาเยี่ยมเรา</h2>
            <p className="mt-8 max-w-md text-sm leading-[1.9] text-ink/65 md:text-base">
              คลินิกความงามใจกลางสุขุมวิท พื้นที่สงบเป็นส่วนตัวสำหรับการปรึกษาและดูแลอย่างพิถีพิถัน
            </p>
            <dl className="mt-10 space-y-8">
              <div>
                <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-olive/60">Location</dt>
                <dd className="mt-2 max-w-sm text-sm leading-relaxed text-ink/75">
                  <a href={site.mapsUrl} target="_blank" rel="noopener" className="hover:text-forest">
                    {site.addressFull}
                  </a>
                </dd>
              </div>
              <div>
                <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-olive/60">Hours</dt>
                <dd className="mt-2 text-sm leading-relaxed text-ink/75">
                  {site.hoursDisplay.weekdays}
                  <br />
                  {site.hoursDisplay.sunday}
                </dd>
              </div>
              <div>
                <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-olive/60">Contact</dt>
                <dd className="mt-2 space-y-1 text-sm leading-relaxed text-ink/75">
                  <a href={site.phoneUrl} className="block hover:text-forest">
                    {site.phone}
                  </a>
                  <a href={site.lineUrl} target="_blank" rel="noopener" className="block hover:text-forest">
                    LINE Official
                  </a>
                </dd>
              </div>
            </dl>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener"
              className="mt-10 inline-flex items-center gap-2 border border-olive-deep/40 px-8 py-4 text-[0.68rem] uppercase tracking-[0.18em] text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
            >
              <Navigation className="size-4" /> Open Google Maps
            </a>
          </Reveal>

          <Reveal delay={80} className="relative min-h-[22rem] overflow-hidden border border-olive/12 bg-olive-deep/[0.06] md:min-h-[30rem]">
            {visitPhoto ? (
              <Image
                src={visitPhoto}
                alt={`หน้าคลินิก ${site.name}`}
                fill
                sizes="(min-width: 768px) 45vw, 90vw"
                className="object-cover"
              />
            ) : (
              <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                <MapPin className="size-10 text-olive/25" strokeWidth={0.9} />
              </span>
            )}
          </Reveal>
        </div>
      </section>

      {/* ── FAQ (kept for content + FAQPage schema parity) ───── */}
      <section className="mx-auto max-w-7xl px-6 pb-24 sm:px-10 md:px-14 md:pb-32 lg:px-20">
        <Reveal>
          <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.22em] text-forest">
            <span aria-hidden="true" className="h-px w-10 bg-forest" /> คำถามที่พบบ่อย
          </div>
          <dl className="mt-8 grid gap-3 md:grid-cols-2">
            {faqs.map((f, index) => (
              <div key={f.question} className="border border-olive/12 bg-surface p-6">
                <dt className="flex items-start gap-4 font-serif text-lg text-olive-deep">
                  <span className="font-sans text-xs tracking-[0.15em] text-forest">0{index + 1}</span>
                  <span className="flex-1">{f.question}</span>
                  <CircleHelp className="mt-0.5 size-4 shrink-0 text-olive-light" />
                </dt>
                <dd className="mt-3 pl-9 text-sm leading-relaxed text-ink/65">{f.answer}</dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      {/* ── Final invitation (dark) ──────────────────────────── */}
      <section className="relative overflow-hidden bg-olive-deep px-6 py-28 text-center text-sand md:py-36">
        <FlowerMark className="pointer-events-none absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 text-sand/[0.05]" />
        <Reveal className="relative">
          <div className="mx-auto flex w-fit items-center gap-3 text-[0.66rem] uppercase tracking-[0.24em] text-sand/55">
            <span aria-hidden="true" className="h-px w-8 bg-mint" /> A quiet beginning{' '}
            <span aria-hidden="true" className="h-px w-8 bg-mint" />
          </div>
          <h2 className="mx-auto mt-8 max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.03em] text-sand sm:text-5xl md:text-6xl">
            พร้อมเริ่มดูแลผิว
            <br />
            <span className="text-mint-glow">ในจังหวะของคุณหรือยัง?</span>
          </h2>
          <a
            href={site.lineUrl}
            target="_blank"
            rel="noopener"
            className="mt-10 inline-flex items-center gap-2 bg-mint px-9 py-4 text-[0.7rem] uppercase tracking-[0.18em] text-white transition-colors duration-200 hover:bg-mint/90 active:scale-[0.98]"
          >
            จองคิวผ่าน LINE <ArrowUpRight className="size-4" />
          </a>
        </Reveal>
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
