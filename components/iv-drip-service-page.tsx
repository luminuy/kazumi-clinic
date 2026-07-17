import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MessageCircle } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';

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
        dark ? 'text-sand/80' : 'text-olive-deep'
      }`}
    >
      จองคิว <ArrowRight aria-hidden="true" className="size-3" />
    </a>
  );
}

/** A card in one of the standard (light) collections. */
function VitaminCard({ item, index }: { item: ServiceItem; index: number }) {
  return (
    <article className="flex flex-col justify-between border border-olive/15 bg-sand p-8 transition-colors duration-500 hover:bg-cream">
      <div>
        <div className="flex items-start justify-between gap-4">
          <span aria-hidden="true" className="text-[0.64rem] tracking-[0.18em] text-olive/45">
            {String(index).padStart(2, '0')}
          </span>
          <Price item={item} className="text-[0.72rem] font-medium text-olive-deep" />
        </div>
        <h4 className="mt-4 font-serif text-2xl text-olive-deep">{item.name}</h4>
        {item.detail && <p className="mt-2 text-sm leading-[1.9] text-ink/60">{item.detail}</p>}
      </div>
      <EnquireLink item={item} />
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
  // unnumbered. Counting here keeps that running sequence across collection boundaries.
  let cardNumber = 0;

  return (
    <div className="overflow-x-hidden bg-sand">
      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
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

          <div className="flex flex-col items-start gap-12 md:flex-row md:gap-10">
            <div className="w-full md:w-5/12">
              <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-olive/60">
                The Science of Purity
              </p>
              <h1 className="mt-5 font-serif text-4xl leading-[1.15] text-olive-deep md:text-5xl">
                {service.title}
                <span lang="en" className="mt-1 block italic text-olive-deep/55">
                  (Intravenous Therapy)
                </span>
              </h1>
              <p className="mt-8 max-w-md text-sm leading-[1.9] text-ink/65 md:text-base">
                {service.description}
              </p>
              <div className="mt-10">
                <p className="text-[0.64rem] uppercase tracking-[0.16em] text-ink/40">
                  Medical License No. {site.license}
                </p>
                <span aria-hidden="true" className="mt-4 block h-px w-24 bg-olive/25" />
              </div>
            </div>

            <div className="w-full md:w-7/12">
              <div className="relative h-[24rem] w-full overflow-hidden bg-olive-deep/[0.06] md:h-[37.5rem]">
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
                      className="size-12 text-olive/25"
                      strokeWidth={0.75}
                    />
                  </span>
                )}
                <span
                  aria-hidden="true"
                  className="pointer-events-none absolute inset-0 border border-olive/15"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Collections ──────────────────────────────────────── */}
      <section className="bg-cream px-6 py-24 sm:px-10 md:px-14 md:py-32 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <Reveal className="mx-auto max-w-2xl text-center">
            <h2 lang="en" className="font-serif text-3xl text-olive-deep md:text-4xl">
              The Vitamin Collections
            </h2>
            <span aria-hidden="true" className="mx-auto mt-5 block h-px w-12 bg-olive/40" />
          </Reveal>

          <div className="mt-20 space-y-20">
            {groups.map((group, groupIndex) => {
              const isFlagship = groupIndex === lastIndex;

              if (isFlagship) {
                return (
                  <Reveal key={group.collection ?? groupIndex}>
                    <div className="bg-olive-deep p-8 text-sand md:p-14">
                      <h3 lang="en" className="font-serif text-3xl md:text-4xl">
                        {group.collection}
                      </h3>
                      <div className="mt-10 grid gap-10 md:grid-cols-2 md:gap-12">
                        {group.items.map((item) => (
                          <div key={item.name} className="border-l border-sand/20 pl-6">
                            <h4 className="font-serif text-2xl">{item.name}</h4>
                            {item.detail && (
                              <p className="mt-2 text-sm leading-[1.9] text-sand/65">
                                {item.detail}
                              </p>
                            )}
                            <Price item={item} className="mt-4 block font-serif text-2xl" />
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
                        className="border-b border-olive/15 pb-4 font-serif text-3xl text-olive-deep md:text-4xl"
                      >
                        {group.collection}
                      </h3>
                    </div>
                    <div
                      className={`grid gap-8 md:col-span-2 md:grid-cols-2 ${
                        headingRight ? 'md:order-1' : ''
                      }`}
                    >
                      {group.items.map((item) => {
                        cardNumber += 1;
                        return <VitaminCard key={item.name} item={item} index={cardNumber} />;
                      })}
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
            <div className="relative h-[20rem] w-full overflow-hidden bg-olive-deep/[0.06] md:h-[31.25rem]">
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
                    className="size-10 text-olive/20"
                    strokeWidth={0.75}
                  />
                </span>
              )}
            </div>
          </Reveal>

          <Reveal delay={60}>
            <h2 lang="en" className="font-serif text-3xl text-olive-deep md:text-4xl">
              Begin Your Journey to Radiance
            </h2>
            <p className="mt-6 text-sm leading-[1.9] text-ink/65 md:text-base">
              ปรึกษาทีมแพทย์เพื่อประเมินว่า{service.title}เหมาะกับคุณหรือไม่
              ก่อนตัดสินใจเข้ารับบริการ
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center justify-center gap-3 bg-line px-10 py-4 text-[0.68rem] uppercase tracking-[0.2em] text-white transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                <MessageCircle aria-hidden="true" className="size-4" />
                จองคิวผ่าน LINE
              </a>
              <Link
                href="/services"
                className="inline-flex items-center justify-center border border-olive-deep px-10 py-4 text-[0.68rem] uppercase tracking-[0.2em] text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
              >
                ดูบริการทั้งหมด
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Medical disclaimer ───────────────────────────────── */}
      <section className="border-t border-olive/15 px-6 py-12 sm:px-10 md:px-14 lg:px-20">
        <p className="mx-auto max-w-4xl text-[0.62rem] leading-[2] text-ink/40">
          ผลลัพธ์แตกต่างกันไปในแต่ละบุคคล และควรได้รับคำแนะนำจากแพทย์ก่อนเข้ารับบริการ ·
          ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ราคาและเงื่อนไขอาจเปลี่ยนแปลงได้
          กรุณาสอบถามกับคลินิกก่อนเข้ารับบริการ
        </p>
      </section>
    </div>
  );
}
