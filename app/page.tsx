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
      <section className="bg-cream">
        <div className="mx-auto grid max-w-6xl items-center gap-12 px-6 py-16 md:grid-cols-[1fr_0.85fr] md:gap-14 md:py-24">
          <div>
            <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-olive-light">
              <span className="h-px w-10 bg-clay" />
              สถานเสริมความงาม · สุขุมวิท กรุงเทพฯ
            </div>
            <h1 className="mt-8">
              <span
                lang="en"
                className="block font-serif text-[13vw] leading-[0.95] tracking-tight text-olive-deep sm:text-6xl md:text-[3.75rem] lg:text-7xl"
              >
                Where balance
                <br />
                <span className="text-clay">purity</span> becomes
                <br />
                eternal beauty.
              </span>
              <span className="mt-7 block max-w-md text-sm font-normal leading-relaxed text-ink/70">
                {site.description}
              </span>
            </h1>
            <p className="mt-5 font-serif text-sm italic tracking-wide text-olive-light">
              <span lang="ja">{site.taglineJa}</span> — <span lang="en">{site.taglineTh}</span>
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-4">
              <Button
                render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
                size="lg"
                className="rounded-full bg-line px-8 text-white hover:bg-line/90"
              >
                จองคิวผ่าน LINE
                <ArrowUpRight className="size-4" />
              </Button>
              <Button
                render={<Link href="/services" />}
                variant="outline"
                size="lg"
                className="rounded-full border-olive/25 bg-transparent text-olive-deep hover:bg-olive/5"
              >
                ดูบริการทั้งหมด
              </Button>
            </div>
          </div>

          <div className="relative aspect-square overflow-hidden rounded-[2rem]">
            <Image
              src={heroHomePortrait}
              alt=""
              aria-hidden="true"
              fill
              priority
              fetchPriority="high"
              sizes="(min-width: 768px) 45vw, 90vw"
              className="object-cover"
            />
          </div>
        </div>
      </section>

      {/* ── Kinetic tagline band ──────────────────────────────── */}
      <div className="border-y border-olive/15 bg-clay/25 py-4 font-serif text-2xl text-olive-deep md:text-3xl">
        <Marquee
          items={['Minimal Change', 'Maximum Confidence', '純粋さは永遠の美へ', 'Eternal Beauty']}
          durationSec={38}
        />
      </div>

      {/* ── Services — signature bento + editorial index ─────── */}
      <section className="relative overflow-hidden border-y border-olive/10 bg-cream">
        <FlowerMark className="pointer-events-none absolute -right-48 top-20 hidden size-[38rem] text-olive/[0.035] lg:block" />
        <div className="relative mx-auto max-w-6xl px-6 py-24 md:py-32">
          <Reveal className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-end lg:gap-16">
            <div>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-olive-light">
                <span className="h-px w-10 bg-clay" />
                01 / Treatment menu
              </div>
              <h2 className="mt-6 font-serif text-5xl leading-[0.92] tracking-tight text-olive-deep sm:text-6xl md:text-7xl">
                บริการ
                <br />
                <span className="text-clay">ของเรา.</span>
              </h2>
            </div>
            <div className="flex max-w-xl flex-col items-start gap-6 lg:pb-1">
              <p className="text-sm leading-relaxed text-ink/65 md:text-base">
                โปรแกรมดูแลความงามที่ออกแบบให้เหมาะกับเป้าหมายและสภาพผิวของแต่ละคน
                เริ่มต้นด้วยการประเมินโดยแพทย์ ก่อนเลือกแนวทางที่พอดีและเป็นธรรมชาติ
              </p>
              <div className="flex flex-wrap items-center gap-4">
                <Link
                  href="/services"
                  className="group inline-flex items-center gap-2 rounded-full bg-olive-deep px-5 py-3 text-sm text-sand transition-colors hover:bg-olive"
                >
                  ดูบริการทั้งหมด <ArrowUpRight className="size-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </Link>
                <span className="text-xs uppercase tracking-[0.2em] text-olive-light">
                  {serviceCategories.length} โปรแกรมดูแล
                </span>
              </div>
            </div>
          </Reveal>

          <div className="mt-16 grid grid-cols-1 gap-4 md:grid-cols-12 md:auto-rows-[11rem]">
            {signatureCategories.map((category, index) => (
              <Reveal
                key={category.slug}
                delay={index * 70}
                className={cn('min-h-[17rem] md:min-h-0', gridSpan[category.slug])}
              >
                {category.heroImage ? (
                  <PhotoServiceCard category={category} index={index + 1} />
                ) : (
                  <TextServiceCard category={category} index={index + 1} />
                )}
              </Reveal>
            ))}
          </div>

          {additionalCategories.length > 0 && (
            <Reveal className="mt-20 grid gap-8 border-t border-olive/15 pt-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
              <div>
                <div className="flex items-center gap-3 text-xs uppercase tracking-[0.3em] text-olive-light">
                  <span className="h-px w-8 bg-clay" />
                  02 / More care
                </div>
                <h3 className="mt-5 font-serif text-3xl leading-tight text-olive-deep md:text-4xl">
                  ดูแลเพิ่มเติม
                </h3>
                <p className="mt-4 max-w-xs text-sm leading-relaxed text-ink/60">
                  ทางเลือกสำหรับการดูแลผิวและรูปหน้าในรายละเอียดที่มากขึ้น
                </p>
              </div>

              <div className="grid gap-x-8 sm:grid-cols-2">
                {additionalCategories.map((category, index) => (
                  <Link
                    key={category.slug}
                    href={`/${category.slug}`}
                    className="group flex min-h-[9.5rem] items-start gap-4 border-b border-olive/15 py-5 transition-colors first:border-t first:border-olive/15"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full border border-olive/15 text-olive transition-colors group-hover:border-clay group-hover:bg-clay">
                      <ServiceIcon slug={category.slug} className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-start justify-between gap-2 text-[0.65rem] uppercase tracking-[0.2em] text-olive-light">
                        {String(signatureCategories.length + index + 1).padStart(2, '0')} · {category.titleEn}
                        <ArrowUpRight className="size-4 shrink-0 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                      </span>
                      <span className="mt-2 block font-serif text-xl leading-tight text-olive-deep">
                        {category.title}
                      </span>
                      <span className="mt-2 block text-xs leading-relaxed text-ink/55">
                        {category.shortDescription}
                      </span>
                    </span>
                  </Link>
                ))}
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {/* ── Doctor / trust ───────────────────────────────────── */}
      <section className="border-y border-olive/10 bg-cream px-6 py-24">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-16">
          <Reveal className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sage-pale">
            <Image
              src={doctor.image}
              alt={`${doctor.name} ${doctor.role}`}
              fill
              unoptimized
              sizes="(min-width: 768px) 38vw, 90vw"
              className="object-cover"
            />
            <div className="absolute inset-x-4 bottom-4 rounded-2xl bg-cream/90 p-4 backdrop-blur">
              <p className="font-serif text-xl text-olive-deep">{doctor.name}</p>
              <p className="mt-0.5 text-xs text-ink/55">{doctor.role}</p>
              <p className="mt-1 text-[0.68rem] text-ink/45">
                ใบประกอบวิชาชีพเวชกรรมเลขที่ {site.doctors[0].licenseNo}
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
              (02) ดูแลโดยแพทย์
            </span>
            <h2 className="mt-4 max-w-xl font-serif text-4xl leading-tight text-olive-deep md:text-5xl">
              ทุกแผนการดูแลเริ่มจากการประเมินเป็นรายบุคคล
            </h2>
            <p className="mt-6 max-w-xl leading-relaxed text-ink/70">{doctor.summary}</p>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {[
                {
                  icon: Stethoscope,
                  title: 'ประเมินก่อนทำ',
                  text: 'พูดคุยเป้าหมายและประวัติสุขภาพ',
                },
                { icon: Sparkles, title: 'วางแผนเฉพาะบุคคล', text: 'เลือกแนวทางให้เหมาะกับแต่ละคน' },
                { icon: ShieldCheck, title: 'แนะนำการดูแล', text: 'เตรียมตัวและติดตามหลังหัตถการ' },
              ].map(({ icon: Icon, title, text }) => (
                <div key={title} className="rounded-2xl border border-olive/12 bg-background p-4">
                  <Icon className="size-5 text-olive" />
                  <p className="mt-3 text-sm font-medium text-olive-deep">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-ink/55">{text}</p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap items-center gap-4">
              <Button
                render={<Link href="/about" />}
                variant="outline"
                className="rounded-full border-olive/25 bg-transparent text-olive-deep hover:bg-olive/5"
              >
                <GraduationCap className="size-4" />
                ดูประวัติและวุฒิการศึกษา
              </Button>
              <p className="text-xs text-ink/45">ผลลัพธ์ขึ้นอยู่กับการประเมินและแต่ละบุคคล</p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Editorial spread ──────────────────────────────────── */}
      <section className="bg-olive-deep px-6 py-24 text-sand md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <Reveal className="order-2 md:order-1">
            <span className="text-xs uppercase tracking-[0.3em] text-sand/50">(03) ปรัชญา</span>
            <p className="mt-8 font-serif text-3xl leading-snug md:text-5xl md:leading-[1.15]">
              ความงามที่แท้จริงเกิดจาก
              <span className="text-clay"> ความสมดุลและความบริสุทธิ์</span>
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-sand/70">
              เราเชื่อในการปรับแต่งอย่างพอดี โดยแพทย์เป็นผู้ประเมินและวางแผนการดูแล
              ในบรรยากาศคลินิกที่สงบและเป็นส่วนตัว
            </p>
            <p className="mt-8 font-serif italic text-sand/40">純粋さは永遠の美へ</p>
          </Reveal>
          <Reveal
            delay={100}
            className="relative order-1 aspect-[4/5] overflow-hidden rounded-2xl md:order-2 md:aspect-[3/4]"
          >
            <Image
              src={cloudAssets.heroIvDrip2}
              alt=""
              aria-hidden="true"
              fill
              sizes="(min-width: 768px) 40vw, 90vw"
              className="object-cover"
            />
          </Reveal>
        </div>
      </section>

      {/* ── Promotions — date-gated ───────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
              (04) โปรโมชั่น
            </span>
            <h2 className="mt-3 font-serif text-4xl text-olive-deep md:text-5xl">
              โปรโมชั่นล่าสุด
            </h2>
          </div>
          <Link
            href="/promotions"
            className="flex items-center gap-1 text-sm text-olive hover:text-olive-deep"
          >
            ดูหน้ารวมโปรโมชั่น <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        {promos.length > 0 ? (
          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {promos.map((promo, index) => (
              <Reveal
                key={`${promo.name}-${promo.detail ?? ''}`}
                delay={index * 60}
                className="rounded-2xl border border-olive/15 bg-cream p-6"
              >
                <p className="text-xs uppercase tracking-[0.2em] text-olive-light">ราคาโปรโมชั่น</p>
                <h3 className="mt-3 font-serif text-2xl text-olive-deep">{promo.name}</h3>
                {promo.detail && <p className="mt-1 text-sm text-ink/55">{promo.detail}</p>}
                <p className="mt-5 text-2xl font-medium text-olive">
                  {promo.price.toLocaleString('th-TH')} บาท
                </p>
                <p className="mt-2 text-xs text-ink/45">
                  ใช้ได้ถึง{' '}
                  {new Date(promo.validUntil).toLocaleDateString('th-TH', {
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </p>
              </Reveal>
            ))}
          </div>
        ) : (
          <Reveal className="mt-12 flex flex-col items-start justify-between gap-5 rounded-2xl border border-dashed border-olive/25 bg-cream p-8 sm:flex-row sm:items-center">
            <div>
              <p className="font-serif text-2xl text-olive-deep">
                ติดตามโปรแกรมและสิทธิพิเศษรอบใหม่
              </p>
              <p className="mt-2 text-sm text-ink/60">
                ขณะนี้ยังไม่มีโปรโมชั่นที่อยู่ในช่วงเวลาใช้งาน สอบถามข้อมูลล่าสุดได้ทาง LINE
              </p>
            </div>
            <Button
              render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
              className="shrink-0 rounded-full bg-line text-white hover:bg-line/90"
            >
              <MessageCircle className="size-4" />
              สอบถามผ่าน LINE
            </Button>
          </Reveal>
        )}
      </section>

      {/* ── Visit / map / FAQ ──────────────────────────────────── */}
      <section className="border-t border-olive/10 bg-cream px-6 py-24">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
              (05) การเดินทาง
            </span>
            <h2 className="mt-3 font-serif text-4xl text-olive-deep md:text-5xl">มาเยี่ยมเรา</h2>
          </Reveal>

          <div className="mt-12 grid overflow-hidden rounded-[2rem] border border-olive/15 bg-background md:grid-cols-[0.8fr_1.2fr]">
            <Reveal className="p-8 md:p-10">
              <ul className="space-y-5 text-sm text-ink/75">
                <li className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-olive" />
                  <a
                    href={site.mapsUrl}
                    target="_blank"
                    rel="noopener"
                    className="hover:text-olive"
                  >
                    {site.addressFull}
                  </a>
                </li>
                <li className="flex items-start gap-3">
                  <Clock className="mt-0.5 size-5 shrink-0 text-olive" />
                  <span>
                    {site.hoursDisplay.weekdays}
                    <br />
                    {site.hoursDisplay.sunday}
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone className="size-5 shrink-0 text-olive" />
                  <a href={site.phoneUrl} className="hover:text-olive">
                    {site.phone}
                  </a>
                </li>
              </ul>
              <Button
                render={<a href={site.mapsUrl} target="_blank" rel="noopener" />}
                variant="outline"
                className="mt-8 rounded-full border-olive/25 text-olive-deep hover:bg-olive/5"
              >
                <Navigation className="size-4" /> เปิด Google Maps
              </Button>
            </Reveal>
            <Reveal
              delay={80}
              className="min-h-80 overflow-hidden border-t border-olive/15 md:border-l md:border-t-0"
            >
              <iframe
                src={site.mapsEmbedUrl}
                width="100%"
                height="100%"
                className="min-h-80"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={`แผนที่ ${site.name}`}
              />
            </Reveal>
          </div>

          <Reveal className="mt-16">
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
              (06) คำถามที่พบบ่อย
            </span>
            <dl className="mt-6 grid gap-4 md:grid-cols-3">
              {faqs.map((f) => (
                <div
                  key={f.question}
                  className="rounded-2xl border border-olive/15 bg-background p-6"
                >
                  <dt className="flex items-start gap-2 font-serif text-lg text-olive-deep">
                    <CircleHelp className="mt-1 size-4 shrink-0 text-olive-light" />
                    {f.question}
                  </dt>
                  <dd className="mt-2 pl-6 text-sm text-ink/70">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-olive/15 bg-clay/25 px-6 py-24 text-center">
        <FlowerMark className="pointer-events-none absolute left-1/2 top-1/2 size-[42rem] -translate-x-1/2 -translate-y-1/2 text-olive/[0.06]" />
        <Reveal className="relative">
          <h2 className="mx-auto max-w-2xl font-serif text-4xl text-olive-deep md:text-5xl">
            พร้อมเริ่มดูแลผิวของคุณแล้วหรือยัง?
          </h2>
          <Button
            render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
            size="lg"
            className="mt-10 rounded-full bg-line px-10 text-white hover:bg-line/90"
          >
            จองคิวผ่าน LINE
            <ArrowUpRight className="size-4" />
          </Button>
        </Reveal>
      </section>
    </>
  );
}

function PhotoServiceCard({ category, index }: { category: ServiceCategory; index: number }) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group relative block h-full overflow-hidden rounded-[1.5rem]"
    >
      <Image
        src={category.heroImage!}
        alt={category.heroAlt ?? ''}
        aria-hidden={category.heroAlt ? undefined : 'true'}
        fill
        sizes="(min-width: 768px) 50vw, 100vw"
        className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-olive-deep/90 via-olive-deep/10 to-transparent transition-colors group-hover:from-olive-deep/95" />
      <div className="relative flex h-full flex-col justify-between p-6">
        <span className="font-serif text-sm text-sand/60">{String(index).padStart(2, '0')}</span>
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-clay">{category.titleEn}</p>
          <p className="mt-1 flex items-center gap-2 font-serif text-2xl text-sand md:text-3xl">
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
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-[1.5rem] bg-olive-deep p-7 text-sand transition-colors duration-300 hover:bg-olive"
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
