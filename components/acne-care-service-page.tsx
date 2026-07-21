import Image from 'next/image';
import Link from 'next/link';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';

function MenuRow({ item }: { item: ServiceItem }) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-olive/15 pb-4">
      <div>
        {/* h3, not h4: these rows sit directly under the "Service Menu" h2, so h4 would skip a
            level and break the heading outline. */}
        <h3 className="font-serif text-lg text-olive-deep md:text-xl">{item.name}</h3>
        {item.detail && <p className="mt-1 text-sm leading-relaxed text-ink/60">{item.detail}</p>}
      </div>
      <p className="shrink-0 text-right text-[0.66rem] uppercase tracking-[0.12em] text-olive-deep">
        {/* The reference prints "สอบถามราคา"; lib/services.ts has no price for these programmes,
            so the two agree — no invented figure. */}
        {item.priceFrom !== undefined
          ? `${item.priceFrom.toLocaleString('th-TH')} บาท / ${item.unit}`
          : 'สอบถามราคา'}
      </p>
    </div>
  );
}

export function AcneCareServicePage({
  service,
  heroImage,
  interstitialImage,
}: {
  service: ServiceCategory;
  /** Undefined until the clinic uploads one — the slot shows a tonal icon panel meanwhile. */
  heroImage?: string;
  interstitialImage?: string;
}) {
  return (
    <div className="bg-sand">
      {/* ── Hero: title above a tall editorial image with a licence badge ─────── */}
      <section className="px-6 pb-24 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mt-12 font-serif text-4xl leading-[1.15] tracking-tight text-olive-deep md:text-5xl">
            {service.title}
            <span lang="en" className="mt-1 block font-light italic text-olive/60">
              {service.titleEn}
            </span>
          </h1>
          <span aria-hidden="true" className="my-6 block h-px w-12 bg-olive/25" />
          <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-olive/55">
            {site.taglineTh}
          </p>

          <div className="relative mt-10 aspect-[4/5] w-full overflow-hidden border border-olive/10 bg-olive-deep/[0.06]">
            {heroImage ? (
              <Image
                src={heroImage}
                alt={service.heroAlt ?? ''}
                aria-hidden={service.heroAlt ? undefined : 'true'}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 896px) 56rem, 90vw"
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
            <p className="absolute bottom-4 right-4 border border-olive/10 bg-sand/85 px-4 py-2 text-[0.6rem] uppercase leading-tight tracking-wide text-olive-deep backdrop-blur-sm">
              ใบอนุญาตสถานพยาบาลเลขที่ {site.license}
            </p>
          </div>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="px-6 pb-24 sm:px-10 md:px-14 lg:px-20">
        <Reveal className="mx-auto max-w-4xl border-l border-olive/20 py-4 pl-6">
          <h2 lang="en" className="text-[0.66rem] uppercase tracking-[0.2em] text-olive/60">
            The Kazumi Discipline
          </h2>
          <p
            lang="en"
            className="mt-4 font-serif text-2xl leading-snug text-olive-deep md:text-3xl"
          >
            “{site.tagline}”
          </p>
          <p className="mt-6 text-sm leading-[1.9] text-ink/65">
            {service.description} หลักปรัชญา Ma หรือการใช้พื้นที่ว่างอย่างมีความหมาย
            ถูกนำมาปรับใช้ในการออกแบบแผนการรักษา เพื่อผลลัพธ์ที่ดูเป็นธรรมชาติและสมดุล
          </p>
        </Reveal>
      </section>

      {/* ── Service menu ─────────────────────────────────────── */}
      <section className="bg-cream px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-olive/60">
              Curated Treatments
            </p>
            <h2 lang="en" className="mt-2 font-serif text-3xl text-olive-deep md:text-4xl">
              Service Menu
            </h2>
          </Reveal>

          <div className="mt-12 space-y-10">
            {service.items.map((item, index) => (
              <Reveal key={item.id ?? `${item.name}-${index}`} delay={index * 60}>
                <MenuRow item={item} />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-10 text-[0.66rem] italic leading-[1.8] text-ink/45">
              *ราคาและแผนการรักษาขึ้นอยู่กับการประเมินของแพทย์และความรุนแรงของปัญหาผิวรายบุคคล ·
              ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Visual interstitial ──────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <Reveal className="mx-auto grid max-w-4xl grid-cols-2 gap-4">
          <div className="relative aspect-square overflow-hidden border border-olive/10 bg-olive-deep/[0.06]">
            {interstitialImage ? (
              <Image
                src={interstitialImage}
                alt=""
                aria-hidden="true"
                fill
                sizes="(min-width: 896px) 28rem, 45vw"
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
          <div className="flex aspect-square flex-col justify-end border border-olive/10 bg-cream p-5">
            <p lang="en" className="font-serif text-lg leading-tight text-olive-deep md:text-xl">
              Precision in every treatment.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 pb-28 text-center sm:px-10 md:px-14 lg:px-20">
        <Reveal className="mx-auto max-w-2xl">
          <h2 lang="en" className="font-serif text-3xl italic text-olive-deep md:text-4xl">
            Ready for your transformation?
          </h2>
          <p className="mt-6 text-sm leading-[1.9] text-ink/65">
            ปรึกษาทีมแพทย์เพื่อประเมินว่า{service.title}เหมาะกับคุณหรือไม่ ก่อนตัดสินใจเข้ารับบริการ
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-3 bg-line px-10 py-4 text-[0.68rem] uppercase tracking-[0.18em] text-white transition-opacity duration-200 hover:opacity-90 active:scale-[0.98]"
            >
              <LineIcon className="size-4" />
              จองคิวผ่าน LINE
            </a>
            <Link
              href="/services"
              className="inline-flex items-center justify-center border border-olive-deep px-10 py-4 text-[0.68rem] uppercase tracking-[0.18em] text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
            >
              ดูบริการอื่น
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
