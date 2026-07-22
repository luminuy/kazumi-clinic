import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';
import { AddToCartButton } from '@/components/account/add-to-cart-button';

/** Groups items by their `collection`, preserving declaration order. */
function groupByCollection(items: ServiceItem[]) {
  const groups: { collection?: string; items: ServiceItem[] }[] = [];
  for (const item of items) {
    const last = groups.at(-1);
    if (last && last.collection === item.collection) last.items.push(item);
    else groups.push({ collection: item.collection, items: [item] });
  }
  return groups;
}

function Price({ item, className }: { item: ServiceItem; className?: string }) {
  if (item.priceFrom === undefined) {
    return <span className={className}>สอบถามราคา</span>;
  }
  // IV Drip prices are the clinic's catalogue rates, not promo figures (see lib/services.ts), so
  // unlike filler/botox they carry no promo caveat.
  return (
    <span className={className}>
      {item.priceFrom.toLocaleString('th-TH')}
      <span className="ml-1 text-[0.85em] opacity-70"> บาท</span>
    </span>
  );
}

function EnquireLink({ item, dark = false }: { item: ServiceItem; dark?: boolean }) {
  return (
    <a
      href={site.lineUrl}
      target="_blank"
      rel="noopener"
      aria-label={`จองคิว ${item.name} ผ่าน LINE`}
      className={`mt-6 inline-flex items-center gap-2 text-[0.64rem] uppercase tracking-[0.18em] transition-[gap] duration-200 hover:gap-4 ${
        dark ? 'text-sand/80' : 'text-[var(--store-ink)]'
      }`}
    >
      จองคิว <ArrowRight aria-hidden="true" className="size-3" />
    </a>
  );
}

function VitaminCard({ item, index }: { item: ServiceItem; index: number }) {
  return (
    <article className="flex flex-col justify-between rounded-3xl border border-black/[0.08] bg-[var(--store-card)] p-8 shadow-sm transition-colors duration-500 hover:bg-[var(--store-surface)]">
      <div>
        <div className="flex items-start justify-between gap-4">
          <span aria-hidden="true" className="text-[0.64rem] tracking-[0.18em] text-[var(--store-muted)]">
            {String(index).padStart(2, '0')}
          </span>
          <Price item={item} className="text-[0.72rem] font-medium text-[var(--store-ink)]" />
        </div>
        <h4 className="mt-4 font-serif text-2xl text-[var(--store-ink)]">{item.name}</h4>
        {item.detail && <p className="mt-2 text-sm leading-[1.9] text-[var(--store-muted)]">{item.detail}</p>}
      </div>
      {item.id && item.priceFrom !== undefined ? (
        <div className="mt-6 flex flex-col gap-2">
          <AddToCartButton productId={item.id} className="w-full" />
          <EnquireLink item={item} />
        </div>
      ) : (
        <EnquireLink item={item} />
      )}
    </article>
  );
}

export function IvDripServicePage({
  service,
  heroImage,
  treatmentImage,
}: {
  service: ServiceCategory;
  heroImage?: string;
  /** Undefined until the clinic uploads one — the slot shows a tonal icon panel meanwhile. */
  treatmentImage?: string;
}) {
  const groups = groupByCollection(service.items);
  // The reference closes on the premium collection as a dark panel. Our collections are ordered
  // Essential → Recovery → Signature, i.e. ascending, so the flagship is the last group.
  const lastIndex = groups.length - 1;

  // The reference numbers its cards 01..04 across the light collections and leaves the dark panel
  // unnumbered. Precompute each group's starting offset (items in all earlier groups) so the
  // running sequence is derived, not mutated during render — a mutable counter incremented inside
  // the JSX trips react-hooks/immutability (React Compiler) under the Next 16 lint config.
  const cardOffsets = groups.map((_, i) =>
    groups.slice(0, i).reduce((sum, group) => sum + group.items.length, 0),
  );

  return (
    <div className="overflow-x-hidden bg-[var(--background)]">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mt-12 flex flex-col items-start gap-12 md:flex-row md:gap-10">
            <div className="w-full md:w-5/12">
              <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
                The Science of Purity
              </p>
              <h1 className="mt-5 font-serif text-4xl leading-[1.15] text-[var(--store-ink)] md:text-5xl">
                {service.title}
                <span lang="en" className="mt-1 block italic text-[var(--store-muted)]">
                  (Intravenous Therapy)
                </span>
              </h1>
              <p className="mt-8 max-w-md text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
                {service.description}
              </p>
              <div className="mt-10">
                <p className="text-[0.64rem] uppercase tracking-[0.16em] text-[var(--store-muted)]">
                  Medical License No. {site.license}
                </p>
                <span aria-hidden="true" className="mt-4 block h-px w-24 bg-black/10" />
              </div>
            </div>

            <div className="w-full md:w-7/12">
              <div className="relative h-[24rem] w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:h-[37.5rem]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={service.heroAlt ?? ''}
                    aria-hidden={service.heroAlt ? undefined : 'true'}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 768px) 58vw, 90vw"
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

      {/* ── Collections ──────────────────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 lang="en" className="font-serif text-3xl text-[var(--store-ink)] md:text-4xl">
              The Vitamin Collections
            </h2>
            <span aria-hidden="true" className="mx-auto mt-5 block h-px w-12 bg-black/[0.08]" />
          </Reveal>

          <div className="mt-20 space-y-20">
            {groups.map((group, groupIndex) => {
              const isFlagship = groupIndex === lastIndex;

              if (isFlagship) {
                return (
                  <Reveal key={group.collection ?? groupIndex}>
                    <div className="rounded-[1.75rem] bg-[var(--store-ink)] p-8 text-[var(--background)] shadow-xl md:p-14">
                      <h3 lang="en" className="font-serif text-3xl md:text-4xl">
                        {group.collection}
                      </h3>
                      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
                        {group.items.map((item) => (
                          <div key={item.name} className="border-l border-white/20 pl-6">
                            <h4 className="font-serif text-2xl">{item.name}</h4>
                            {item.detail && (
                              <p className="mt-2 text-sm leading-[1.9] text-white/65">
                                {item.detail}
                              </p>
                            )}
                            <Price item={item} className="mt-4 block font-serif text-2xl" />
                            {item.id && item.priceFrom !== undefined && (
                              <AddToCartButton productId={item.id} className="mt-5 w-full sm:w-auto" />
                            )}
                            <EnquireLink item={item} dark />
                          </div>
                        ))}
                      </div>
                    </div>
                  </Reveal>
                );
              }

              // The reference alternates which side the collection heading sits on.
              const headingRight = groupIndex % 2 === 1;
              return (
                <Reveal key={group.collection ?? groupIndex}>
                  <div className="grid gap-8 md:grid-cols-3 md:gap-10">
                    <div
                      className={`md:col-span-1 ${headingRight ? 'md:order-2 md:text-right' : ''}`}
                    >
                      <h3
                        lang="en"
                        className="border-b border-black/[0.08] pb-4 font-serif text-3xl text-[var(--store-ink)] md:text-4xl"
                      >
                        {group.collection}
                      </h3>
                    </div>
                    <div
                      className={`grid gap-8 md:col-span-2 md:grid-cols-2 ${
                        headingRight ? 'md:order-1' : ''
                      }`}
                    >
                      {group.items.map((item, itemIndex) => (
                        <VitaminCard
                          key={item.name}
                          item={item}
                          index={cardOffsets[groupIndex] + itemIndex + 1}
                        />
                      ))}
                    </div>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Booking ──────────────────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-32 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <div className="relative h-[20rem] w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:h-[31.25rem]">
              {treatmentImage ? (
                <Image
                  src={treatmentImage}
                  // Clinic-chosen photo — we can't describe what it shows, and the heading beside
                  // it carries the meaning, so it's decorative.
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="(min-width: 768px) 45vw, 90vw"
                  className="object-cover grayscale transition-[filter] duration-1000 hover:grayscale-0"
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

          <Reveal delay={60}>
            <h2 lang="en" className="font-serif text-3xl text-[var(--store-ink)] md:text-4xl">
              Begin Your Journey to Radiance
            </h2>
            <p className="mt-6 text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
              ปรึกษาทีมแพทย์เพื่อประเมินว่า{service.title}เหมาะกับคุณหรือไม่
              ก่อนตัดสินใจเข้ารับบริการ
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-8 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
              >
                <LineIcon className="size-4" />
                จองคิวผ่าน LINE
              </a>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-transparent px-8 py-3.5 text-xs font-medium text-[var(--store-ink)] transition-all duration-200 hover:border-[var(--store-ink)] hover:bg-black/5 active:scale-[0.98]"
              >
                ดูบริการทั้งหมด
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Medical disclaimer ───────────────────────────────── */}
      <section className="border-t border-black/[0.08] px-6 py-12 sm:px-10 md:px-14 lg:px-20">
        <p className="mx-auto max-w-4xl text-[0.62rem] leading-[2] text-[var(--store-muted)]">
          ผลลัพธ์แตกต่างกันไปในแต่ละบุคคล และควรได้รับคำแนะนำจากแพทย์ก่อนเข้ารับบริการ ·
          ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ราคาและเงื่อนไขอาจเปลี่ยนแปลงได้
          กรุณาสอบถามกับคลินิกก่อนเข้ารับบริการ
        </p>
      </section>
    </div>
  );
}
