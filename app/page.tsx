import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, ArrowRight, MapPin, Clock, Phone } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { faqSchema } from '@/lib/schema';
import { cloudAssets } from '@/lib/cloud';
import { Button } from '@/components/ui/button';
import { ServiceIcon } from '@/components/service-icon';
import { Reveal } from '@/components/reveal';
import { Marquee } from '@/components/marquee';

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

      {/* ── Services ──────────────────────────────────────────── */}
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

        <div className="mt-14 divide-y divide-olive/15 border-y border-olive/15">
          {serviceCategories.map((c, i) => (
            <Reveal key={c.slug} delay={i * 60}>
              <Link
                href={`/${c.slug}`}
                className="group flex items-center gap-6 py-7 transition-colors hover:bg-cream/60"
              >
                <span className="w-10 font-serif text-sm text-olive-light">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <ServiceIcon
                  slug={c.slug}
                  className="size-6 shrink-0 text-olive transition-transform group-hover:scale-110"
                />
                <div className="min-w-0 flex-1">
                  <p className="font-serif text-2xl text-olive-deep">{c.title}</p>
                  <p className="mt-1 truncate text-sm text-ink/60">{c.shortDescription}</p>
                </div>
                <span className="hidden text-xs uppercase tracking-widest text-olive-light md:block">
                  {c.titleEn}
                </span>
                <ArrowUpRight className="size-6 shrink-0 text-olive-light transition-transform group-hover:-translate-y-1 group-hover:translate-x-1 group-hover:text-olive" />
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── Philosophy strip ──────────────────────────────────── */}
      <section className="bg-olive-deep px-6 py-28 text-sand">
        <div className="mx-auto max-w-5xl">
          <Reveal>
            <span className="text-xs uppercase tracking-[0.3em] text-sand/50">(02) ปรัชญา</span>
            <p className="mt-8 font-serif text-3xl leading-snug md:text-5xl md:leading-[1.15]">
              ความงามที่แท้จริงเกิดจาก
              <span className="text-clay"> ความสมดุลและความบริสุทธิ์</span> —
              เราเชื่อในการปรับแต่งอย่างพอดี ให้ผลลัพธ์ที่เป็นธรรมชาติที่สุด
            </p>
            <p className="mt-8 text-sm text-sand/50">純粋さは永遠の美へ</p>
          </Reveal>
        </div>
      </section>

      {/* ── Hours / FAQ ───────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-6 py-24">
        <div className="grid gap-16 md:grid-cols-2">
          <Reveal>
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

          <Reveal delay={80}>
            <span className="text-xs uppercase tracking-[0.3em] text-olive-light">
              (04) คำถามที่พบบ่อย
            </span>
            <dl className="mt-8 divide-y divide-olive/15 border-t border-olive/15">
              {faqs.map((f) => (
                <div key={f.question} className="py-5">
                  <dt className="font-serif text-lg text-olive-deep">{f.question}</dt>
                  <dd className="mt-2 text-sm text-ink/70">{f.answer}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────── */}
      <section className="border-t border-olive/15 bg-clay/25 px-6 py-24 text-center">
        <Reveal>
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
