import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Stethoscope } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';
import { ProductThumbnail } from '@/components/product-thumbnail';

function RecommendedSession({ item, category }: { item: ServiceItem; category: string }) {
  return (
    <div className="rounded-3xl border border-black/[0.08] bg-[var(--store-surface)] p-8 shadow-sm md:p-10">
      <div className="flex items-start justify-between gap-6">
        <div className="flex gap-4">
          <ProductThumbnail item={item} category={category} className="size-16 rounded-xl" />
          <div>
          <h3 className="font-serif text-2xl text-[var(--store-ink)] md:text-3xl">{item.name}</h3>
          {item.detail && <p className="mt-2 text-sm leading-[1.9] text-[var(--store-muted)]">{item.detail}</p>}
          </div>
        </div>
        <div className="shrink-0 text-right">
          <p lang="en" className="text-[0.62rem] uppercase tracking-[0.18em] text-[var(--store-muted)]">
            Price
          </p>
          {/* The reference prints "สอบถามราคา" here, and lib/services.ts has no price for this
              category, so the two agree — no invented figure. */}
          <p className="mt-1 font-serif text-lg text-[var(--store-ink)]">
            {item.priceFrom !== undefined ? (
              <>
                {item.priceFrom.toLocaleString('th-TH')}
                <span className="ml-1 text-xs text-[var(--store-muted)]"> บาท / {item.unit}</span>
              </>
            ) : (
              'สอบถามราคา'
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-[var(--store-card)] p-4 shadow-sm">
          <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-[#06C755]" />
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--store-ink)]">
            เครื่องมือมาตรฐาน
          </p>
        </div>
        <div className="flex items-center gap-3 rounded-2xl border border-black/[0.08] bg-[var(--store-card)] p-4 shadow-sm">
          <Stethoscope aria-hidden="true" className="size-4 shrink-0 text-[#06C755]" />
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-[var(--store-ink)]">ดูแลโดยแพทย์</p>
        </div>
      </div>

      <a
        href={site.lineUrl}
        target="_blank"
        rel="noopener"
        className="mt-8 flex items-center justify-center gap-2.5 rounded-full bg-[#06C755] py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.99]"
      >
        <LineIcon className="size-4" />
        จองคิว / สอบถามราคา ผ่าน LINE
      </a>
    </div>
  );
}

export function LaserHifuServicePage({
  service,
  heroImage,
  editorialImage,
  interiorImage,
}: {
  service: ServiceCategory;
  /** Full-bleed hero background — undefined until the clinic uploads one. */
  heroImage?: string;
  editorialImage?: string;
  interiorImage?: string;
}) {
  return (
    <div className="bg-[var(--background)]">
      {/* ── Hero: centred, over a full-bleed image when one exists ───────────── */}
      <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden px-6 py-24 text-center sm:px-10">
        {heroImage ? (
          <>
            <Image
              src={heroImage}
              alt=""
              aria-hidden="true"
              fill
              priority
              fetchPriority="high"
              sizes="100vw"
              className="object-cover"
            />
            <span aria-hidden="true" className="absolute inset-0 bg-[var(--background)]/70 backdrop-blur-[2px]" />
          </>
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-[var(--store-surface)]" />
        )}

        <div className="relative max-w-3xl">
          <p lang="en" className="text-[0.68rem] uppercase tracking-[0.3em] text-[var(--store-muted)]">
            {service.titleEn}
          </p>
          <h1 className="mt-6 font-serif text-4xl leading-[1.1] text-[var(--store-ink)] md:text-6xl">
            {service.title}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
            {service.description}
          </p>

          <div className="mt-12 flex flex-col items-center">
            <span aria-hidden="true" className="h-20 w-px bg-black/10" />
            <p lang="en" className="mt-4 text-[0.62rem] italic tracking-[0.28em] text-[var(--store-muted)]">
              The Science of Purity
            </p>
          </div>
        </div>
      </section>

      {/* ── Bento: editorial image + recommended session ─────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5">
            <div className="relative h-80 w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:h-full md:min-h-[31rem]">
              {editorialImage ? (
                <Image
                  src={editorialImage}
                  alt=""
                  aria-hidden="true"
                  fill
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
          </Reveal>

          <Reveal
            className="flex flex-col justify-center md:col-span-7 md:border-l md:border-black/[0.08] md:pl-10"
            delay={60}
          >
            <div>
              <h2 lang="en" className="font-serif text-3xl text-[var(--store-ink)]">
                Recommended Session
              </h2>
              <span aria-hidden="true" className="mt-4 block h-px w-24 bg-black/10" />
            </div>

            <div className="mt-10 space-y-5">
              {service.items.map((item) => (
                <RecommendedSession key={item.id ?? item.name} item={item} category={service.slug} />
              ))}
            </div>

            <p className="mt-6 text-[0.66rem] italic leading-[1.8] text-[var(--store-muted)]">
              *ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
              ขึ้นอยู่กับการประเมินของแพทย์
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 text-center sm:px-10 md:py-32">
        <Reveal className="mx-auto max-w-3xl">
          <p lang="en" className="font-serif text-4xl leading-tight text-[var(--store-ink)] md:text-5xl">
            “{site.taglineTh}”
          </p>
          <span aria-hidden="true" className="mx-auto mt-10 block h-px w-16 bg-black/[0.08]" />
          <p lang="en" className="mt-8 text-[0.62rem] uppercase tracking-[0.4em] text-[var(--store-muted)]">
            The Kazumi Discipline
          </p>
        </Reveal>
      </section>

      {/* ── Ready for transformation ─────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <h2 lang="en" className="font-serif text-3xl text-[var(--store-ink)] md:text-4xl">
              Ready for your transformation?
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
                className="inline-flex flex-1 items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-8 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
              >
                <LineIcon className="size-4" />
                จองคิวผ่าน LINE
              </a>
              <Link
                href="/services"
                className="inline-flex flex-1 items-center justify-center gap-2 rounded-full border border-black/[0.08] bg-transparent px-8 py-3.5 text-xs font-medium text-[var(--store-ink)] transition-all duration-200 hover:border-[var(--store-ink)] hover:bg-black/5 active:scale-[0.98]"
              >
                ดูบริการอื่น
              </Link>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="relative h-80 w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-lg md:h-[25rem]">
              {interiorImage ? (
                <Image
                  src={interiorImage}
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
        </div>
      </section>

      {/* ── Medical disclaimer band ──────────────────────────── */}
      <div className="bg-[var(--store-card)] px-6 py-4 text-center sm:px-10">
        <p className="text-[0.66rem] tracking-wide text-[var(--store-muted)]">
          ประเมินและดูแลโดยแพทย์ · ใบอนุญาตสถานพยาบาลเลขที่ {site.license}
        </p>
      </div>
    </div>
  );
}
