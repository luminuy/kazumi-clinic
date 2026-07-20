import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  MapPin,
  CircleHelp,
  GraduationCap,
  Navigation,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { site } from '@/lib/site';
import { doctor, doctorEesha } from '@/lib/doctor';
import { serviceCategories } from '@/lib/services';
import { faqSchema, homePageSchema } from '@/lib/schema';
import { cloudAssets, heroHomePortrait } from '@/lib/cloud';
import { getImageOverrides } from '@/lib/site-images-store';
import { categoryImageKey, posterKeyByDefaultId } from '@/lib/site-images';
import { siteSocialImage } from '@/lib/metadata-images';
import { promotionPosters } from '@/lib/promotions';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { ServiceAtlas } from '@/components/service-atlas';
import { PromotionCarousel } from '@/components/promotion-carousel';

const homeTitle = 'คลินิกความงามสุขุมวิท กรุงเทพฯ | Kazumi Clinic';
const homeDescription =
  'Kazumi Clinic คลินิกความงามย่านสุขุมวิท กรุงเทพฯ ให้บริการฟิลเลอร์ โบท็อกซ์ IV Drip วิตามิน สกินบูสเตอร์ และคอลลาเจนบูสเตอร์ โดยแพทย์ประเมินและวางแผนการดูแลเฉพาะบุคคล';

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage(
    'hero-home',
    `${site.name} คลินิกความงามสุขุมวิท`,
  );

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

  // The portrait crop exists only to dodge the logo and quote burnt into the shipped hero
  // asset (see lib/cloud.ts). A hero the clinic uploaded themselves has no such text, so it's
  // rendered whole — applying the old crop box to a different photo would cut it at random.
  const heroSrc = overrides.has('hero-home') ? pick('hero-home', '') : heroHomePortrait;
  const philosophySrc = pick('hero-iv-drip-2', cloudAssets.heroIvDrip2);
  const doctorSrc = pick('doctor-pratch', doctor.image);
  // Both physicians appear in the Medical direction section. Dr. Eesha has no shipped default
  // photo, so her card falls back to a placeholder until the clinic uploads one via /admin.
  const doctorCards = [
    { name: doctor.name, role: doctor.role, licenseNo: doctor.licenseNo, src: doctorSrc },
    {
      name: doctorEesha.name,
      role: doctorEesha.role,
      licenseNo: doctorEesha.licenseNo,
      src: overrides.get('doctor-eesha')?.public_id,
    },
  ];
  // Clinic photo for the "มาเยี่ยมเรา" section; undefined until the clinic uploads one, so the
  // section falls back to a tonal placeholder rather than borrowing an unrelated image.
  const visitPhoto = overrides.get('home-visit')?.public_id;

  // Service cards and promotion posters resolve here, in the server component, so the client
  // components stay free of the override layer and the D1 read happens once per render.
  const heroOverrides: Record<string, string> = {};
  for (const [slug, key] of Object.entries(categoryImageKey)) {
    const override = overrides.get(key)?.public_id;
    if (override) heroOverrides[slug] = override;
  }
  const posters = promotionPosters.map((poster) => {
    const key = posterKeyByDefaultId.get(poster.src);
    const override = key ? overrides.get(key)?.public_id : undefined;
    return override ? { ...poster, src: override } : poster;
  });
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
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(
            homePageSchema(pick('hero-home', cloudAssets.heroHome)),
          ),
        }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero-section relative isolate overflow-hidden bg-olive-deep text-sand">
        <div className="hero-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <FlowerMark className="pointer-events-none absolute -right-40 -top-40 size-[34rem] text-sand/[0.045] md:-right-24 md:-top-52 md:size-[44rem]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-12 sm:px-10 md:grid-cols-[minmax(0,1.618fr)_minmax(20rem,1fr)] md:items-end md:gap-16 md:px-12 md:pb-20 md:pt-16 lg:gap-24 lg:px-16">
          <div className="max-w-3xl pb-2 md:pb-10">
            <div className="hero-enter flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.34em] text-sand/55">
              <span className="h-px w-10 bg-clay" />
              Kazumi Clinic · Sukhumvit, Bangkok
            </div>
            <h1 className="mt-8">
              <span
                lang="en"
                className="hero-enter hero-enter--slow block font-serif text-[16vw] leading-[0.87] tracking-[-0.06em] text-sand sm:text-7xl md:text-[5.4rem] lg:text-[7.1rem]"
              >
                Where balance
                <br />
                <span className="text-clay">purity</span> becomes
                <br />
                <span className="text-sand/90">eternal beauty.</span>
              </span>
            </h1>
            <div className="hero-enter hero-enter--later mt-8 grid max-w-xl gap-6 border-t border-sand/20 pt-5 sm:grid-cols-[1.15fr_0.85fr] sm:gap-10">
              <p className="text-sm leading-relaxed text-sand/70">{site.description}</p>
              <p className="font-serif text-sm italic leading-relaxed text-sand/55">
                <span lang="ja">{site.taglineJa}</span>
                <br />
                <span lang="en">{site.taglineTh}</span>
              </p>
            </div>
            <div className="hero-enter hero-enter--later mt-8 flex flex-wrap items-center gap-4">
              <Button
                render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
                size="lg"
                className="rounded-full bg-line px-8 text-white shadow-lg shadow-black/10 transition-transform duration-300 hover:-translate-y-1 hover:bg-line/90"
              >
                จองคิวผ่าน LINE
                <ArrowUpRight className="size-4" />
              </Button>
              <Button
                render={<Link href="/services" />}
                variant="outline"
                size="lg"
                className="rounded-full border-sand/30 bg-transparent text-sand hover:border-sand/60 hover:bg-sand/10"
              >
                ดูบริการทั้งหมด
              </Button>
            </div>
          </div>

          <div className="hero-enter hero-enter--image relative mx-auto w-full max-w-[31rem] md:mb-0">
            <div className="hero-image-frame relative aspect-[0.72] overflow-hidden rounded-[2rem] rounded-bl-[5rem] border border-sand/20 bg-olive shadow-2xl shadow-black/25 md:aspect-[0.618]">
              <Image
                src={heroSrc}
                alt=""
                aria-hidden="true"
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 38vw, (min-width: 768px) 42vw, 90vw"
                className="object-cover transition-transform duration-1000 ease-out hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/65 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 text-xs text-sand/75">
                <span className="max-w-[12rem] leading-relaxed">
                  แพทย์ประเมินทุกเคส · ดูแลอย่างเป็นส่วนตัว
                </span>
                <span className="font-serif text-3xl text-clay/80">01</span>
              </div>
            </div>
            <div className="hero-caption absolute -bottom-7 -left-3 flex items-center gap-3 rounded-full border border-sand/20 bg-olive-deep/90 px-4 py-2 text-[0.68rem] tracking-[0.18em] text-sand/65 backdrop-blur sm:-left-7">
              <span className="size-2 rounded-full bg-line shadow-[0_0_0_4px_rgba(6,199,85,0.14)]" />
              OPEN TODAY · 09:00—22:00
            </div>
          </div>
        </div>
        <div className="relative mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 border-t border-sand/15 px-6 py-5 text-[0.68rem] uppercase tracking-[0.22em] text-sand/45 sm:px-10 md:px-12 lg:px-16">
          <span>Minimal change. Maximum confidence.</span>
          <span className="hidden sm:inline">Est. 2024 · Medical aesthetics</span>
          <a href={site.phoneUrl} className="text-sand/70 transition-colors hover:text-sand">
            {site.phone}
          </a>
        </div>
      </section>

      {/* ── Treatment atlas ──────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-olive/10 bg-background px-6 py-24 md:py-32">
        <div
          className="atlas-orbit pointer-events-none absolute -right-44 top-12 size-[34rem] rounded-full border border-clay/20"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-7xl">
          <ServiceAtlas heroOverrides={heroOverrides} />
        </div>
      </section>

      {/* ── Doctor dossier ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-olive-deep px-6 py-24 text-sand md:py-32">
        <div
          className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(238_233_223/.12)_1px,transparent_1px),linear-gradient(90deg,rgb(238_233_223/.12)_1px,transparent_1px)] [background-size:5rem_5rem]"
          aria-hidden="true"
        />
        <div className="relative mx-auto grid max-w-7xl gap-14 md:grid-cols-[1fr_1.618fr] md:items-center md:gap-20">
          <Reveal className="relative mx-auto grid w-full max-w-[27rem] grid-cols-2 gap-4 md:max-w-none">
            {doctorCards.map((d, index) => (
              <div
                key={d.name}
                className={`doctor-frame relative aspect-[0.72] overflow-hidden border border-sand/20 bg-olive shadow-2xl shadow-black/20 ${
                  index === 0 ? 'rounded-[1.5rem] rounded-tr-[3.5rem]' : 'rounded-[1.5rem] rounded-bl-[3.5rem]'
                }`}
              >
                {d.src ? (
                  <Image
                    src={d.src}
                    alt={`${d.name} ${d.role}`}
                    fill
                    sizes="(min-width: 768px) 20vw, 45vw"
                    className="object-cover transition-transform duration-1000 hover:scale-[1.03]"
                  />
                ) : (
                  <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
                    <Stethoscope className="size-9 text-sand/25" strokeWidth={1} />
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/85 via-transparent to-transparent" />
                <div className="absolute inset-x-4 bottom-4">
                  <p className="font-serif text-lg leading-tight text-sand">{d.name}</p>
                  <p className="mt-1 text-[0.68rem] text-sand/60">{d.role}</p>
                  <p className="mt-1.5 text-[0.58rem] tracking-wide text-sand/40">
                    MEDICAL LICENSE {d.licenseNo}
                  </p>
                </div>
              </div>
            ))}
          </Reveal>

          <Reveal delay={100}>
            <div className="section-eyebrow section-eyebrow--dark flex items-center gap-3">
              <span className="h-px w-10 bg-clay" />
              02 / Medical direction
            </div>
            <h2 className="mt-7 max-w-2xl font-serif text-4xl leading-[1.05] tracking-[-0.03em] text-sand sm:text-5xl md:text-6xl">
              ทุกแผนการดูแล
              <br />
              เริ่มจากการ <span className="text-clay">ประเมิน</span>
            </h2>
            <p className="mt-7 max-w-xl text-sm leading-[1.9] text-sand/65 md:text-base">
              {doctor.summary}
            </p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Stethoscope,
                  title: 'ประเมินก่อนทำ',
                  text: 'พูดคุยเป้าหมายและประวัติสุขภาพ',
                },
                {
                  icon: Sparkles,
                  title: 'วางแผนเฉพาะบุคคล',
                  text: 'เลือกแนวทางให้เหมาะกับแต่ละคน',
                },
                { icon: ShieldCheck, title: 'แนะนำการดูแล', text: 'เตรียมตัวและติดตามหลังหัตถการ' },
              ].map(({ icon: Icon, title, text }) => (
                <div
                  key={title}
                  className="rounded-2xl border border-sand/15 bg-sand/[0.06] p-4 transition-colors hover:border-clay/60 hover:bg-sand/[0.1]"
                >
                  <Icon className="size-5 text-clay" />
                  <p className="mt-4 text-sm font-medium text-sand">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-sand/50">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button
                render={<Link href="/about" />}
                variant="outline"
                className="rounded-full border-sand/30 bg-transparent text-sand hover:border-sand/60 hover:bg-sand/10"
              >
                <GraduationCap className="size-4" /> ดูประวัติและวุฒิการศึกษา
              </Button>
              <p className="text-xs text-sand/40">ผลลัพธ์ขึ้นอยู่กับการประเมินและแต่ละบุคคล</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Philosophy manifesto ─────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-olive/10 bg-clay/20 px-6 py-24 md:py-32">
        <FlowerMark className="pointer-events-none absolute -bottom-48 -left-32 size-[34rem] text-olive/[0.06]" />
        <div className="relative mx-auto grid max-w-7xl gap-12 md:grid-cols-[1.618fr_1fr] md:items-center md:gap-24">
          <Reveal className="order-2 md:order-1">
            <div className="section-eyebrow flex items-center gap-3">
              <span className="h-px w-10 bg-clay" />
              03 / The philosophy
            </div>
            <p className="mt-8 max-w-2xl font-serif text-4xl leading-[1.08] tracking-[-0.03em] text-olive-deep sm:text-5xl md:text-6xl">
              ความงามที่แท้จริง
              <br />
              เกิดจาก <span className="text-clay">ความสมดุล</span>
            </p>
            <p className="mt-8 max-w-lg text-sm leading-[1.9] text-ink/65">
              เราเชื่อในการปรับแต่งอย่างพอดี โดยแพทย์เป็นผู้ประเมินและวางแผนการดูแล
              ในบรรยากาศคลินิกที่สงบและเป็นส่วนตัว
            </p>
            <div className="mt-9 flex items-center gap-4">
              <span className="flex size-10 items-center justify-center rounded-full border border-olive/20 font-serif text-sm text-olive">
                03
              </span>
              <p className="font-serif text-sm italic text-olive/55">純粋さは永遠の美へ</p>
            </div>
          </Reveal>
          <Reveal delay={100} className="relative order-1 mx-auto w-full max-w-[25rem] md:order-2">
            <div className="relative aspect-[0.72] overflow-hidden rounded-[2rem] rounded-bl-[5rem] border border-olive/15 bg-olive-deep shadow-2xl shadow-olive-deep/15 md:aspect-[0.618]">
              <Image
                src={philosophySrc}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 768px) 34vw, 90vw"
                className="object-cover transition-transform duration-1000 hover:scale-[1.04]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/60 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 text-[0.68rem] uppercase tracking-[0.25em] text-sand/65">
                Quiet care / 2026
              </span>
            </div>
            <span className="absolute -right-3 -top-4 rounded-full border border-olive/15 bg-background px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] text-olive-light shadow-sm">
              Less, but better
            </span>
          </Reveal>
        </div>
      </section>

      {/* ── Promotions / availability board ─────────────────── */}
      <section className="relative overflow-hidden bg-background px-6 py-24 md:py-32">
        <div className="relative mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-wrap items-end justify-between gap-x-7 gap-y-4">
              <div>
                <div className="section-eyebrow flex items-center gap-3">
                  <span className="h-px w-10 bg-clay" />
                  04 / Availability
                </div>
                <h2 className="mt-6 font-serif text-5xl leading-none tracking-[-0.04em] text-olive-deep sm:text-6xl">
                  โปรโมชั่นล่าสุด
                </h2>
              </div>
              <Link
                href="/promotions"
                className="text-[0.68rem] uppercase tracking-[0.2em] text-olive transition-colors hover:text-olive-deep"
              >
                View all promotions
              </Link>
            </div>
            {/* The full-width hairline under the header, as in the reference. */}
            <span aria-hidden="true" className="mt-8 block h-px w-full bg-olive/15" />
          </Reveal>

          <Reveal className="mt-14">
            <PromotionCarousel posters={posters} />
          </Reveal>
        </div>
      </section>

      {/* ── Visit dossier / FAQ ──────────────────────────────── */}
      <section className="border-t border-olive/10 bg-cream px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="section-eyebrow flex items-center gap-3">
              <span className="h-px w-10 bg-clay" />
              05 / Visit dossier
            </div>
            <h2 className="mt-6 font-serif text-5xl leading-none tracking-[-0.04em] text-olive-deep sm:text-6xl">
              มาเยี่ยมเรา
            </h2>
          </Reveal>

          <div className="mt-14 grid items-stretch gap-x-12 gap-y-10 md:grid-cols-[1fr_1.618fr]">
            {/* Left: the address book — Location / Hours / Contact, then the maps link. */}
            <Reveal className="flex flex-col">
              <dl className="space-y-8">
                <div>
                  <dt className="text-[0.62rem] uppercase tracking-[0.2em] text-olive/60">
                    Location
                  </dt>
                  <dd className="mt-2 max-w-xs text-sm leading-relaxed text-ink/75">
                    <a href={site.mapsUrl} target="_blank" rel="noopener" className="hover:text-olive">
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
                    <a href={site.phoneUrl} className="block hover:text-olive">
                      {site.phone}
                    </a>
                    <a
                      href={site.lineUrl}
                      target="_blank"
                      rel="noopener"
                      className="block hover:text-olive"
                    >
                      LINE Official
                    </a>
                  </dd>
                </div>
              </dl>
              <Button
                render={<a href={site.mapsUrl} target="_blank" rel="noopener" />}
                variant="outline"
                className="mt-10 w-fit rounded-none border-olive/30 text-[0.68rem] uppercase tracking-[0.18em] text-olive-deep hover:bg-olive/5"
              >
                <Navigation className="size-4" /> Open Google Maps
              </Button>
            </Reveal>

            {/* Right: a photo of the clinic. Placeholder until the clinic uploads one via /admin. */}
            <Reveal
              delay={80}
              className="relative min-h-[20rem] overflow-hidden border border-olive/12 bg-olive-deep/[0.06] md:min-h-[26rem]"
            >
              {visitPhoto ? (
                <Image
                  src={visitPhoto}
                  alt={`หน้าคลินิก ${site.name}`}
                  fill
                  sizes="(min-width: 768px) 62vw, 88vw"
                  className="object-cover"
                />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center">
                  <MapPin className="size-10 text-olive/25" strokeWidth={0.9} />
                </span>
              )}
            </Reveal>
          </div>

          <Reveal className="mt-20">
            <div className="flex items-center gap-3 section-eyebrow">
              <span className="h-px w-10 bg-clay" /> 06 / Frequently asked
            </div>
            <dl className="mt-8 grid gap-3 md:grid-cols-2">
              {faqs.map((f, index) => (
                <div
                  key={f.question}
                  className="group rounded-2xl border border-olive/12 bg-background p-6 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-sand/60"
                >
                  <dt className="flex items-start gap-4 font-serif text-lg text-olive-deep">
                    <span className="font-sans text-xs tracking-[0.15em] text-clay">
                      0{index + 1}
                    </span>
                    <span className="flex-1">{f.question}</span>
                    <CircleHelp className="mt-0.5 size-4 shrink-0 text-olive-light" />
                  </dt>
                  <dd className="mt-3 pl-9 text-sm leading-relaxed text-ink/65">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── Final invitation ─────────────────────────────────── */}
      <section className="relative overflow-hidden bg-olive-deep px-6 py-28 text-center text-sand md:py-36">
        <FlowerMark className="pointer-events-none absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 text-sand/[0.055]" />
        <Reveal className="relative">
          <div className="section-eyebrow section-eyebrow--dark mx-auto flex w-fit items-center gap-3">
            <span className="h-px w-8 bg-clay" /> A quiet beginning{' '}
            <span className="h-px w-8 bg-clay" />
          </div>
          <h2 className="mx-auto mt-8 max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-sand sm:text-5xl md:text-7xl">
            พร้อมเริ่มดูแลผิว
            <br />
            <span className="text-clay">ในจังหวะของคุณหรือยัง?</span>
          </h2>
          <Button
            render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
            size="lg"
            className="mt-10 rounded-full bg-line px-9 text-white shadow-xl shadow-black/20 transition-transform hover:-translate-y-1 hover:bg-line/90"
          >
            จองคิวผ่าน LINE <ArrowUpRight className="size-4" />
          </Button>
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
