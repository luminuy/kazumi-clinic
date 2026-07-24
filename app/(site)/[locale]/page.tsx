import { jsonLdHtml } from '@/lib/json-ld';
import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowUpRight, BadgeCheck, ChevronDown, Clock, MapPin, Stethoscope } from 'lucide-react';
import { site } from '@/lib/site';
import { doctor, doctorEesha } from '@/lib/doctor';
import { serviceCategories } from '@/lib/services';
import { faqSchema, homePageSchema } from '@/lib/schema';
import { cloudAssets, heroHomePortrait } from '@/lib/cloud';
import { getImageOverrides } from '@/lib/site-images-store';
import { getAllMergedCategories } from '@/lib/service-products-store';
import { categoryImageKey, posterKeyByDefaultId } from '@/lib/site-images';
import { siteSocialImage } from '@/lib/metadata-images';
import { promotionPosters } from '@/lib/promotions';
import { Reveal } from '@/components/reveal';
import { PromotionCardGrid } from '@/components/promotion-card-grid';
import { ServiceCarousel } from '@/components/service-carousel';
import { PhysicianPanel } from '@/components/physician-panel';
import { BrandStrip } from '@/components/brand-strip';
import { GoogleIcon, InstagramIcon, LineIcon } from '@/components/brand-icons';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const homeTitle = t('metaTitle');
  const homeDescription = t('metaDescription');
  const socialImage = await siteSocialImage('hero-home', `${site.name} ${homeTitle}`);

  return {
    title: homeTitle,
    description: homeDescription,
    alternates: { canonical: site.url },
    openGraph: {
      title: homeTitle,
      description: homeDescription,
      url: site.url,
      siteName: site.name,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'th_TH',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: homeTitle,
      description: homeDescription,
      images: [socialImage.url],
    },
  };
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('HomePage');

  const faqs = [
    {
      question: t('faq.q1', { siteName: site.name }),
      answer: t('faq.a1', { siteName: site.name, categories: serviceCategories.map((c) => c.title).join(' ') }),
    },
    {
      question: t('faq.q2'),
      answer: t('faq.a2', { weekdays: site.hoursDisplay.weekdays, sunday: site.hoursDisplay.sunday }),
    },
    {
      question: t('faq.q3'),
      answer: t('faq.a3', { siteName: site.name, addressFull: site.addressFull, license: site.license }),
    },
    {
      question: t('faq.q4'),
      answer: t('faq.a4', { doctors: site.doctors.map((d) => `${d.name} (เลขที่ ${d.licenseNo})`).join(', ') }),
    },
    {
      question: t('faq.q5'),
      answer: t('faq.a5', { phone: site.phone }),
    },
  ];

  const overrides = await getImageOverrides();
  const pick = (key: string, fallback: string) => overrides.get(key)?.public_id ?? fallback;

  const heroSrc = overrides.has('hero-home') ? pick('hero-home', '') : heroHomePortrait;
  const doctorSrc = pick('doctor-pratch', doctor.image);
  const eeshaSrc = overrides.get('doctor-eesha')?.public_id;
  const visitPhoto = overrides.get('home-visit')?.public_id;

  const posters = promotionPosters
    .map((poster) => {
      const key = posterKeyByDefaultId.get(poster.src);
      const override = key ? overrides.get(key)?.public_id : undefined;
      return override ? { ...poster, src: override } : poster;
    });
  const serviceHeroOverrides = Object.fromEntries(
    serviceCategories.flatMap((category) => {
      const key = categoryImageKey[category.slug];
      const override = overrides.get(key)?.public_id;
      return override ? [[category.slug, override]] : [];
    }),
  );
  // Merged so the carousel's "เริ่มต้น ฿x" reflects prices the clinic edits through /admin.
  const mergedCategories = await getAllMergedCategories();

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(faqSchema(faqs)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(homePageSchema(pick('hero-home', cloudAssets.heroHome))) }}
      />

      {/* ── Hero: full-bleed portrait with overlaid copy ─────── */}
      <section className="relative isolate flex min-h-[60vh] items-end overflow-hidden bg-black text-white md:min-h-[74vh] md:items-center">
        <Image
          src={heroSrc}
          alt=""
          aria-hidden="true"
          fill
          priority
          fetchPriority="high"
          sizes="100vw"
          className="object-cover object-[38%_28%]"
        />
        <div
          aria-hidden="true"
          className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/35 to-black/5 md:bg-gradient-to-r md:from-black/70 md:via-black/25 md:to-transparent"
        />
        <div className="hero-grid absolute inset-0 opacity-[0.1]" aria-hidden="true" />

        <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-6 py-14 sm:px-10 md:grid-cols-[minmax(0,1.55fr)_minmax(15rem,1fr)] md:items-center md:gap-12 md:px-12 md:py-24 lg:px-16">
          <div className="max-w-2xl">
            <div className="hero-enter flex items-center gap-3 text-[0.64rem] uppercase tracking-[0.32em] text-white/60">
              <span aria-hidden="true" className="h-px w-10 bg-mint-glow" />
              {t('hero.subtitle')}
            </div>
            <h1
              lang="en"
              className="hero-enter hero-enter--slow mt-6 font-serif text-[11vw] leading-[0.98] tracking-[-0.03em] text-white sm:text-6xl md:mt-7 md:text-[4rem] md:leading-[0.95] lg:text-[4.7rem]"
            >
              Where thoughtful care
              <br />
              becomes <span className="text-mint-glow">natural</span> beauty.
            </h1>
            <p className="hero-enter hero-enter--later mt-7 max-w-xl text-sm leading-[1.95] text-white/75 md:text-base">
              <span lang="ja" className="text-white/55">
                純粋さは永遠の美へ
              </span>{' '}
              — {t('hero.description')}
            </p>
            <div className="hero-enter hero-enter--later mt-9 flex flex-wrap items-center gap-3">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3 text-sm font-medium text-white shadow-lg shadow-black/10 transition-transform duration-300 hover:-translate-y-0.5 hover:bg-forest active:translate-y-0"
              >
                <LineIcon className="size-4" />
                {t('hero.bookLine')} <ArrowUpRight className="size-4" />
              </a>
              <Link
                href="/services"
                className="inline-flex items-center rounded-full border border-white/35 px-7 py-3 text-sm font-medium text-white transition-colors duration-200 hover:border-white/70 hover:bg-white/10"
              >
                {t('hero.viewAllServices')}
              </Link>
            </div>
          </div>


        </div>
      </section>

      {/* ── Trust strip: verifiable credibility signals ──────── */}
      <section className="border-b border-black/[0.08] bg-[var(--store-surface)]">
        <ul className="mx-auto grid max-w-6xl grid-cols-2 gap-x-6 gap-y-6 px-6 py-7 text-[var(--store-ink)] sm:px-10 md:grid-cols-4 md:gap-8 md:px-12">
          {[
            { icon: Stethoscope, label: t('trust.doctor'), sub: t('trust.doctorSub') },
            { icon: BadgeCheck, label: t('trust.license'), sub: site.license },
            { icon: MapPin, label: t('trust.location'), sub: t('trust.locationSub') },
            { icon: Clock, label: t('trust.openDaily'), sub: site.hoursDisplay.short },
          ].map(({ icon: Icon, label, sub }) => (
            <li key={label} className="flex items-center gap-3">
              <Icon className="size-5 shrink-0 text-[#06C755]" strokeWidth={1.5} aria-hidden="true" />
              <div className="min-w-0">
                <p className="text-[0.8rem] font-medium leading-tight">{label}</p>
                <p className="mt-0.5 text-[0.72rem] leading-tight text-[var(--store-muted)]">{sub}</p>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* ── Services: Apple-inspired media stream ────────────── */}
      <section className="apple-services-section overflow-hidden">
        <Reveal className="apple-services-heading">
          <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
            <h2>{t('services.title')}</h2>
            <Link
              href="/services"
              className="group inline-flex shrink-0 items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
            >
              {t('services.viewAll')}{' '}
              <ArrowUpRight className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
            </Link>
          </div>
          <p>{t('services.description')}</p>
          <p className="text-[0.72rem] leading-relaxed text-[var(--store-muted)]">
            {t('services.note')}
          </p>
        </Reveal>

        <ServiceCarousel categories={mergedCategories} heroOverrides={serviceHeroOverrides} />
      </section>

      {/* ── Brand & technology strip: the brands behind the services above ──────── */}
      <BrandStrip />

      {/* ── Physicians: Apple-style cards, photo on top ──────── */}
      <section className="bg-[var(--store-surface)] px-4 py-12 md:px-6 md:py-20">
        <Reveal className="mx-auto mb-10 flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-3 md:mb-12">
          <div>
            <h2 className="font-serif text-4xl text-[var(--store-ink)] md:text-5xl">{t('team.title')}</h2>
            <p className="mt-4 max-w-2xl text-sm leading-[1.8] text-[var(--store-muted)]">
              {t('team.description')}
            </p>
          </div>
          <Link
            href="/about"
            className="group inline-flex items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
          >
            ดูทีมแพทย์ทั้งหมด{' '}
            <ArrowUpRight className="size-4 transition-transform duration-200 motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
          </Link>
        </Reveal>

        {/* Two tall cards stacked ate the whole screen on mobile — swipe them left/right instead
            (like the promotions shelf), collapsing back to a two-up grid from md. */}
        <div className="home-swipe-rail -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 md:mx-auto md:grid md:max-w-6xl md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          <div className="w-[85%] shrink-0 snap-center md:w-auto md:shrink">
            <PhysicianPanel
              label="The Lead Physician"
              name={doctor.nameTh}
              nameSecondary={doctor.name}
              role={doctor.role}
              licenseNo={doctor.licenseNo}
              summary={doctor.summary}
              expertise={doctor.expertise}
              languages={doctor.languages}
              imageSrc={doctorSrc}
              imageAlt={`${doctor.nameTh} ${doctor.role} ของ ${site.name}`}
            />
          </div>
          <div className="w-[85%] shrink-0 snap-center md:w-auto md:shrink">
            <PhysicianPanel
              label="Clinic Physician"
              name={doctorEesha.name}
              nameSecondary={doctorEesha.nameTh}
              role={doctorEesha.role}
              licenseNo={doctorEesha.licenseNo}
              summary={doctorEesha.summary}
              expertise={doctorEesha.expertise}
              languages={doctorEesha.languages}
              imageSrc={eeshaSrc}
              imageAlt={`${doctorEesha.name} ${doctorEesha.role} ของ ${site.name}`}
              delay={80}
            />
          </div>
        </div>
      </section>

      {/* ── Promotions: Apple-style peeking carousel ─────────── */}
      <section className="apple-promotion-section overflow-hidden">
        <Reveal className="apple-promotion-heading">
          <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
              <h2 className="text-[1.35rem] font-semibold tracking-[-0.025em] md:text-[1.55rem]">
                {t('promotions.title')}
              </h2>
              <p className="text-[1.15rem] tracking-[-0.02em] md:text-[1.3rem]">
                {t('promotions.subtitle')}
              </p>
            </div>
            <Link
              href="/promotions"
              className="inline-flex shrink-0 items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
            >
              {t('promotions.viewAll')} <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </Reveal>

        <Reveal>
          <PromotionCardGrid
            posters={posters}
          />
        </Reveal>
      </section>

      {/* ── Location: Apple-style accordion card ─────────────── */}
      <section className="bg-[var(--background)] py-20 md:py-32">
        <div className="mx-auto max-w-6xl px-4 md:px-6">
          <Reveal className="mb-8 flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
            <h2 className="font-serif text-4xl text-[var(--store-ink)] md:text-5xl">{t('visit.title')}</h2>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
            >
              {t('visit.openMaps')} <ArrowUpRight className="size-4" />
            </a>
          </Reveal>

          <Reveal delay={80} className="overflow-hidden rounded-[1.75rem] bg-[var(--store-surface)]">
            <div className="grid grid-cols-1 md:grid-cols-2">
              {/* Left: intro + accordion */}
              <div className="flex flex-col justify-center px-7 py-10 sm:px-12 md:py-14 lg:px-16">
                <p className="max-w-md text-sm leading-[1.9] text-[var(--store-muted)]">
                  {t('visit.description')}
                </p>
                <div className="mt-8">
                  <details open className="visit-accordion group border-t border-[var(--store-control)]/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-serif text-xl text-[var(--store-ink)] md:text-2xl">{t('visit.location')}</span>
                      <ChevronDown className="size-5 text-[var(--store-muted)] transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="pb-6 pr-6 text-sm leading-[1.9] text-[var(--store-muted)]">
                      <a href={site.mapsUrl} target="_blank" rel="noopener" className="transition-colors hover:text-forest">
                        {site.addressFull}
                      </a>
                    </div>
                  </details>

                  <details className="visit-accordion group border-t border-[var(--store-control)]/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-serif text-xl text-[var(--store-ink)] md:text-2xl">{t('visit.hours')}</span>
                      <ChevronDown className="size-5 text-[var(--store-muted)] transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="pb-6 pr-6 text-sm leading-[1.9] text-[var(--store-muted)]">
                      {site.hoursDisplay.weekdays}
                      <br />
                      {site.hoursDisplay.sunday}
                    </div>
                  </details>

                  <details className="visit-accordion group border-y border-[var(--store-control)]/70">
                    <summary className="flex cursor-pointer list-none items-center justify-between py-5 [&::-webkit-details-marker]:hidden">
                      <span className="font-serif text-xl text-[var(--store-ink)] md:text-2xl">{t('visit.contact')}</span>
                      <ChevronDown className="size-5 text-[var(--store-muted)] transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <div className="space-y-1.5 pb-6 pr-6 text-sm leading-[1.9] text-[var(--store-muted)]">
                      <a href={site.phoneUrl} className="block transition-colors hover:text-forest">
                        {site.phone}
                      </a>
                      <a href={site.lineUrl} target="_blank" rel="noopener" className="block transition-colors hover:text-forest">
                        {t('visit.line')}
                      </a>
                    </div>
                  </details>
                </div>
              </div>

              {/* Right: clinic photo / map */}
              <div className="relative order-first min-h-[16rem] bg-[var(--store-card)] md:order-last md:min-h-[30rem]">
                {visitPhoto ? (
                  <Image
                    src={visitPhoto}
                    alt={`หน้าคลินิก ${site.name}`}
                    fill
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  // No clinic photo uploaded yet — show the real embedded map instead of a
                  // placeholder icon. Uploading a photo via /admin (home-visit) takes over.
                  <iframe
                    src={site.mapsEmbedUrl}
                    title={`แผนที่ ${site.name} — ${site.addressFull}`}
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    allowFullScreen
                    className="absolute inset-0 size-full border-0"
                  />
                )}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Reviews + FAQ: paired two-column block ───────────── */}
      <section className="bg-[var(--store-surface)] px-4 py-20 md:px-6 md:py-32">
        {/* Reviews + FAQ stacked ran long on mobile — swipe between them, two-up grid from md. */}
        <div className="home-swipe-rail -mx-4 flex snap-x snap-mandatory items-stretch gap-4 overflow-x-auto px-4 pb-2 md:mx-auto md:grid md:max-w-6xl md:grid-cols-2 md:gap-5 md:overflow-visible md:px-0 md:pb-0">
          {/* Reviews — voice of our patients */}
          <Reveal className="h-full w-[88%] shrink-0 snap-center md:w-auto md:shrink">
            <div className="apple-doctor-card flex h-full flex-col rounded-[1.75rem] bg-[var(--store-card)] px-8 py-10 text-[var(--store-ink)] sm:px-10 md:py-12">
              <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-3">
                <h2 className="font-serif text-3xl text-[var(--store-ink)] md:text-4xl">{t('reviews.title')}</h2>
                <Link
                  href="/reviews"
                  className="inline-flex shrink-0 items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
                >
                  {t('reviews.viewAll')} <ArrowUpRight className="size-4" />
                </Link>
              </div>
              <p className="mt-4 max-w-md text-sm leading-[1.9] text-[var(--store-muted)]">
                {t('reviews.description')}
              </p>
              <p className="mt-3 text-xs text-[var(--store-muted)]">
                {t('reviews.disclaimer')}
              </p>
              <div className="mt-auto flex flex-wrap gap-3 pt-8">
                <a
                  href={site.mapsUrl}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2.5 rounded-full border border-black/10 bg-white px-7 py-3 text-sm font-medium text-[var(--store-ink)] transition-colors duration-200 hover:bg-black/5"
                >
                  <GoogleIcon className="size-4" />
                  {t('reviews.google')} <ArrowUpRight className="size-4" />
                </a>
                <a
                  href={site.instagram}
                  target="_blank"
                  rel="noopener"
                  className="inline-flex items-center gap-2.5 rounded-full border border-black/20 px-7 py-3 text-sm font-medium text-[var(--store-ink)] transition-colors duration-200 hover:bg-[var(--store-ink)] hover:text-white"
                >
                  <InstagramIcon className="text-instagram size-4" />
                  Instagram {site.instagramHandle} <ArrowUpRight className="size-4" />
                </a>
              </div>
            </div>
          </Reveal>

          {/* FAQ — accordion (content + FAQPage schema parity) */}
          <Reveal delay={80} className="h-full w-[88%] shrink-0 snap-center md:w-auto md:shrink">
            <div className="apple-doctor-card flex h-full flex-col rounded-[1.75rem] bg-[var(--store-card)] px-8 py-10 text-[var(--store-ink)] sm:px-10 md:py-12">
              <div className="flex items-center gap-3 text-[0.66rem] uppercase tracking-[0.22em] text-forest">
                <span aria-hidden="true" className="h-px w-10 bg-forest" /> {t('reviews.faq')}
              </div>
              <dl className="mt-4 border-t border-black/10">
                {faqs.map((f, index) => (
                  <details
                    key={f.question}
                    open={index === 0}
                    className="visit-accordion group border-b border-black/10"
                  >
                    <summary className="flex cursor-pointer list-none items-start gap-3 py-4 [&::-webkit-details-marker]:hidden">
                      <span className="mt-1 font-sans text-xs tracking-[0.15em] text-forest">0{index + 1}</span>
                      <dt className="flex-1 font-serif text-base leading-snug text-[var(--store-ink)] md:text-lg">
                        {f.question}
                      </dt>
                      <ChevronDown className="mt-1 size-4 shrink-0 text-[var(--store-muted)] transition-transform duration-300 group-open:rotate-180" />
                    </summary>
                    <dd className="pb-5 pl-9 pr-2 text-sm leading-relaxed text-[var(--store-muted)]">{f.answer}</dd>
                  </details>
                ))}
              </dl>
            </div>
          </Reveal>
        </div>
      </section>

    </>
  );
}
