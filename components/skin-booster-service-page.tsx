import Image from 'next/image';
import Link from 'next/link';
import { BadgeCheck, MessageCircle, Sparkles } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';

/**
 * Our benefits are "Label — Thai description" (e.g. "Revitalizing — กระตุ้น…"). The reference
 * shows only the four labels; splitting keeps the label as the heading and the Thai description
 * beneath it, so the real copy isn't thrown away to match the mockup.
 */
function splitBenefit(benefit: string) {
  const [label, ...rest] = benefit.split(/\s+—\s+/);
  return { label, description: rest.join(' — ') || undefined };
}

function TreatmentCard({ item }: { item: ServiceItem }) {
  return (
    <article className="border border-olive/20 bg-surface-container-lowest p-8 md:p-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-serif text-2xl text-olive-deep md:text-3xl">{item.name}</h3>
          {/* The reference labels this "Premium Bio-Stimulator"; we show the real detail
              ("Product from Italy") the item actually carries. */}
          {item.detail && (
            <p lang="en" className="mt-1 text-[0.66rem] uppercase tracking-[0.18em] text-olive/55">
              {item.detail}
            </p>
          )}
        </div>
        <BadgeCheck aria-hidden="true" className="size-6 shrink-0 text-olive" />
      </div>

      {item.benefits && item.benefits.length > 0 && (
        <div className="mt-8 grid gap-x-6 gap-y-5 sm:grid-cols-2">
          {item.benefits.map((benefit) => {
            const { label, description } = splitBenefit(benefit);
            return (
              <div key={label}>
                <p lang="en" className="text-[0.78rem] font-medium text-olive-deep">
                  {label}
                </p>
                <span aria-hidden="true" className="mt-2 block h-px w-full bg-olive/20" />
                {description && (
                  <p className="mt-2 text-xs leading-[1.7] text-ink/60">{description}</p>
                )}
              </div>
            );
          })}
        </div>
      )}

      <div className="mt-10 flex items-end justify-between gap-4">
        <div>
          <p lang="en" className="text-[0.62rem] uppercase tracking-[0.18em] text-olive/50">
            Price
          </p>
          {/* No price in lib/services.ts for this item; the reference also prints "สอบถามราคา",
              so the two agree — nothing invented. */}
          <p className="mt-1 font-serif text-xl text-olive-deep">
            {item.priceFrom !== undefined
              ? `${item.priceFrom.toLocaleString('th-TH')} บาท / ${item.unit}`
              : 'สอบถามราคา'}
          </p>
        </div>
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          aria-label={`จองคิว ${item.name} ผ่าน LINE`}
          className="bg-olive-deep px-6 py-3 text-[0.66rem] uppercase tracking-[0.18em] text-sand transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
        >
          จองคิว
        </a>
      </div>
    </article>
  );
}

export function SkinBoosterServicePage({
  service,
  heroImage,
  disciplineImage,
}: {
  service: ServiceCategory;
  /** Has a shipped default (hero-skin-booster), but still resolved through the override layer. */
  heroImage?: string;
  disciplineImage?: string;
}) {
  return (
    <div className="bg-sand">
      {/* ── Hero: title, editorial image, then licence + intro ───────────────── */}
      <section className="px-6 pb-24 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20">
        <div className="mx-auto max-w-5xl">
          <nav
            aria-label="เส้นทางหน้า"
            className="mb-12 flex flex-wrap items-center gap-1.5 text-xs text-ink/40"
          >
            <Link href="/" className="transition-colors hover:text-olive-deep">
              หน้าหลัก
            </Link>
            <span aria-hidden="true" className="text-ink/25">
              /
            </span>
            <Link href="/services" className="transition-colors hover:text-olive-deep">
              บริการ
            </Link>
            <span aria-hidden="true" className="text-ink/25">
              /
            </span>
            <span className="text-ink/70">{service.title}</span>
          </nav>

          <h1 className="font-serif text-4xl leading-none text-olive-deep md:text-6xl">
            {service.title}
          </h1>
          <p
            lang="en"
            className="mt-6 max-w-xs border-l border-olive/30 py-1 pl-4 text-base italic text-olive/70"
          >
            Precision &amp; Refinement in Medical Aesthetics.
          </p>

          <div className="relative mt-10 h-80 w-full overflow-hidden border border-olive/10 bg-olive-deep/[0.06] md:h-[31rem]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={service.heroAlt ?? ''}
                aria-hidden={service.heroAlt ? undefined : 'true'}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 64rem, 90vw"
                className="object-cover"
              />
            ) : (
              <span
                aria-hidden="true"
                className="absolute inset-0 flex items-center justify-center"
              >
                <ServiceIcon
                  slug={service.slug}
                  className="size-12 text-olive/25"
                  strokeWidth={0.75}
                />
              </span>
            )}
          </div>

          <div className="mt-8 max-w-xl">
            <p className="text-[0.64rem] uppercase tracking-[0.16em] text-olive/55">
              ใบอนุญาตสถานพยาบาลเลขที่ {site.license}
            </p>
            <p className="mt-3 text-sm leading-[1.9] text-ink/65 md:text-base">
              {service.description}
            </p>
          </div>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="bg-cream px-6 py-24 text-center sm:px-10 md:py-28">
        <Reveal className="mx-auto max-w-xl">
          <Sparkles aria-hidden="true" className="mx-auto size-7 text-olive/50" strokeWidth={0.9} />
          <h2 lang="en" className="mt-6 font-serif text-3xl text-olive-deep md:text-4xl">
            “Precision &amp; Refinement”
          </h2>
          <p className="mt-6 text-sm leading-[1.9] text-ink/65 md:text-base">
            หัวใจหลักของ {site.name} คือความแม่นยำในการรักษาและความประณีตในการวิเคราะห์ปัญหาผิว
            เพราะเราเชื่อว่าทุกรายละเอียดสำคัญต่อผลลัพธ์
          </p>
        </Reveal>
      </section>

      {/* ── Treatment menu ───────────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <h2
              lang="en"
              className="border-b border-olive/15 pb-4 font-serif text-3xl text-olive-deep md:text-4xl"
            >
              Treatment Menu
            </h2>
          </Reveal>
          <div className="mt-12 space-y-8">
            {service.items.map((item, index) => (
              <Reveal key={item.id ?? `${item.name}-${index}`} delay={index * 60}>
                <TreatmentCard item={item} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-8 text-[0.66rem] italic leading-[1.8] text-ink/45">
              *ราคาและความเหมาะสมขึ้นอยู่กับการประเมินของแพทย์ ·
              ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── The Kazumi Discipline band ───────────────────────── */}
      <section className="relative flex min-h-[24rem] items-center justify-center overflow-hidden px-6 py-24 text-center">
        {disciplineImage ? (
          <Image
            src={disciplineImage}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover opacity-20 grayscale"
          />
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-olive-deep/[0.08]" />
        )}
        <Reveal className="relative">
          <h2 lang="en" className="font-serif text-4xl text-olive-deep md:text-5xl">
            The Kazumi Discipline
          </h2>
          <span aria-hidden="true" className="mx-auto mt-6 block h-px w-12 bg-olive/40" />
          <p lang="en" className="mt-6 text-base italic text-olive/70">
            “{site.taglineTh}”
          </p>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-olive-deep px-6 py-24 text-center text-sand sm:px-10 md:py-28">
        <Reveal className="mx-auto max-w-xl">
          <h2 lang="en" className="font-serif text-3xl md:text-4xl">
            Ready for your transformation?
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-[1.9] text-sand/75">
            เริ่มต้นดูแลผิวพรรณของคุณกับทีมแพทย์ {site.name}
          </p>
          <div className="mt-10 flex flex-col items-center gap-4">
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex w-full max-w-xs items-center justify-center gap-3 bg-sand px-8 py-4 text-[0.68rem] uppercase tracking-[0.2em] text-olive-deep transition-colors duration-200 hover:bg-cream active:scale-[0.98]"
            >
              <MessageCircle aria-hidden="true" className="size-4" />
              จองคิวผ่าน LINE
            </a>
            <Link
              href="/services"
              className="border-b border-sand/30 pb-1 text-[0.66rem] uppercase tracking-[0.18em] text-sand/80 transition-colors hover:text-sand"
            >
              ดูบริการทั้งหมด
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
