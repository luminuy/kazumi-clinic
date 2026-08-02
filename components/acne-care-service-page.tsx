import Image from 'next/image';
import { getTranslations } from 'next-intl/server';
import { Link } from '@/i18n/routing';
import type { ServiceCategory, ServiceItem } from '@/lib/services';
import { site } from '@/lib/site';
import { Reveal } from '@/components/reveal';
import { ServiceIcon } from '@/components/service-icon';
import { LineCtaButton } from '@/components/line-cta-button';
import { ProductThumbnail } from '@/components/product-thumbnail';
import { ServiceItemActions } from '@/components/service-item-actions';

function MenuRow({
  item,
  category,
  priceUnit,
  inquirePrice,
}: {
  item: ServiceItem;
  category: string;
  priceUnit: string;
  inquirePrice: string;
}) {
  return (
    <div className="flex items-end justify-between gap-6 border-b border-black/[0.08] pb-4">
      <div className="flex items-center gap-4">
        <ProductThumbnail item={item} category={category} className="size-14 rounded-xl" />
        <div>
        {/* h3, not h4: these rows sit directly under the "Service Menu" h2, so h4 would skip a
            level and break the heading outline. */}
        <h3 className="font-serif text-lg text-[var(--store-ink)] md:text-xl">{item.name}</h3>
        {item.detail && <p className="mt-1 text-sm leading-relaxed text-[var(--store-muted)]/60">{item.detail}</p>}
        </div>
      </div>
      <div className="flex shrink-0 flex-col items-end text-right">
        <p className="text-[0.66rem] uppercase tracking-[0.12em] text-[var(--store-ink)]">
          {/* The reference prints "สอบถามราคา"; lib/services.ts has no price for these programmes,
              so the two agree — no invented figure. */}
          {item.priceFrom !== undefined
            ? `${item.priceFrom.toLocaleString('th-TH')} ${priceUnit}`
            : inquirePrice}
        </p>
        <ServiceItemActions item={item} compact className="mt-2" />
      </div>
    </div>
  );
}

export async function AcneCareServicePage({
  service,
  heroImage,
  interstitialImage,
}: {
  service: ServiceCategory;
  /** Undefined until the clinic uploads one — the slot shows a tonal icon panel meanwhile. */
  heroImage?: string;
  interstitialImage?: string;
}) {
  const t = await getTranslations('AcneCarePage');
  const tCommon = await getTranslations('ServiceCategoryPage');

  return (
    <div className="bg-[var(--background)]">
      {/* ── Hero: title above a tall editorial image with a licence badge ─────── */}
      <section className="px-6 pb-24 pt-16 sm:px-10 md:px-14 md:pt-24 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <h1 className="mt-12 font-serif text-4xl leading-[1.15] tracking-tight text-[var(--store-ink)] md:text-5xl">
            {service.title}
            <span lang="en" className="mt-1 block font-light italic text-[var(--store-muted)]/60">
              {service.titleEn}
            </span>
          </h1>
          <span aria-hidden="true" className="my-6 block h-px w-12 bg-[var(--store-control)]/25" />
          <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-[var(--store-muted)]/55">
            {site.taglineTh}
          </p>

          <div className="relative mt-10 aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-surface)]/[0.06] shadow-md">
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
                  className="size-12 text-[var(--store-muted)]/25"
                  strokeWidth={0.75}
                />
              </span>
            )}
            <p className="absolute bottom-4 right-4 rounded-xl border border-black/[0.08] bg-[var(--background)]/85 px-4 py-2 text-[0.6rem] uppercase leading-tight tracking-wide text-[var(--store-ink)] backdrop-blur-md">
              {tCommon('facilityLicense', { license: site.license })} ·{' '}
              {tCommon('physicianLicense', { license: site.doctors[0].licenseNo })}
            </p>
          </div>
        </div>
      </section>

      {/* ── Philosophy ───────────────────────────────────────── */}
      <section className="px-6 pb-24 sm:px-10 md:px-14 lg:px-20">
        <Reveal className="mx-auto max-w-4xl border-l border-black/[0.08] py-4 pl-6">
          <h2 lang="en" className="text-[0.66rem] uppercase tracking-[0.2em] text-[var(--store-muted)]/60">
            The Kazumi Discipline
          </h2>
          <p
            lang="en"
            className="mt-4 font-serif text-2xl leading-snug text-[var(--store-ink)] md:text-3xl"
          >
            “{site.tagline}”
          </p>
          <p className="mt-6 text-sm leading-[1.9] text-[var(--store-muted)]/65">
            {t('philosophyDescription', { serviceDescription: service.description })}
          </p>
        </Reveal>
      </section>

      {/* ── Service menu ─────────────────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto max-w-4xl">
          <Reveal>
            <p lang="en" className="text-[0.66rem] uppercase tracking-[0.24em] text-[var(--store-muted)]/60">
              Curated Treatments
            </p>
            <h2 lang="en" className="mt-2 font-serif text-3xl text-[var(--store-ink)] md:text-4xl">
              Service Menu
            </h2>
          </Reveal>

          <div className="mt-12 space-y-10">
            {service.items.map((item, index) => (
              <Reveal key={item.id ?? `${item.name}-${index}`} delay={index * 60}>
                <MenuRow
                  item={item}
                  category={service.slug}
                  priceUnit={tCommon('priceUnit', { unit: item.unit })}
                  inquirePrice={tCommon('inquirePrice')}
                />
              </Reveal>
            ))}
          </div>

          <Reveal>
            <p className="mt-10 text-[0.66rem] italic leading-[1.8] text-[var(--store-muted)]/45">
              {t('pricingDisclaimer')}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Visual interstitial ──────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <Reveal className="mx-auto grid max-w-4xl grid-cols-2 gap-4">
          <div className="relative aspect-square overflow-hidden rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-surface)]/[0.06] shadow-sm">
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
                  className="size-10 text-[var(--store-muted)]/20"
                  strokeWidth={0.75}
                />
              </span>
            )}
          </div>
          <div className="flex aspect-square flex-col justify-end rounded-[1.75rem] border border-black/[0.08] bg-[var(--store-surface)] p-6 shadow-sm">
            <p lang="en" className="font-serif text-lg leading-tight text-[var(--store-ink)] md:text-xl">
              Precision in every treatment.
            </p>
          </div>
        </Reveal>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="px-6 pb-28 text-center sm:px-10 md:px-14 lg:px-20">
        <Reveal className="mx-auto max-w-2xl">
          <h2 lang="en" className="font-serif text-3xl italic text-[var(--store-ink)] md:text-4xl">
            Ready for your transformation?
          </h2>
          <p className="mt-6 text-sm leading-[1.9] text-[var(--store-muted)]/65">
            {tCommon('closingDescription', { serviceTitle: service.title })}
          </p>
          <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:justify-center">
            <LineCtaButton className="inline-flex items-center justify-center gap-2.5 rounded-full bg-[#06C755] px-8 py-3.5 text-xs font-medium text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]">
              {tCommon('bookLine')}
            </LineCtaButton>
            <Link
              href="/services"
              className="inline-flex items-center justify-center gap-2 rounded-full border border-[var(--store-ink)]/30 bg-transparent px-8 py-3.5 text-xs font-medium text-[var(--store-ink)] transition-all duration-200 hover:border-[var(--store-ink)] hover:bg-[var(--store-surface)]/5 active:scale-[0.98]"
            >
              {tCommon('viewOtherServices')}
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
