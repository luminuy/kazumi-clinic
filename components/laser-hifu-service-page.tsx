import Image from 'next/image';
import Link from 'next/link';
import { ShieldCheck, Stethoscope } from 'lucide-react';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';

function RecommendedSession({ item }: { item: ServiceItem }) {
  return (
    <div className="border border-olive/10 bg-sand p-8 md:p-10">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="font-serif text-2xl text-olive-deep md:text-3xl">{item.name}</h3>
          {item.detail && <p className="mt-2 text-sm leading-[1.9] text-ink/60">{item.detail}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p lang="en" className="text-[0.62rem] uppercase tracking-[0.18em] text-olive/50">
            Price
          </p>
          {/* The reference prints "สอบถามราคา" here, and lib/services.ts has no price for this
              category, so the two agree — no invented figure. */}
          <p className="mt-1 font-serif text-lg text-olive-deep">
            {item.priceFrom !== undefined ? (
              <>
                {item.priceFrom.toLocaleString('th-TH')}
                <span className="ml-1 text-xs text-ink/50"> บาท / {item.unit}</span>
              </>
            ) : (
              'สอบถามราคา'
            )}
          </p>
        </div>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-4">
        <div className="flex items-center gap-3 border border-olive/20 p-4">
          <ShieldCheck aria-hidden="true" className="size-4 shrink-0 text-olive" />
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-olive-deep">
            เครื่องมือมาตรฐาน
          </p>
        </div>
        <div className="flex items-center gap-3 border border-olive/20 p-4">
          <Stethoscope aria-hidden="true" className="size-4 shrink-0 text-olive" />
          <p className="text-[0.62rem] uppercase tracking-[0.1em] text-olive-deep">ดูแลโดยแพทย์</p>
        </div>
      </div>

      <a
        href={site.lineUrl}
        target="_blank"
        rel="noopener"
        className="mt-8 flex items-center justify-center gap-3 bg-olive-deep py-4 text-[0.68rem] uppercase tracking-[0.18em] text-sand transition-opacity duration-200 hover:opacity-90 active:scale-[0.99]"
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
  const session = service.items[0];

  return (
    <div className="bg-sand">
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
            <span aria-hidden="true" className="absolute inset-0 bg-sand/70" />
          </>
        ) : (
          <span aria-hidden="true" className="absolute inset-0 bg-olive-deep/[0.05]" />
        )}

        <div className="relative max-w-3xl">
          <p lang="en" className="text-[0.68rem] uppercase tracking-[0.3em] text-olive/60">
            {service.titleEn}
          </p>
          <h1 className="mt-6 font-serif text-4xl leading-[1.1] text-olive-deep md:text-6xl">
            {service.title}
          </h1>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-[1.9] text-ink/65 md:text-base">
            {service.description}
          </p>

          <div className="mt-12 flex flex-col items-center">
            <span aria-hidden="true" className="h-20 w-px bg-olive/30" />
            <p lang="en" className="mt-4 text-[0.62rem] italic tracking-[0.28em] text-olive/55">
              The Science of Purity
            </p>
          </div>
        </div>
      </section>

      {/* ── Bento: editorial image + recommended session ─────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-stretch gap-8 md:grid-cols-12 md:gap-10">
          <Reveal className="md:col-span-5">
            <div className="relative h-80 w-full overflow-hidden border border-olive/10 bg-olive-deep/[0.06] md:h-full md:min-h-[31rem]">
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
                    className="size-12 text-olive/25"
                    strokeWidth={0.75}
                  />
                </span>
              )}
            </div>
          </Reveal>

          <Reveal
            className="flex flex-col justify-center md:col-span-7 md:border-l md:border-olive/15 md:pl-10"
            delay={60}
          >
            <div>
              <h2 lang="en" className="font-serif text-3xl text-olive-deep">
                Recommended Session
              </h2>
              <span aria-hidden="true" className="mt-4 block h-px w-24 bg-olive/25" />
            </div>

            {session && (
              <div className="mt-10">
                <RecommendedSession item={session} />
              </div>
            )}

            <p className="mt-6 text-[0.66rem] italic leading-[1.8] text-ink/45">
              *ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
              ขึ้นอยู่กับการประเมินของแพทย์
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="bg-cream px-6 py-24 text-center sm:px-10 md:py-32">
        <Reveal className="mx-auto max-w-3xl">
          <p lang="en" className="font-serif text-4xl leading-tight text-olive-deep md:text-5xl">
            “{site.taglineTh}”
          </p>
          <span aria-hidden="true" className="mx-auto mt-10 block h-px w-16 bg-olive/40" />
          <p lang="en" className="mt-8 text-[0.62rem] uppercase tracking-[0.4em] text-ink/45">
            The Kazumi Discipline
          </p>
        </Reveal>
      </section>

      {/* ── Ready for transformation ─────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2 md:gap-20">
          <Reveal>
            <h2 lang="en" className="font-serif text-3xl text-olive-deep md:text-4xl">
              Ready for your transformation?
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
                className="inline-flex flex-1 items-center justify-center gap-3 bg-line px-8 py-4 text-[0.68rem] uppercase tracking-[0.18em] text-white transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
              >
                <LineIcon className="size-4" />
                จองคิวผ่าน LINE
              </a>
              <Link
                href="/services"
                className="inline-flex flex-1 items-center justify-center border border-olive-deep px-8 py-4 text-[0.68rem] uppercase tracking-[0.18em] text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
              >
                ดูบริการอื่น
              </Link>
            </div>
          </Reveal>

          <Reveal delay={60}>
            <div className="relative h-80 w-full overflow-hidden border border-olive/10 bg-olive-deep/[0.06] md:h-[25rem]">
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
                    className="size-10 text-olive/20"
                    strokeWidth={0.75}
                  />
                </span>
              )}
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Medical disclaimer band ──────────────────────────── */}
      <div className="bg-olive-deep/[0.06] px-6 py-4 text-center sm:px-10">
        <p className="text-[0.66rem] tracking-wide text-ink/55">
          ประเมินและดูแลโดยแพทย์ · ใบอนุญาตสถานพยาบาลเลขที่ {site.license}
        </p>
      </div>
    </div>
  );
}
