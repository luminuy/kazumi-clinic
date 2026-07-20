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
import { posterKeyByDefaultId } from '@/lib/site-images';
import { siteSocialImage } from '@/lib/metadata-images';
import { promotionPosters } from '@/lib/promotions';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';

const homeTitle = 'คลินิกความงามสุขุมวิท กรุงเทพฯ | Kazumi Clinic';
const homeDescription =
  'Kazumi Clinic คลินิกความงามย่านสุขุมวิท กรุงเทพฯ ให้บริการฟิลเลอร์ โบท็อกซ์ IV Drip วิตามิน สกินบูสเตอร์ และคอลลาเจนบูสเตอร์ โดยแพทย์ประเมินและวางแผนการดูแลเฉพาะบุคคล';

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

// Asymmetric bento spans (12-col grid). Cycles if the category count changes, so the grid stays
// editorial without hardcoding a slug→span map that a data change could silently break.
const bentoSpans = [
  'md:col-span-7',
  'md:col-span-5',
  'md:col-span-5',
  'md:col-span-7',
  'md:col-span-4',
  'md:col-span-4',
  'md:col-span-4',
  'md:col-span-6',
  'md:col-span-6',
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
    })
    .slice(0, 3);

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

      {/* ── Services: editorial bento grid ───────────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 md:px-14 md:py-32 lg:px-20">
        <Reveal className="mb-14 flex flex-wrap items-end justify-between gap-6">
          <div>
            <h2 className="font-serif text-4xl text-olive-deep md:text-5xl">บริการของเรา</h2>
            <p lang="en" className="mt-3 italic text-olive/70">
              {site.taglineTh}
            </p>
          </div>
          <span lang="en" className="hidden text-[0.68rem] uppercase tracking-[0.3em] text-forest md:block">
            Services (01)
          </span>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-12">
          {serviceCategories.map((category, index) => (
            <Reveal
              key={category.slug}
              delay={(index % 3) * 60}
              className={bentoSpans[index % bentoSpans.length]}
            >
              <Link
                href={`/${category.slug}`}
                className={`group flex h-full min-h-[15rem] flex-col justify-between border border-olive/12 p-8 transition-colors duration-300 hover:border-forest/40 md:p-10 ${
                  index % 2 === 0 ? 'bg-cream' : 'bg-olive-deep/[0.045]'
                }`}
              >
                <div>
                  <ServiceIcon slug={category.slug} className="size-7 text-forest" strokeWidth={1.25} />
                  <p
                    lang="en"
                    className="mt-6 text-[0.62rem] uppercase tracking-[0.2em] text-olive/55"
                  >
                    {category.titleEn}
                  </p>
                  <h3 className="mt-2 font-serif text-2xl text-olive-deep md:text-3xl">
                    {category.title}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm leading-[1.8] text-ink/60">
                    {category.shortDescription}
                  </p>
                </div>
                <span className="mt-8 inline-flex items-center gap-2 border-t border-olive/12 pt-5 text-[0.64rem] uppercase tracking-[0.18em] text-forest">
                  ดูรายละเอียด
                  <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Doctor showcase (dark) ───────────────────────────── */}
      <section className="overflow-hidden bg-olive-deep py-20 text-sand md:py-28">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 md:px-14 lg:px-20">
          {/* Lead physician — portrait kept to a tasteful width so it doesn't dominate. */}
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-[20rem_minmax(0,1fr)] md:gap-16">
            <Reveal className="relative mx-auto w-full max-w-[20rem]">
              <div className="relative aspect-[4/5] overflow-hidden border border-sand/15 bg-olive">
                <Image
                  src={doctorSrc}
                  alt={`${doctor.name} ${doctor.role}`}
                  fill
                  sizes="(min-width: 768px) 20rem, 80vw"
                  className="object-cover"
                />
              </div>
              <div
                aria-hidden="true"
                className="absolute -bottom-5 -right-5 hidden bg-mint px-6 py-4 md:block"
              >
                <p lang="en" className="font-serif text-xl italic text-white">
                  Excellence
                </p>
              </div>
            </Reveal>

            <Reveal delay={80}>
              <span
                lang="en"
                className="mb-4 block text-[0.64rem] uppercase tracking-[0.3em] text-sand/55"
              >
                The Lead Physician
              </span>
              <h2 className="font-serif text-3xl text-sand md:text-4xl">{doctor.nameTh}</h2>
              <p lang="en" className="mt-2 font-serif text-base italic text-sand/60">
                {doctor.name}
              </p>
              <p className="mt-3 text-[0.68rem] uppercase tracking-[0.18em] text-mint-glow">
                {doctor.role}
              </p>

              <div className="mt-7 space-y-3.5">
                {doctor.education.slice(0, 2).map((edu) => (
                  <div key={edu.degree} className="border-b border-sand/10 pb-3.5">
                    <p lang="en" className="text-[0.6rem] uppercase tracking-[0.16em] text-sand/45">
                      {edu.degree}
                    </p>
                    <p className="mt-1 text-sm text-sand/80">{edu.institution}</p>
                  </div>
                ))}
              </div>

              <div className="mt-7 border border-sand/12 p-6">
                <p lang="en" className="text-[0.64rem] uppercase tracking-[0.18em] text-mint-glow">
                  Clinical Focus
                </p>
                <ul lang="en" className="mt-4 grid grid-cols-2 gap-x-5 gap-y-2 text-xs text-sand/75">
                  {doctor.expertise.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span aria-hidden="true" className="mt-1.5 size-1 shrink-0 bg-mint" />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          {/* Secondary physician — Dr. Eesha, compact: small portrait + name, then credentials. */}
          <div className="mt-14 border-t border-sand/10 pt-14 md:mt-16 md:pt-16">
            <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-2 md:gap-16">
              <Reveal className="flex items-center gap-5">
                <div className="relative aspect-[4/5] w-24 shrink-0 overflow-hidden border border-sand/15 bg-olive sm:w-28">
                  {eeshaSrc ? (
                    <Image
                      src={eeshaSrc}
                      alt={`${doctorEesha.name} ${doctorEesha.role}`}
                      fill
                      sizes="7rem"
                      className="object-cover"
                    />
                  ) : (
                    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                      <Sparkles className="size-7 text-sand/25" strokeWidth={1} />
                    </span>
                  )}
                </div>
                <div>
                  <span
                    lang="en"
                    className="block text-[0.6rem] uppercase tracking-[0.28em] text-sand/50"
                  >
                    Clinic Physician
                  </span>
                  <h3 className="mt-2 font-serif text-2xl text-sand">{doctorEesha.name}</h3>
                  <p className="mt-1 font-serif text-sm text-sand/55">{doctorEesha.nameTh}</p>
                  <p className="mt-1.5 text-[0.64rem] uppercase tracking-[0.16em] text-mint-glow">
                    {doctorEesha.role}
                  </p>
                </div>
              </Reveal>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Reveal className="border border-sand/12 p-5">
                  <p lang="en" className="text-[0.6rem] uppercase tracking-[0.16em] text-sand/45">
                    Board Certification
                  </p>
                  <p lang="en" className="mt-2.5 text-sm leading-relaxed text-sand/85">
                    American Academy of Anti-Aging / Regenerative Medicine (2024)
                  </p>
                </Reveal>
                <Reveal delay={60} className="border border-sand/12 p-5">
                  <p lang="en" className="text-[0.6rem] uppercase tracking-[0.16em] text-sand/45">
                    Specialization
                  </p>
                  <p lang="en" className="mt-2.5 text-sm leading-relaxed text-sand/85">
                    MBBS · MSc Internal Medicine (Dermatology)
                  </p>
                </Reveal>
              </div>
            </div>
            <p className="mt-6 max-w-2xl text-sm leading-[1.8] text-sand/60">{doctorEesha.summary}</p>
          </div>
        </div>
      </section>

      {/* ── Promotions: staggered editorial grid ─────────────── */}
      <section className="mx-auto max-w-7xl px-6 py-24 sm:px-10 md:px-14 md:py-32 lg:px-20">
        <Reveal className="mb-16 flex flex-wrap items-end justify-between gap-6">
          <h2 className="font-serif text-4xl text-olive-deep md:text-5xl">โปรโมชั่นล่าสุด</h2>
          <Link
            href="/promotions"
            className="text-[0.68rem] uppercase tracking-[0.2em] text-forest transition-colors hover:text-olive-deep"
          >
            View all promotions
          </Link>
        </Reveal>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 md:grid-cols-3">
          {posters.map((poster, index) => (
            <Reveal
              key={poster.src}
              delay={index * 70}
              className={index === 0 ? 'md:translate-y-10' : index === 2 ? 'md:translate-y-20' : ''}
            >
              <Link href="/promotions" className="group block">
                <div className="relative aspect-[4/5] overflow-hidden border border-olive/10 bg-olive-deep/[0.06]">
                  <Image
                    src={poster.src}
                    alt={poster.alt}
                    fill
                    sizes="(min-width: 768px) 30vw, 90vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <p
                  lang="en"
                  className="mt-5 text-[0.66rem] uppercase tracking-[0.16em] text-olive-deep"
                >
                  {poster.label}
                </p>
              </Link>
            </Reveal>
          ))}
        </div>
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
