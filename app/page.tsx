import Link from 'next/link';
import Image from 'next/image';
import {
  ArrowUpRight,
  ArrowRight,
  MapPin,
  Clock,
  Phone,
  CircleHelp,
  GraduationCap,
  MessageCircle,
  Navigation,
  ShieldCheck,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { site } from '@/lib/site';
import { doctor } from '@/lib/doctor';
import { activePromotions } from '@/lib/promotions';
import { serviceCategories, type ServiceCategory } from '@/lib/services';
import { faqSchema } from '@/lib/schema';
import { cloudAssets, heroHomePortrait } from '@/lib/cloud';
import { Button } from '@/components/ui/button';
import { ServiceIcon } from '@/components/service-icon';
import { Reveal } from '@/components/reveal';
import { Marquee } from '@/components/marquee';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: `${site.name} ให้บริการอะไรบ้าง?`,
    answer:
      `${site.name} ให้บริการ${serviceCategories.map((c) => c.title).join(' ')} โดยแพทย์เป็นผู้ประเมินก่อนรับบริการ`,
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

// The first five services are the clinic's signature menu and get the visual bento treatment.
// The newer categories live in an editorial index below so every title stays readable.
const gridSpan: Record<string, string> = {
  filler: 'md:col-span-7 md:row-span-2',
  botox: 'md:col-span-5',
  'iv-drip': 'md:col-span-5',
  'skin-booster': 'md:col-span-7',
  'collagen-booster': 'md:col-span-5',
};

const signatureCategories = serviceCategories.filter((category) => gridSpan[category.slug]);
const additionalCategories = serviceCategories.filter((category) => !gridSpan[category.slug]);
const serviceImagePool = [
  cloudAssets.heroFiller,
  cloudAssets.heroIvDrip1,
  cloudAssets.heroIvDrip2,
  cloudAssets.heroIvDrip3,
  cloudAssets.heroSkinBooster,
];

export const revalidate = 3600;

export default function HomePage() {
  const promos = activePromotions().slice(0, 3);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="hero-section relative isolate overflow-hidden bg-olive-deep text-sand">
        <div className="hero-grid absolute inset-0 opacity-20" aria-hidden="true" />
        <FlowerMark
          className="pointer-events-none absolute -right-40 -top-40 size-[34rem] text-sand/[0.045] md:-right-24 md:-top-52 md:size-[44rem]"
        />
        <div className="relative mx-auto grid max-w-7xl gap-12 px-6 pb-14 pt-12 sm:px-10 md:grid-cols-[minmax(0,1fr)_minmax(20rem,0.78fr)] md:items-end md:gap-16 md:px-12 md:pb-20 md:pt-16 lg:gap-24 lg:px-16">
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
            <div className="hero-image-frame relative aspect-[0.88] overflow-hidden rounded-[2rem] rounded-bl-[5rem] border border-sand/20 bg-olive shadow-2xl shadow-black/25">
              <Image
                src={heroHomePortrait}
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
                <span className="max-w-[12rem] leading-relaxed">แพทย์ประเมินทุกเคส · ดูแลอย่างเป็นส่วนตัว</span>
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

      {/* ── Kinetic tagline band ──────────────────────────────── */}
      <div className="border-y border-olive/15 bg-clay/25 py-4 font-serif text-2xl text-olive-deep md:text-3xl">
        <Marquee
          items={['Minimal Change', 'Maximum Confidence', '純粋さは永遠の美へ', 'Eternal Beauty']}
          durationSec={38}
        />
      </div>

      {/* ── Treatment atlas ──────────────────────────────────── */}
      <section className="relative overflow-hidden border-y border-olive/10 bg-background px-6 py-24 md:py-32">
        <div className="atlas-orbit pointer-events-none absolute -right-44 top-12 size-[34rem] rounded-full border border-clay/20" aria-hidden="true" />
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end lg:gap-20">
            <div>
              <div className="section-eyebrow flex items-center gap-3">
                <span className="h-px w-10 bg-clay" />
                01 / Treatment atlas
              </div>
              <h2 className="mt-7 max-w-lg font-serif text-5xl leading-[0.9] tracking-[-0.04em] text-olive-deep sm:text-6xl md:text-8xl">
                พอดีใน
                <br />
                <span className="text-clay">แบบของคุณ.</span>
              </h2>
            </div>
            <div className="max-w-xl lg:pb-2">
              <p className="text-sm leading-[1.9] text-ink/65 md:text-base">
                ทุกโปรแกรมเริ่มต้นจากการฟังเป้าหมายและประเมินโดยแพทย์
                ก่อนเลือกแนวทางที่เหมาะกับผิวและรูปหน้าของแต่ละคน
              </p>
              <div className="mt-7 flex flex-wrap items-center gap-4">
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-2 rounded-full bg-olive-deep px-5 py-3 text-sm text-sand transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-olive"
                >
                  สำรวจ treatment ทั้งหมด <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <span className="text-xs uppercase tracking-[0.22em] text-olive-light">
                  {serviceCategories.length} โปรแกรม / curated care
                </span>
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[12rem]">
            {signatureCategories.map((category, index) => (
              <Reveal
                key={category.slug}
                delay={index * 70}
                className={cn('min-h-[17rem] md:min-h-0', gridSpan[category.slug])}
              >
                <PhotoServiceCard category={category} index={index + 1} />
              </Reveal>
            ))}
          </div>

          {additionalCategories.length > 0 && (
            <Reveal className="mt-6 overflow-hidden rounded-[1.75rem] border border-olive/12 bg-cream/70">
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-olive/12 px-5 py-4 sm:px-7">
                <div className="flex items-center gap-3">
                  <span className="h-px w-8 bg-clay" />
                  <span className="section-eyebrow">02 / Extended care</span>
                </div>
                <span className="text-xs text-ink/45">โปรแกรมเพิ่มเติม · เลือกตามเป้าหมายของคุณ</span>
              </div>
              <div className="grid gap-px bg-olive/12 sm:grid-cols-2 lg:grid-cols-4">
                {additionalCategories.map((category, index) => (
                  <PhotoServiceCard
                    key={category.slug}
                    category={category}
                    index={signatureCategories.length + index + 1}
                    image={serviceImagePool[(signatureCategories.length + index) % serviceImagePool.length]}
                    compact
                  />
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Doctor dossier ───────────────────────────────────── */}
      <section className="relative overflow-hidden bg-olive-deep px-6 py-24 text-sand md:py-32">
        <div className="absolute inset-0 opacity-20 [background-image:linear-gradient(rgb(238_233_223/.12)_1px,transparent_1px),linear-gradient(90deg,rgb(238_233_223/.12)_1px,transparent_1px)] [background-size:5rem_5rem]" aria-hidden="true" />
        <div className="relative mx-auto grid max-w-7xl gap-14 md:grid-cols-[0.82fr_1.18fr] md:items-center md:gap-20">
          <Reveal className="relative mx-auto w-full max-w-[27rem]">
            <div className="doctor-frame relative aspect-[0.82] overflow-hidden rounded-[2rem] rounded-tr-[5rem] border border-sand/20 bg-olive shadow-2xl shadow-black/20">
              <Image
                src={doctor.image}
                alt={`${doctor.name} ${doctor.role}`}
                fill
                unoptimized
                sizes="(min-width: 768px) 35vw, 90vw"
                className="object-cover transition-transform duration-1000 hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/80 via-transparent to-transparent" />
              <div className="absolute inset-x-5 bottom-5">
                <p className="font-serif text-2xl text-sand">{doctor.name}</p>
                <p className="mt-1 text-xs text-sand/60">{doctor.role}</p>
                <p className="mt-2 text-[0.68rem] tracking-wide text-sand/45">MEDICAL LICENSE {site.doctors[0].licenseNo}</p>
              </div>
            </div>
            <span className="absolute -bottom-6 -right-4 font-serif text-8xl leading-none text-clay/30">02</span>
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
            <p className="mt-7 max-w-xl text-sm leading-[1.9] text-sand/65 md:text-base">{doctor.summary}</p>

            <div className="mt-10 grid gap-3 sm:grid-cols-3">
              {[
                { icon: Stethoscope, title: 'ประเมินก่อนทำ', text: 'พูดคุยเป้าหมายและประวัติสุขภาพ' },
                { icon: Sparkles, title: 'วางแผนเฉพาะบุคคล', text: 'เลือกแนวทางให้เหมาะกับแต่ละคน' },
                { icon: ShieldCheck, title: 'แนะนำการดูแล', text: 'เตรียมตัวและติดตามหลังหัตถการ' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-sand/15 bg-sand/[0.06] p-4 transition-colors hover:border-clay/60 hover:bg-sand/[0.1]">
                  <Icon className="size-5 text-clay" />
                  <p className="mt-4 text-sm font-medium text-sand">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-sand/50">{text}</p>
                </div>
              ))}
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Button render={<Link href="/about" />} variant="outline" className="rounded-full border-sand/30 bg-transparent text-sand hover:border-sand/60 hover:bg-sand/10">
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
        <div className="relative mx-auto grid max-w-7xl gap-12 md:grid-cols-[1fr_0.82fr] md:items-center md:gap-24">
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
              <span className="flex size-10 items-center justify-center rounded-full border border-olive/20 font-serif text-sm text-olive">03</span>
              <p className="font-serif text-sm italic text-olive/55">純粋さは永遠の美へ</p>
            </div>
          </Reveal>
          <Reveal delay={100} className="relative order-1 mx-auto w-full max-w-[25rem] md:order-2">
            <div className="relative aspect-[0.8] overflow-hidden rounded-[2rem] rounded-bl-[5rem] border border-olive/15 bg-olive-deep shadow-2xl shadow-olive-deep/15">
              <Image src={cloudAssets.heroIvDrip2} alt="" aria-hidden="true" fill sizes="(min-width: 768px) 34vw, 90vw" className="object-cover transition-transform duration-1000 hover:scale-[1.04]" />
              <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/60 via-transparent to-transparent" />
              <span className="absolute bottom-5 left-5 text-[0.68rem] uppercase tracking-[0.25em] text-sand/65">Quiet care / 2026</span>
            </div>
            <span className="absolute -right-3 -top-4 rounded-full border border-olive/15 bg-background px-4 py-2 text-[0.65rem] uppercase tracking-[0.22em] text-olive-light shadow-sm">Less, but better</span>
          </Reveal>
        </div>
      </section>

      {/* ── Promotions / availability board ─────────────────── */}
      <section className="relative overflow-hidden bg-background px-6 py-24 md:py-32">
        <div className="relative mx-auto max-w-7xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-7">
            <div>
              <div className="section-eyebrow flex items-center gap-3">
                <span className="h-px w-10 bg-clay" />
                04 / Availability
              </div>
              <h2 className="mt-6 font-serif text-5xl leading-none tracking-[-0.04em] text-olive-deep sm:text-6xl">โปรโมชั่นล่าสุด</h2>
            </div>
            <Link href="/promotions" className="group inline-flex items-center gap-2 text-sm text-olive transition-colors hover:text-olive-deep">
              ดูหน้ารวมโปรโมชั่น <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Reveal>

          {promos.length > 0 ? (
            <div className="mt-14 grid gap-4 md:grid-cols-3">
              {promos.map((promo, index) => (
                <Reveal key={`${promo.name}-${promo.detail ?? ''}`} delay={index * 60} className="group relative overflow-hidden rounded-[1.75rem] border border-olive/12 bg-cream p-7 transition-[transform,box-shadow] hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(38_40_31/0.1)]">
                  <span className="absolute -right-3 -top-8 font-serif text-[8rem] leading-none text-clay/20">0{index + 1}</span>
                  <p className="relative text-xs uppercase tracking-[0.22em] text-olive-light">ราคาโปรโมชั่น</p>
                  <h3 className="relative mt-8 font-serif text-2xl text-olive-deep">{promo.name}</h3>
                  {promo.detail && <p className="relative mt-1 text-sm text-ink/55">{promo.detail}</p>}
                  <p className="relative mt-8 text-3xl font-medium text-olive">{promo.price.toLocaleString('th-TH')} <span className="text-sm">บาท</span></p>
                  <p className="relative mt-2 text-xs text-ink/45">ใช้ได้ถึง {new Date(promo.validUntil).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </Reveal>
              ))}
            </div>
          ) : (
            <Reveal className="promo-board mt-14 grid overflow-hidden rounded-[2rem] border border-olive/15 bg-olive-deep text-sand md:grid-cols-[1.2fr_0.8fr]">
              <div className="relative p-8 sm:p-12 md:p-16">
                <span className="text-xs uppercase tracking-[0.28em] text-sand/45">No active promotion / now</span>
                <h3 className="mt-8 max-w-xl font-serif text-4xl leading-[1.08] text-sand sm:text-5xl">จังหวะใหม่ของคุณ<br /><span className="text-clay">เริ่มจากการพูดคุย.</span></h3>
                <p className="mt-6 max-w-md text-sm leading-relaxed text-sand/60">ขณะนี้ยังไม่มีโปรโมชั่นที่อยู่ในช่วงเวลาใช้งาน สอบถามโปรแกรมล่าสุดกับทีม Kazumi ได้ทาง LINE</p>
                <Button render={<a href={site.lineUrl} target="_blank" rel="noopener" />} className="mt-8 rounded-full bg-line px-6 text-white hover:bg-line/90"><MessageCircle className="size-4" /> สอบถามผ่าน LINE</Button>
              </div>
              <div className="relative min-h-[17rem] overflow-hidden border-t border-sand/15 bg-olive md:border-l md:border-t-0">
                <FlowerMark className="absolute left-1/2 top-1/2 size-[23rem] -translate-x-1/2 -translate-y-1/2 text-sand/[0.07]" />
                <span className="absolute bottom-8 left-8 text-[0.68rem] uppercase tracking-[0.24em] text-sand/45">KAZUMI / OPEN DIALOGUE</span>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Visit dossier / FAQ ──────────────────────────────── */}
      <section className="border-t border-olive/10 bg-cream px-6 py-24 md:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal className="flex flex-wrap items-end justify-between gap-7">
            <div>
              <div className="section-eyebrow flex items-center gap-3">
                <span className="h-px w-10 bg-clay" />
                05 / Visit dossier
              </div>
              <h2 className="mt-6 font-serif text-5xl leading-none tracking-[-0.04em] text-olive-deep sm:text-6xl">มาเยี่ยมเรา</h2>
            </div>
            <p className="max-w-sm text-sm leading-relaxed text-ink/60">พื้นที่สงบสำหรับการพูดคุย ประเมิน และวางแผนการดูแลในแบบที่เป็นคุณ</p>
          </Reveal>

          <div className="visit-dossier mt-14 grid overflow-hidden rounded-[2rem] border border-olive/15 bg-background md:grid-cols-[0.68fr_1.32fr]">
            <Reveal className="relative p-8 sm:p-10 md:p-12">
              <span className="font-serif text-6xl text-clay/45">05</span>
              <ul className="mt-8 space-y-6 text-sm text-ink/75">
                <li className="flex items-start gap-3"><MapPin className="mt-0.5 size-5 shrink-0 text-olive" /><a href={site.mapsUrl} target="_blank" rel="noopener" className="leading-relaxed hover:text-olive">{site.addressFull}</a></li>
                <li className="flex items-start gap-3"><Clock className="mt-0.5 size-5 shrink-0 text-olive" /><span>{site.hoursDisplay.weekdays}<br />{site.hoursDisplay.sunday}</span></li>
                <li className="flex items-center gap-3"><Phone className="size-5 shrink-0 text-olive" /><a href={site.phoneUrl} className="hover:text-olive">{site.phone}</a></li>
              </ul>
              <Button render={<a href={site.mapsUrl} target="_blank" rel="noopener" />} variant="outline" className="mt-9 rounded-full border-olive/25 text-olive-deep hover:bg-olive/5"><Navigation className="size-4" /> เปิด Google Maps</Button>
            </Reveal>
            <Reveal delay={80} className="min-h-[23rem] overflow-hidden border-t border-olive/15 md:border-l md:border-t-0">
              <iframe src={site.mapsEmbedUrl} width="100%" height="100%" className="min-h-[23rem] grayscale-[0.25]" style={{ border: 0 }} loading="lazy" referrerPolicy="strict-origin-when-cross-origin" allowFullScreen title={`แผนที่ ${site.name}`} />
            </Reveal>
          </div>

          <Reveal className="mt-20">
            <div className="flex items-center gap-3 section-eyebrow"><span className="h-px w-10 bg-clay" /> 06 / Frequently asked</div>
            <dl className="mt-8 grid gap-3 md:grid-cols-2">
              {faqs.map((f, index) => (
                <div key={f.question} className="group rounded-2xl border border-olive/12 bg-background p-6 transition-[background-color,transform] hover:-translate-y-0.5 hover:bg-sand/60">
                  <dt className="flex items-start gap-4 font-serif text-lg text-olive-deep"><span className="font-sans text-xs tracking-[0.15em] text-clay">0{index + 1}</span><span className="flex-1">{f.question}</span><CircleHelp className="mt-0.5 size-4 shrink-0 text-olive-light" /></dt>
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
          <div className="section-eyebrow section-eyebrow--dark mx-auto flex w-fit items-center gap-3"><span className="h-px w-8 bg-clay" /> A quiet beginning <span className="h-px w-8 bg-clay" /></div>
          <h2 className="mx-auto mt-8 max-w-3xl font-serif text-4xl leading-[1.05] tracking-[-0.04em] text-sand sm:text-5xl md:text-7xl">พร้อมเริ่มดูแลผิว<br /><span className="text-clay">ในจังหวะของคุณหรือยัง?</span></h2>
          <Button render={<a href={site.lineUrl} target="_blank" rel="noopener" />} size="lg" className="mt-10 rounded-full bg-line px-9 text-white shadow-xl shadow-black/20 transition-transform hover:-translate-y-1 hover:bg-line/90">จองคิวผ่าน LINE <ArrowUpRight className="size-4" /></Button>
        </Reveal>
      </section>
    </>
  );
}

function PhotoServiceCard({
  category,
  index,
  image,
  compact = false,
}: {
  category: ServiceCategory;
  index: number;
  image?: string;
  compact?: boolean;
}) {
  const imageSrc = image ?? category.heroImage;
  const hasSemanticImage = !image && Boolean(category.heroAlt);

  return (
    <Link
      href={`/${category.slug}`}
      className={cn(
        'group relative block h-full min-h-0 overflow-hidden bg-olive-deep shadow-[0_18px_50px_rgb(38_40_31/0.08)] transition-[transform,box-shadow] duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_24px_60px_rgb(38_40_31/0.14)] active:scale-[0.99]',
        compact ? 'min-h-[14rem] rounded-none shadow-none hover:translate-y-0 hover:shadow-none' : 'rounded-[1.5rem]',
      )}
    >
      {imageSrc ? (
        <Image
          src={imageSrc}
          alt={hasSemanticImage ? category.heroAlt! : ''}
          aria-hidden={hasSemanticImage ? undefined : 'true'}
          fill
          sizes="(min-width: 768px) 50vw, 100vw"
          className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
        />
      ) : null}
      <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/90 via-olive-deep/10 to-transparent transition-colors group-hover:from-olive-deep/95" />
      <div className={cn('relative flex h-full flex-col justify-between p-6', compact && 'p-5')}>
        <span className="font-serif text-sm text-sand/60">{String(index).padStart(2, '0')}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">{category.titleEn}</p>
          <p className={cn('mt-1 flex items-center gap-2 font-serif text-2xl text-sand', !compact && 'md:text-3xl')}>
            {category.title}
            <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
          </p>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-sand/65">
            {category.shortDescription}
          </p>
        </div>
      </div>
    </Link>
  );
}

function TextServiceCard({ category, index }: { category: ServiceCategory; index: number }) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] bg-olive-deep p-7 text-sand shadow-[0_18px_50px_rgb(38_40_31/0.08)] transition-[transform,background-color,box-shadow] duration-500 hover:-translate-y-1 hover:bg-olive hover:shadow-[0_24px_60px_rgb(38_40_31/0.14)]"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-8 select-none font-serif text-[8rem] leading-none text-sand/[0.06]"
      >
        {String(index).padStart(2, '0')}
      </span>
      <span className="relative flex size-11 items-center justify-center rounded-full border border-clay/30 text-clay transition-colors group-hover:border-clay group-hover:bg-clay group-hover:text-olive-deep">
        <ServiceIcon slug={category.slug} className="size-5 transition-transform group-hover:scale-110" />
      </span>
      <div className="relative">
        <p className="text-xs uppercase tracking-[0.25em] text-sand/50">{category.titleEn}</p>
        <p className="mt-1 flex items-center gap-2 font-serif text-2xl text-sand">
          {category.title}
          <ArrowUpRight className="size-5 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </p>
        <p className="mt-2 text-sm text-sand/60">{category.shortDescription}</p>
      </div>
    </Link>
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
