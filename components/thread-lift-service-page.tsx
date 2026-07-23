import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, ShieldCheck, Stethoscope } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';

/**
 * "4 เส้น" → { count: '4', unit: 'เส้น' } so the count can be set large with its unit small
 * beside it, the way the reference draws the menu. Anything that isn't "<number> <unit>" is
 * returned whole rather than mangled — the split is presentation, not a data contract.
 */
function splitQuantity(detail: string | undefined) {
  if (!detail) return null;
  const match = /^(\d+)\s+(.+)$/.exec(detail);
  return match ? { count: match[1], unit: match[2] } : { count: detail, unit: '' };
}

function MenuRow({ item, last }: { item: ServiceItem; last: boolean }) {
  const quantity = splitQuantity(item.detail);
  return (
    <div
      className={`flex items-end justify-between gap-6 border-t border-black/[0.08] px-5 py-8 transition-colors duration-200 hover:bg-[var(--store-surface)] ${
        last ? 'border-b' : ''
      }`}
    >
      <div>
        <p lang="en" className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--store-muted)]">
          Quantity
        </p>
        {quantity && (
          <p className="mt-1.5 flex items-baseline gap-1.5">
            <span className="font-serif text-4xl leading-none text-[var(--store-ink)]">
              {quantity.count}
            </span>
            {quantity.unit && (
              <span className="font-serif text-2xl italic text-[var(--store-muted)]">{quantity.unit}</span>
            )}
          </p>
        )}
      </div>

      <div className="text-right">
        <p className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--store-muted)]">ราคา</p>
        {/* The reference prints "Starting from 9,900.-" here. lib/services.ts has no price for
            thread lift, and inventing one for a medical procedure is exactly what §0.2 forbids —
            so the row says what's true until the clinic publishes a figure. */}
        <p className="mt-1.5 font-serif text-2xl text-[var(--store-ink)]">
          {item.priceFrom !== undefined ? (
            <>
              {item.priceFrom.toLocaleString('th-TH')}
              <span className="ml-1.5 font-sans text-[0.62rem] tracking-wide text-[var(--store-muted)]">
                บาท / {item.unit}
              </span>
            </>
          ) : (
            <span className="font-sans text-base text-[var(--store-muted)]">สอบถามราคา</span>
          )}
        </p>
      </div>
    </div>
  );
}

export function ThreadLiftServicePage({
  service,
  heroImage,
  productImage,
}: {
  service: ServiceCategory;
  /** Undefined until the clinic uploads one — the hero shows a tonal icon panel meanwhile. */
  heroImage?: string;
  productImage?: string;
}) {
  // Every item in this category is the same product at a different thread count, so the menu
  // takes its heading from the first one rather than repeating the name on all three rows.
  const productName = service.items[0]?.name ?? service.title;

  return (
    <div className="bg-[var(--background)]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-16 sm:px-10 md:px-14 md:pb-28 md:pt-24 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mt-12 grid items-start gap-12 md:grid-cols-12 md:gap-10">
            <div className="md:col-span-7">
              <p lang="en" className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
                {service.titleEn}
              </p>
              <h1 className="mt-4 font-serif text-4xl leading-[1.15] text-[var(--store-ink)] md:text-5xl">
                {service.title}
                <span lang="en" className="mt-1 block font-light italic text-[var(--store-muted)]">
                  {service.titleEn}
                </span>
              </h1>

              <p className="mt-10 max-w-xl border-l border-black/[0.08] pl-6 text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
                {service.description}
              </p>

              <div className="mt-8 space-y-3.5">
                <p className="flex items-center gap-3 text-xs text-[var(--store-ink)]">
                  <Stethoscope aria-hidden="true" className="size-4 shrink-0 text-[var(--store-muted)]" />
                  ประเมินและดูแลโดยแพทย์
                </p>
                <p className="flex items-center gap-3 text-xs text-[var(--store-ink)]">
                  <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-[var(--store-muted)]" />
                  ใบอนุญาตเลขที่ {site.license}
                </p>
              </div>
            </div>

            <div className="relative md:col-span-5">
              <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={service.heroAlt ?? ''}
                    aria-hidden={service.heroAlt ? undefined : 'true'}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 768px) 40vw, 90vw"
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
              <span
                aria-hidden="true"
                className="absolute -bottom-5 -left-5 hidden size-14 border-b border-l border-black/[0.08] md:block"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── Treatment menu ───────────────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-32 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5">
            <p lang="en" className="text-[0.68rem] uppercase tracking-[0.34em] text-[var(--store-muted)]">
              Treatment Menu
            </p>
            <h2 className="mt-4 font-serif text-3xl text-[var(--store-ink)] md:text-4xl">{productName}</h2>

            <div className="relative mt-10 aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
              {productImage ? (
                <Image
                  src={productImage}
                  // The clinic chooses this photo, so we can't describe it; the product name sits
                  // directly above it, which is what carries the meaning.
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 768px) 38vw, 90vw"
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

          <Reveal className="flex flex-col justify-end md:col-span-7" delay={60}>
            <div>
              {service.items.map((item, index) => (
                <MenuRow
                  key={item.id ?? `${item.name}-${item.detail ?? index}`}
                  item={item}
                  last={index === service.items.length - 1}
                />
              ))}
            </div>

            <div className="mt-12 flex flex-col items-center justify-between gap-6 md:flex-row">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="flex w-full items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-8 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98] md:w-auto"
              >
                <LineIcon className="size-4" />
                จองคิว / สอบถามราคา ผ่าน LINE
              </a>
              <p className="max-w-xs text-center text-[0.66rem] italic leading-[1.8] text-[var(--store-muted)] md:text-right">
                *ราคาขึ้นอยู่กับการประเมินของแพทย์ จำนวนเส้น และโครงหน้าของแต่ละบุคคล
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-32 lg:px-20">
        <Reveal className="mx-auto max-w-4xl text-center">
          <div className="relative inline-block w-full rounded-[1.75rem] bg-[var(--store-card)] px-8 py-16 md:px-20 md:py-20 shadow-[0_4px_24px_rgba(0,0,0,0.04)]">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute left-5 top-3 select-none font-serif text-8xl leading-none text-black/5"
            >
              “
            </span>
            <blockquote
              lang="en"
              className="relative font-serif text-3xl leading-tight text-[var(--store-ink)] md:text-5xl"
            >
              {site.taglineTh}
            </blockquote>
            <div className="mt-8 flex items-center justify-center gap-4">
              <span aria-hidden="true" className="h-px w-8 bg-[var(--store-control)]" />
              <p lang="en" className="text-[0.62rem] uppercase tracking-[0.4em] text-[var(--store-muted)]">
                The Kazumi Discipline
              </p>
              <span aria-hidden="true" className="h-px w-8 bg-[var(--store-control)]" />
            </div>
          </div>
        </Reveal>
      </section>

      {/* ── Closing CTA ──────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[var(--store-ink)] px-6 py-24 text-[var(--background)] sm:px-10 md:px-14 md:py-32 lg:px-20">
        <svg
          aria-hidden="true"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-5"
        >
          <circle cx="100" cy="50" r="40" fill="none" stroke="currentColor" strokeWidth="0.25" />
          <circle cx="100" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="0.25" />
          <circle cx="100" cy="50" r="20" fill="none" stroke="currentColor" strokeWidth="0.25" />
        </svg>

        <Reveal className="relative mx-auto max-w-6xl">
          <h2 lang="en" className="max-w-3xl font-serif text-4xl leading-tight md:text-6xl">
            Ready for your transformation?
          </h2>
          <p className="mt-7 max-w-2xl text-sm leading-[1.9] text-white/70">
            ปรึกษาทีมแพทย์เพื่อประเมินว่า{service.title}เหมาะกับคุณหรือไม่ ก่อนตัดสินใจเข้ารับบริการ
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row">
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-8 py-3.5 text-center text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
            >
              <LineIcon className="size-4" />
              จองคิวผ่าน LINE
            </a>
            <Link
              href="/services"
              className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/40 bg-transparent px-8 py-3.5 text-center text-xs font-medium text-white transition-all duration-200 hover:border-white hover:bg-white/10 active:scale-[0.98]"
            >
              ดูบริการอื่น
              <ArrowUpRight className="size-3.5 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
