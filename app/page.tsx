import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight, MapPin, Clock, Phone, CircleHelp } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories, type ServiceCategory } from '@/lib/services';
import { faqSchema } from '@/lib/schema';
import { cloudAssets } from '@/lib/cloud';
import { Button } from '@/components/ui/button';
import { ServiceIcon } from '@/components/service-icon';
import { Reveal } from '@/components/reveal';
import { Marquee } from '@/components/marquee';
import { cn } from '@/lib/utils';

const faqs = [
  {
    question: 'Kazumi Clinic ให้บริการอะไรบ้าง?',
    answer:
      'Kazumi Clinic ให้บริการฟิลเลอร์ โบท็อกซ์ สกินบูสเตอร์ คอลลาเจนบูสเตอร์ และ IV Drip วิตามิน โดยแพทย์ผู้เชี่ยวชาญ',
  },
  {
    question: 'คลินิกเปิดกี่โมงถึงกี่โมง?',
    answer: 'เปิดทุกวัน 9:00–22:00 ยกเว้นวันอาทิตย์เปิด 9:00–17:00',
  },
  {
    question: 'จองคิวได้ที่ไหน?',
    answer: `จองคิวผ่าน LINE Official Account ได้ที่ ${site.lineUrl} หรือโทร ${site.phone}`,
  },
];

// Desktop bento placement — a tall feature for the first photo category, two stacked
// beside it, then a wide pair along the bottom. Order follows serviceCategories.
const gridSpan: Record<string, string> = {
  filler: 'md:col-span-7 md:row-span-2',
  botox: 'md:col-span-5',
  'iv-drip': 'md:col-span-5',
  'skin-booster': 'md:col-span-7',
  'collagen-booster': 'md:col-span-5',
};

export default function HomePage() {
  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema(faqs)) }}
      />

      {/* ── Hero ──────────────────────────────────────────────── */}
      <section className="relative flex min-h-[88vh] flex-col justify-between overflow-hidden bg-olive-deep px-6 pb-10 pt-24 text-sand">
        <Image
          src={cloudAssets.heroHome}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-olive-deep via-olive-deep/85 to-olive-deep/50" />

        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center">
          <div className="flex items-center gap-3 text-xs uppercase tracking-[0.35em] text-sand/60">
            <span className="h-px w-10 bg-clay" />
            สถานเสริมความงาม · สุขุมวิท กรุงเทพฯ
          </div>
          <h1 className="mt-8 max-w-4xl font-serif text-[13vw] leading-[0.92] tracking-tight sm:text-7xl md:text-8xl">
            Where balance
            <br />
            <span className="text-clay">purity</span> becomes
            <br />
            eternal beauty.
          </h1>
          <p className="mt-8 max-w-md text-sm leading-relaxed text-sand/70">
            純粋さは永遠の美へ — {site.taglineTh} ดูแลทุกหัตถการโดยแพทย์ผู้เชี่ยวชาญ
            ในบรรยากาศคลินิกที่สงบและเป็นส่วนตัว
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
              className="rounded-full border-sand/30 bg-transparent text-sand hover:bg-sand/10 hover:text-sand"
            >
              ดูบริการทั้งหมด
            </Button>
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

      {/* ── Services — photo-led bento ───────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <Reveal className="flex items-end justify-between gap-6">
          <div>
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">(01) บริการ</span>
            <h2 className="mt-3 font-serif text-4xl text-olive-deep md:text-5xl">บริการของเรา</h2>
          </div>
          <Link
            href="/services"
            className="hidden items-center gap-1 text-sm text-olive hover:text-olive-deep sm:flex"
          >
            ดูทั้งหมด <ArrowRight className="size-4" />
          </Link>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-5 md:grid-cols-12 md:auto-rows-[13rem]">
          {serviceCategories.map((c, i) => (
            <Reveal
              key={c.slug}
              delay={i * 70}
              className={cn('min-h-[16rem] md:min-h-0', gridSpan[c.slug])}
            >
              {c.heroImage ? (
                <PhotoServiceCard category={c} index={i + 1} />
              ) : (
                <TextServiceCard category={c} index={i + 1} />
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Editorial spread ──────────────────────────────────── */}
      <section className="bg-olive-deep px-6 py-24 text-sand md:py-28">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-2 md:items-center md:gap-16">
          <Reveal className="order-2 md:order-1">
            <span className="text-xs uppercase tracking-[0.3em] text-sand/50">(02) ปรัชญา</span>
            <p className="mt-8 font-serif text-3xl leading-snug md:text-5xl md:leading-[1.15]">
              ความงามที่แท้จริงเกิดจาก
              <span className="text-clay"> ความสมดุลและความบริสุทธิ์</span>
            </p>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-sand/70">
              เราเชื่อในการปรับแต่งอย่างพอดี ให้ผลลัพธ์ที่เป็นธรรมชาติที่สุด
              ดูแลโดยแพทย์ผู้เชี่ยวชาญ ในบรรยากาศคลินิกที่สงบและเป็นส่วนตัว
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

      {/* ── Hours / FAQ ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-6 md:grid-cols-2">
          <Reveal className="rounded-2xl border border-olive/15 bg-cream p-8 md:p-10">
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
              (03) เวลาทำการ &amp; ที่อยู่
            </span>
            <ul className="mt-8 space-y-5 text-sm text-ink/75">
              <li className="flex items-start gap-3">
                <MapPin className="mt-0.5 size-5 shrink-0 text-olive" />
                {site.addressFull}
              </li>
              <li className="flex items-start gap-3">
                <Clock className="mt-0.5 size-5 shrink-0 text-olive" />
                <span>
                  จันทร์–เสาร์ 9:00–22:00
                  <br />
                  อาทิตย์ 9:00–17:00
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="size-5 shrink-0 text-olive" />
                {site.phone}
              </li>
            </ul>
          </Reveal>

          <Reveal delay={80} className="rounded-2xl border border-olive/15 bg-cream p-8 md:p-10">
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
              (04) คำถามที่พบบ่อย
            </span>
            <dl className="mt-8 divide-y divide-olive/15">
              {faqs.map((f) => (
                <div key={f.question} className="py-5 first:pt-0 last:pb-0">
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
      className="group relative block h-full overflow-hidden rounded-2xl"
    >
      <Image
        src={category.heroImage!}
        alt=""
        aria-hidden="true"
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
        </div>
      </div>
    </Link>
  );
}

function TextServiceCard({ category, index }: { category: ServiceCategory; index: number }) {
  return (
    <Link
      href={`/${category.slug}`}
      className="group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl bg-olive-deep p-6 text-sand"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-3 -top-8 select-none font-serif text-[8rem] leading-none text-sand/[0.06]"
      >
        {String(index).padStart(2, '0')}
      </span>
      <ServiceIcon
        slug={category.slug}
        className="relative size-7 text-clay transition-transform group-hover:scale-110"
      />
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
