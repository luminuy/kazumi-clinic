import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, FlaskConical, ShieldCheck, Syringe } from 'lucide-react';
import type { ServiceCategory } from '@/lib/services';
import { doctors } from '@/lib/doctor';
import { site } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { SectionLabel } from '@/components/page-hero';
import { LineIcon } from '@/components/brand-icons';
import { PhysicianPanel } from '@/components/physician-panel';

export function FillerServicePage({
  service,
  heroImage,
  itemImages = {},
  doctorImage,
  eeshaImage,
}: {
  service: ServiceCategory;
  heroImage: string;
  /** ServiceItem.id → Cloudinary public ID, resolved from /admin by the server component. */
  itemImages?: Record<string, string>;
  doctorImage?: string;
  eeshaImage?: string;
}) {
  return (
    <div className="overflow-hidden bg-[var(--background)]">
      <section className="px-6 pb-20 pt-24 md:px-10 md:pb-24 md:pt-28">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-12 lg:gap-14">
          <div className="lg:col-span-7">
            <p className="section-eyebrow">Medical Aesthetic Excellence</p>
            {/* One line, at a readable size. The old clamp(4rem,9vw,8rem) pushed "(ฟิลเลอร์)" onto
                its own line and left the column mostly empty space. */}
            <h1 className="mt-5 font-serif text-4xl leading-[1.15] tracking-[-0.02em] text-[var(--store-ink)] md:text-5xl">
              {service.titleEn}{' '}
              <span className="font-normal italic text-[var(--store-muted)]">({service.title})</span>
            </h1>
            <p className="mt-7 max-w-xl text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
              {service.description}
            </p>

            <div className="mt-8 flex flex-col gap-4 text-sm text-[var(--store-ink)] sm:flex-row sm:gap-10">
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="size-4 text-[var(--store-muted)]" aria-hidden="true" />
                Doctor Assessed
              </span>
              {/* "Premium Hyaluronic Acid" restates the category description we already publish
                  ("ฟิลเลอร์กรดไฮยาลูรอนิกจากแบรนด์คุณภาพ") — not a new claim. */}
              <span className="flex items-center gap-2.5">
                <FlaskConical className="size-4 text-[var(--store-muted)]" aria-hidden="true" />
                Premium Hyaluronic Acid
              </span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            {/* Landscape, not the 1/1.618 portrait it was: the reference frames this shot wide,
                and a tall portrait next to a one-line headline is what left the hero so airy.
                Still golden ratio — just the other way up. */}
            <div className="relative ml-auto aspect-[1.618] w-full overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] shadow-2xl shadow-black/5">
              <Image
                src={heroImage}
                alt={service.heroAlt ?? ''}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
            <div
              className="absolute -bottom-6 -left-6 -z-0 hidden h-32 w-32 border-b border-l border-black/[0.08] md:block md:h-40 md:w-40"
              aria-hidden="true"
            />
          </div>
        </div>
      </section>

      <section className="bg-[var(--store-surface)] px-6 py-20 text-center md:py-24">
        <Reveal className="mx-auto max-w-4xl">
          <SectionLabel index={1}>Our philosophy</SectionLabel>
          <h2 className="mt-7 font-serif text-4xl italic leading-tight text-[var(--store-ink)] md:text-6xl">
            “{site.taglineTh}”
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-[1.8] text-[var(--store-muted)]">
            แพทย์ประเมินโครงหน้าและวางแผนการดูแลเฉพาะบุคคลก่อนรับบริการทุกครั้ง
          </p>
        </Reveal>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="grid gap-8 border-b border-black/[0.08] pb-9 md:grid-cols-[1fr_0.62fr] md:items-end">
            <div>
              <SectionLabel index={2}>Treatment selection</SectionLabel>
              <h2 className="mt-5 font-serif text-4xl leading-none text-[var(--store-ink)] md:text-6xl">
                รายการฟิลเลอร์
              </h2>
            </div>
            <p className="text-sm leading-[1.8] text-[var(--store-muted)] md:text-right">
              รายการและขนาดผลิตภัณฑ์ที่คลินิกมีให้บริการ
              แพทย์จะเป็นผู้ประเมินความเหมาะสมก่อนทำหัตถการ
            </p>
          </Reveal>

          <div className="mt-12 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {service.items.map((item, index) => {
              const productImage = item.id ? itemImages[item.id] : undefined;
              return (
                <Reveal
                  key={item.id ?? `${item.name}-${item.detail ?? ''}`}
                  delay={(index % 3) * 60}
                >
                  <article className="flex h-full flex-col">
                    <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] border border-black/[0.08]">
                      {productImage ? (
                        <Image
                          src={productImage}
                          // The clinic picks this photo; we can't describe what it shows, and the
                          // product name sits right beside it — so it's decorative, not informative.
                          alt=""
                          aria-hidden="true"
                          fill
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 88vw"
                          className="object-cover"
                        />
                      ) : (
                        <span
                          aria-hidden="true"
                          className="absolute inset-0 flex items-center justify-center"
                        >
                          <Syringe className="size-8 text-[var(--store-muted)]" strokeWidth={0.75} />
                        </span>
                      )}
                    </div>

                    <h3 className="mt-6 font-serif text-2xl leading-tight text-[var(--store-ink)]">
                      {item.name}
                    </h3>
                    {item.detail && (
                      <p className="mt-1.5 text-[0.68rem] uppercase tracking-[0.16em] text-[var(--store-muted)]">
                        {item.detail}
                      </p>
                    )}

                    <div className="mt-6 flex items-baseline justify-between gap-3 border-t border-black/[0.08] pt-5">
                      {/* §0.2: a promo price has to say it's a promo. The reference drops this
                          label and shows a bare number — that's the one thing we can't copy. */}
                      <span className="text-[0.62rem] uppercase tracking-[0.16em] text-[var(--store-muted)]">
                        ราคาโปรโมชัน
                      </span>
                      <p className="font-serif text-2xl text-[var(--store-ink)]">
                        {item.priceFrom !== undefined ? (
                          <>
                            {item.priceFrom.toLocaleString('th-TH')}
                            <span className="ml-1.5 font-sans text-[0.62rem] tracking-wide text-[var(--store-muted)]">
                              บาท / {item.unit}
                            </span>
                          </>
                        ) : (
                          <span className="font-sans text-sm text-[var(--store-muted)]">สอบถามราคา</span>
                        )}
                      </p>
                    </div>

                    <a
                      href={site.lineUrl}
                      target="_blank"
                      rel="noopener"
                      aria-label={`จอง ${item.name}${item.detail ? ` ${item.detail}` : ''} ผ่าน LINE`}
                      className="mt-auto inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] px-5 py-3 text-center text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] active:scale-[0.98]"
                    >
                      <LineIcon className="size-3.5" />
                      Book Session
                    </a>
                  </article>
                </Reveal>
              );
            })}
          </div>

          <p className="mt-14 rounded-[1.75rem] bg-[var(--store-surface)] px-6 py-5 text-center text-xs italic leading-relaxed text-[var(--store-muted)]">
            *ราคาโปรโมชัน โปรดสอบถามช่วงเวลาและเงื่อนไขล่าสุดกับคลินิกก่อนรับบริการ ·
            ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
          </p>
        </div>
      </section>

      <section className="bg-[var(--store-surface)] px-4 py-20 md:px-6 md:py-24">
        <Reveal className="mx-auto mb-10 flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-12">
          <div>
            <SectionLabel index={3}>Doctor-led assessment</SectionLabel>
            <h2 className="mt-5 font-serif text-4xl text-[var(--store-ink)] md:text-5xl">
              ดูแลและประเมินโดยแพทย์
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-[1.8] text-[var(--store-muted)]">
              ที่ {site.name} หัตถการทุกขั้นตอนดูแลโดยแพทย์ผู้มีใบประกอบวิชาชีพเวชกรรม
              เริ่มจากการประเมินโครงสร้างใบหน้าและสภาพผิวอย่างละเอียด
              เพื่อแนะนำแนวทางที่เหมาะกับแต่ละบุคคล
            </p>
          </div>
        </Reveal>

        <div className="mx-auto max-w-5xl">
          <div className="grid gap-8 sm:grid-cols-2 lg:gap-10">
            <PhysicianPanel
              label="The Lead Physician"
              name={doctors[0].nameTh}
              nameSecondary={doctors[0].name}
              role={doctors[0].role}
              licenseNo={doctors[0].licenseNo}
              summary={doctors[0].summary}
              expertise={doctors[0].expertise}
              languages={doctors[0].languages}
              imageSrc={doctorImage}
              imageAlt={`${doctors[0].nameTh} ${doctors[0].role} ของ ${site.name}`}
            />
            <PhysicianPanel
              label="Clinic Physician"
              name={doctors[1].name}
              nameSecondary={doctors[1].nameTh}
              role={doctors[1].role}
              licenseNo={doctors[1].licenseNo}
              summary={doctors[1].summary}
              expertise={doctors[1].expertise}
              languages={doctors[1].languages}
              imageSrc={eeshaImage}
              imageAlt={`${doctors[1].name} ${doctors[1].role} ของ ${site.name}`}
              delay={60}
            />
          </div>
        </div>
      </section>

      <section className="bg-[var(--store-ink)] px-6 py-24 text-[var(--background)] md:px-10 md:py-32">
        <Reveal className="mx-auto max-w-6xl">
          <div className="flex items-center gap-3 text-[0.68rem] uppercase tracking-[0.24em] text-[var(--store-control)]">
            <span className="h-px w-8 bg-white/20" />
            Medical consultation
          </div>
          <h2
            lang="en"
            className="mt-6 max-w-3xl font-serif text-5xl leading-[1.05] tracking-tight md:text-6xl"
          >
            Ready for your transformation?
          </h2>
          <p className="mt-7 max-w-xl text-sm leading-[1.9] text-white/60">
            จองคิวเพื่อประเมินโครงหน้าและปรึกษาแพทย์ได้โดยตรงผ่าน LINE Official Account
            ทีมงานของเราพร้อมดูแลคุณในทุกขั้นตอน
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button
              render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
              className="h-12 rounded-full bg-[#06C755] px-8 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.97]"
            >
              <LineIcon className="size-4" />
              จองคิว {service.title} ผ่าน LINE
            </Button>
            <Button
              render={<Link href="/services" />}
              variant="outline"
              className="h-12 rounded-full border-white/20 bg-transparent px-8 text-xs font-medium text-white transition-all duration-200 hover:border-white/40 hover:bg-white/5 active:scale-[0.97]"
            >
              ดูบริการอื่น <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
