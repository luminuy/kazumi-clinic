import Image from 'next/image';
import { ArrowRight, MapPin, Phone, Sparkles } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';

/**
 * The reference gives every card a one-line description. Our data carries that in two shapes:
 * items with `benefits` put the qualifier in `detail` (White Complex / "Nexus Pharma") and the
 * description in `benefits[0]`; items without put the description straight in `detail`
 * ("เลือกสูตรตามสภาพผิว"). Reading it this way lands the reference's layout — name, optional
 * chip, one line — for all four items without inventing any copy.
 */
function itemCopy(item: ServiceItem) {
  const description = item.benefits?.[0];
  return description
    ? { chip: item.detail, description }
    : { chip: undefined, description: item.detail };
}

function TreatmentCard({ item }: { item: ServiceItem }) {
  const { chip, description } = itemCopy(item);
  return (
    <article className="group flex flex-col justify-between rounded-3xl border border-black/[0.08] bg-[var(--store-card)] p-6 pb-8 shadow-sm transition-colors duration-500 hover:bg-[var(--store-surface)]">
      <div>
        <div className="flex flex-wrap items-center gap-3">
          <h3 className="font-serif text-2xl text-[var(--store-ink)]">{item.name}</h3>
          {chip && (
            <span className="rounded-full bg-black/5 px-3 py-1 text-[0.6rem] uppercase tracking-wide text-[var(--store-ink)]">
              {chip}
            </span>
          )}
        </div>
        {description && <p className="mt-4 text-sm leading-[1.9] text-[var(--store-muted)]">{description}</p>}
      </div>

      <div className="mt-8 flex items-center justify-between gap-4">
        <span className="font-serif text-2xl italic text-[var(--store-ink)]">
          {item.priceFrom !== undefined ? (
            <>
              {item.priceFrom.toLocaleString('th-TH')}
              <span className="ml-1.5 font-sans text-[0.62rem] not-italic tracking-wide text-[var(--store-muted)]">
                บาท / {item.unit}
              </span>
            </>
          ) : (
            'สอบถามราคา'
          )}
        </span>
        {/* The reference labels this "Details", but there is no per-item page to send anyone to.
            It points at LINE — the same place the price says to ask — and says so. */}
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          aria-label={`สอบถามรายละเอียด ${item.name} ผ่าน LINE`}
          className="flex shrink-0 items-center gap-2 text-[0.66rem] uppercase tracking-[0.18em] text-[var(--store-ink)] transition-transform duration-200 group-hover:translate-x-1"
        >
          สอบถาม <ArrowRight aria-hidden="true" className="size-3.5" />
        </a>
      </div>
    </article>
  );
}

export function MesotherapyServicePage({
  service,
  heroImage,
  treatmentImage,
}: {
  service: ServiceCategory;
  /** Undefined until the clinic uploads one — the slot shows a tonal icon panel meanwhile. */
  heroImage?: string;
  treatmentImage?: string;
}) {
  return (
    <div className="overflow-x-hidden bg-[var(--background)]">
      {/* ── Hero: the reference overlaps the copy block onto the image ─────────── */}
      <section className="px-6 pb-24 pt-16 sm:px-10 md:px-14 md:pt-24 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mt-12 md:grid md:grid-cols-12 md:items-end">
            <div className="relative z-10 md:col-span-7">
              <div className="rounded-3xl border border-black/[0.08] bg-[var(--store-surface)] p-8 shadow-md md:mb-[-5rem] md:mr-[-6rem] md:p-14">
                <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
                  Medically Licensed Excellence
                </p>
                <h1 className="mt-5 font-serif text-4xl leading-[1.2] text-[var(--store-ink)] md:text-5xl">
                  {service.title}
                </h1>
                <p className="mt-6 max-w-md text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
                  {service.description}
                </p>
                <p className="mt-8 text-[0.66rem] tracking-wide text-[var(--store-muted)]">
                  ใบอนุญาตเลขที่ {site.license}
                </p>
              </div>
            </div>

            <div className="mt-10 md:col-span-8 md:col-start-5 md:mt-0">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:aspect-[16/10]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={service.heroAlt ?? ''}
                    aria-hidden={service.heroAlt ? undefined : 'true'}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 768px) 66vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <span
                    aria-hidden="true"
                    className="absolute inset-0 flex items-center justify-center"
                  >
                    <ServiceIcon
                      slug={service.slug}
                      className="size-12 text-[var(--store-muted)]"
                      strokeWidth={0.75}
                    />
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <Reveal className="mx-auto max-w-3xl text-center">
          <Sparkles aria-hidden="true" className="mx-auto size-7 text-black/20" strokeWidth={0.9} />
          <h2
            lang="en"
            className="mt-6 font-serif text-3xl italic leading-tight text-[var(--store-ink)] md:text-4xl"
          >
            “{site.taglineTh}”
          </h2>
          <span aria-hidden="true" className="mx-auto mt-8 block h-px w-24 bg-black/10" />
          <p lang="en" className="mt-8 text-[0.62rem] uppercase tracking-[0.4em] text-[var(--store-muted)]">
            The Kazumi Discipline
          </p>
        </Reveal>
      </section>

      {/* ── Treatment menu ───────────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <Reveal>
            <h2 lang="en" className="text-[0.68rem] uppercase tracking-[0.34em] text-[var(--store-muted)]">
              Treatment Menu
            </h2>
          </Reveal>
          <div className="mt-12 grid gap-x-8 gap-y-8 md:grid-cols-2">
            {service.items.map((item, index) => (
              <Reveal key={item.id ?? `${item.name}-${index}`} delay={(index % 2) * 60}>
                <TreatmentCard item={item} />
              </Reveal>
            ))}
          </div>
          <Reveal>
            <p className="mt-12 text-[0.66rem] leading-[1.8] text-[var(--store-muted)]">
              *ราคาและความเหมาะสมของแต่ละสูตรขึ้นอยู่กับการประเมินของแพทย์ ·
              ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── LINE CTA band ────────────────────────────────────── */}
      <section className="px-6 pb-24 sm:px-10 md:px-14 lg:px-20">
        <Reveal className="mx-auto max-w-6xl">
          <div className="flex flex-col items-center rounded-[1.75rem] bg-[var(--store-ink)] px-8 py-16 text-center shadow-xl md:px-20 md:py-24">
            <h2 className="max-w-2xl font-serif text-3xl leading-tight text-[var(--background)] md:text-4xl">
              พร้อมสัมผัสประสบการณ์ความงามในแบบ {site.name} หรือยัง?
            </h2>
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="mt-10 inline-flex items-center gap-2.5 rounded-full bg-[#06C755] px-8 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
            >
              <LineIcon className="size-4" />
              จองคิวผ่าน LINE
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Transformation ───────────────────────────────────── */}
      <section className="px-6 pb-24 sm:px-10 md:px-14 md:pb-32 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-14">
          <Reveal className="order-2 md:order-1">
            <div className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              {treatmentImage ? (
                <Image
                  src={treatmentImage}
                  // Clinic-chosen photo — we can't describe what it shows, and the heading beside
                  // it carries the meaning, so it's decorative.
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-cover"
                />
              ) : (
                <span
                  aria-hidden="true"
                  className="absolute inset-0 flex items-center justify-center"
                >
                  <ServiceIcon
                    slug={service.slug}
                    className="size-10 text-[var(--store-muted)]"
                    strokeWidth={0.75}
                  />
                </span>
              )}
            </div>
          </Reveal>

          <Reveal className="order-1 md:order-2" delay={60}>
            <h2 lang="en" className="font-serif text-3xl text-[var(--store-ink)] md:text-4xl">
              Ready for your transformation?
            </h2>
            <p className="mt-6 text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
              ปรึกษาแพทย์เพื่อประเมินสภาพผิวและวางแผนการดูแลที่เหมาะสมกับคุณ
            </p>
            <div className="mt-10 flex flex-col gap-4">
              <a
                href={site.phoneUrl}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-transparent px-8 py-3.5 text-xs font-medium text-[var(--store-ink)] transition-all duration-200 hover:border-black/[0.08] hover:bg-black/5"
              >
                <Phone aria-hidden="true" className="size-3.5" />
                โทร {site.phone}
              </a>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-[var(--store-surface)] px-8 py-3.5 text-xs font-medium text-[var(--store-ink)] transition-all duration-200 hover:border-black/[0.08] hover:bg-black/5"
              >
                <MapPin aria-hidden="true" className="size-3.5" />
                นำทางไปยัง {site.name}
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
