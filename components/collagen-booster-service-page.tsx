import Image from 'next/image';
import { BadgeCheck, Dna, Phone, Sparkles, Target } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { ServiceCategory } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';

/**
 * Our benefits are "English title — Thai description" (e.g. "Restoration — เติมเต็ม…"). The
 * reference's four cards each show an English feature title over a Thai paragraph, so we split
 * on the em dash to recover both halves; the icons run in declared order.
 */
function splitBenefit(benefit: string) {
  const [title, ...rest] = benefit.split(/\s+—\s+/);
  return { title, description: rest.join(' — ') || undefined };
}

// One icon per benefit card, in the order the benefits are declared in lib/services.ts.
const BENEFIT_ICONS: LucideIcon[] = [Dna, BadgeCheck, Sparkles, Target];

export function CollagenBoosterServicePage({
  service,
  heroImage,
  editorialImage,
}: {
  service: ServiceCategory;
  /** No shipped default (hero-collagen-booster is admin-only), so the hero may be empty. */
  heroImage?: string;
  editorialImage?: string;
}) {
  const item = service.items[0];

  return (
    <div className="bg-[var(--background)]">
      {/* ── Hero: asymmetric image + intro, with a tactile "Ma" overlap ──────── */}
      <section className="px-6 pb-28 pt-16 sm:px-10 md:px-14 md:pt-24 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="mt-12 grid items-center gap-x-10 gap-y-16 md:grid-cols-12">
            {/* Image column — with the overlapping philosophy card. */}
            <Reveal className="relative order-2 md:order-1 md:col-span-7">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-[0_4px_24px_rgba(0,0,0,0.04)] md:aspect-[16/10]">
                {heroImage ? (
                  <Image
                    src={heroImage}
                    alt={service.heroAlt ?? ''}
                    aria-hidden={service.heroAlt ? undefined : 'true'}
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 768px) 42rem, 90vw"
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
              {/* Organic overlap (docs/design.md) — a tonal card, no glass/shadow. */}
              <div className="mt-6 rounded-2xl border border-black/[0.08] bg-[var(--store-surface)] p-7 md:absolute md:-bottom-10 md:-right-6 md:mt-0 md:max-w-xs shadow-md">
                <p
                  lang="en"
                  className="mb-2 text-[0.62rem] uppercase tracking-[0.22em] text-[var(--store-muted)]"
                >
                  Philosophy
                </p>
                <p className="text-sm italic leading-[1.8] text-[var(--store-muted)]">
                  “Ma” — ศาสตร์แห่งการเว้นที่ว่างอย่างตั้งใจ
                  เพื่อสร้างสมดุลและความหมายในความงามที่แม่นยำ
                </p>
              </div>
            </Reveal>

            {/* Intro column. */}
            <div className="order-1 flex flex-col gap-5 md:order-2 md:col-span-5">
              <Reveal>
                <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-[var(--store-muted)]">
                  {service.titleEn}
                </p>
                <h1 className="mt-4 font-serif text-4xl leading-[1.1] text-[var(--store-ink)] md:text-5xl">
                  {service.title}
                </h1>
                <p className="mt-6 max-w-sm text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
                  {service.description}
                </p>
                <p className="mt-6 text-[0.64rem] uppercase tracking-[0.16em] text-[var(--store-muted)]">
                  ใบอนุญาตสถานพยาบาลเลขที่ {site.license}
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product highlight: Karisma Rh Collagen + benefit grid ────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-x-14 gap-y-12 md:grid-cols-3">
          <Reveal className="md:col-span-1">
            <h2 className="font-serif text-3xl text-[var(--store-ink)] md:text-4xl">{item.name}</h2>
            {/* The reference labels this "Rh Collagen"; the item's real detail is "Made in Italy". */}
            {item.detail && (
              <p lang="en" className="mt-2 text-[0.66rem] uppercase tracking-[0.18em] text-[var(--store-muted)]">
                {item.detail}
              </p>
            )}
            <span aria-hidden="true" className="mt-6 block h-px w-full bg-[var(--store-control)]" />
            <p className="mt-6 text-sm leading-[1.9] text-[var(--store-muted)]">{service.shortDescription}</p>
          </Reveal>

          {item.benefits && item.benefits.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 md:col-span-2">
              {item.benefits.map((benefit, index) => {
                const { title, description } = splitBenefit(benefit);
                const Icon = BENEFIT_ICONS[index % BENEFIT_ICONS.length];
                return (
                  <Reveal key={title} delay={index * 60}>
                    <article className="h-full rounded-3xl border border-black/[0.08] bg-[var(--store-card)] p-7 shadow-sm">
                      <Icon aria-hidden="true" className="size-8 text-[#06C755]" strokeWidth={1.25} />
                      <h3 lang="en" className="mt-4 font-serif text-xl text-[var(--store-ink)]">
                        {title}
                      </h3>
                      {description && (
                        <p className="mt-2 text-sm leading-[1.8] text-[var(--store-muted)]">{description}</p>
                      )}
                    </article>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ── Editorial quote + image ──────────────────────────── */}
      <section className="overflow-hidden bg-[var(--background)] px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl items-center gap-x-16 gap-y-14 md:grid-cols-2">
          <Reveal className="space-y-8">
            <blockquote className="font-serif text-3xl italic leading-[1.35] text-[var(--store-ink)] md:text-4xl">
              “{site.taglineTh}”
            </blockquote>
            <div className="flex items-center gap-4">
              <span aria-hidden="true" className="h-px w-12 bg-black/[0.08]" />
              <p lang="en" className="text-[0.66rem] uppercase tracking-[0.2em] text-[var(--store-muted)]">
                {site.name} Standards
              </p>
            </div>
          </Reveal>

          <Reveal delay={80}>
            <div className="relative">
              <div className="relative aspect-square w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-card)] shadow-lg">
                {editorialImage ? (
                  <Image
                    src={editorialImage}
                    alt=""
                    aria-hidden="true"
                    fill
                    sizes="(min-width: 768px) 32rem, 90vw"
                    className="object-cover grayscale-[0.2]"
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
              <span
                aria-hidden="true"
                className="absolute -left-6 -top-6 -z-10 hidden size-40 rounded-[1.75rem] border border-black/[0.08] md:block"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-[var(--store-ink)] px-6 py-24 text-center text-[var(--background)] sm:px-10 md:py-28">
        <Reveal className="mx-auto max-w-2xl">
          <h2 className="font-serif text-3xl leading-snug md:text-4xl">
            สัมผัสประสบการณ์ความงามที่ออกแบบมาเพื่อคุณ
          </h2>
          <p className="mx-auto mt-6 max-w-md text-sm leading-[1.9] text-white/75 md:text-base">
            เริ่มต้นดูแลผิวพรรณของคุณกับทีมแพทย์ {site.name} ปรึกษาและประเมินความเหมาะสมก่อนเข้ารับบริการ
          </p>
          <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] px-8 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
            >
              <LineIcon className="size-4" />
              ปรึกษาฟรีผ่าน LINE
            </a>
            <a
              href={`tel:${site.phone.replace(/\s+/g, '')}`}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-white/30 bg-transparent px-8 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:border-white hover:bg-white/10 active:scale-[0.98]"
            >
              <Phone aria-hidden="true" className="size-4" />
              โทร {site.phone}
            </a>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
