import { jsonLdHtml } from '@/lib/json-ld';
import type { Metadata } from 'next';
import Image from 'next/image';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { Phone, ArrowRight, Navigation, ShieldCheck, Lock, Map as MapIcon } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { breadcrumbSchema } from '@/lib/schema';
import { siteSocialImage } from '@/lib/metadata-images';
import { getImage } from '@/lib/site-images-store';
import { Reveal } from '@/components/reveal';
import { BookingForm } from '@/components/booking-form';
import { LineIcon, InstagramIcon } from '@/components/brand-icons';

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'ContactPage' });
  const pageTitle = t('metaTitle');
  const pageDescription = t('metaDescription', { siteName: site.name });

  const socialImage = await siteSocialImage('hero-contact', `${site.name} ${pageTitle}`);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/contact` },
    openGraph: {
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/contact`,
      type: 'website',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      images: [socialImage.url],
    },
  };
}

/** One channel card in the contact hub — icon, label, value, blurb, and an arrow CTA. */
function HubCard({
  icon,
  label,
  value,
  desc,
  cta,
  href,
  external,
  iconClassName,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  desc: string;
  cta: string;
  href: string;
  external?: boolean;
  iconClassName?: string;
}) {
  return (
    <div className="group flex h-full flex-col items-center text-center gap-6 rounded-3xl border border-border bg-card p-10 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl md:p-12">
      <span className={`flex size-12 shrink-0 items-center justify-center rounded-full ${iconClassName || 'bg-foreground/5 text-foreground'}`}>
        {icon}
      </span>
      <div className="space-y-2">
        <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-foreground/45">{label}</p>
        <p className="text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      </div>
      <p className="text-[0.95rem] leading-[1.6] text-foreground/60">{desc}</p>
      <a
        href={href}
        {...(external ? { target: '_blank', rel: 'noopener' } : {})}
        className="mt-auto inline-flex items-center gap-1.5 text-[0.95rem] font-medium text-foreground transition-all group-hover:gap-2.5"
      >
        {cta}
        <ArrowRight className="size-4" />
      </a>
    </div>
  );
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('ContactPage');
  const tHome = await getTranslations('HomePage');

  const heroImage = await getImage('hero-contact');

  const breadcrumb = breadcrumbSchema([
    { name: tHome('Navigation.home'), path: '/' },
    { name: t('breadcrumb'), path: '/contact' },
  ]);

  // Hours come straight from the single source (lib/site.ts) — only the row labels are translated.
  const weekday = site.hours[0];
  const sunday = site.hours[6];
  const hoursRows = [
    { label: t('hoursRows.weekdays'), value: `${weekday.open} – ${weekday.close}` },
    { label: t('hoursRows.sunday'), value: `${sunday.open} – ${sunday.close}`, accent: true },
  ];

  const trust = [
    { icon: <ShieldCheck className="size-5" strokeWidth={1.5} />, title: t('trust.certified.title'), desc: t('trust.certified.desc') },
    { icon: <Lock className="size-5" strokeWidth={1.5} />, title: t('trust.privacy.title'), desc: t('trust.privacy.desc') },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: jsonLdHtml(breadcrumb) }}
      />

      {/* ── Cinematic hero ─────────────────────────────────────── */}
      <section className="relative flex min-h-[80vh] items-end overflow-hidden bg-foreground">
        {heroImage && (
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
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
        <div className="relative z-10 mx-auto w-full max-w-[1200px] px-[20px] pb-24 pt-44 text-white md:px-8">
          <Reveal>
            <h1 className="max-w-3xl text-5xl font-bold leading-[1.1] tracking-tight md:text-7xl">
              {t('hero.title')}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-[1.55] text-white/80">
              {t('hero.lead', { siteName: site.name })}
            </p>
          </Reveal>
        </div>
      </section>

      {/* ── Contact hub ────────────────────────────────────────── */}
      <section className="mx-auto max-w-[1200px] px-[20px] py-24 md:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          <Reveal>
            <HubCard
              icon={<Phone className="size-5" strokeWidth={1.5} />}
              label={t('hub.phone.label')}
              value={site.phone}
              desc={t('hub.phone.desc')}
              cta={t('hub.phone.cta')}
              href={site.phoneUrl}
            />
          </Reveal>
          <Reveal delay={80}>
            <HubCard
              icon={<LineIcon className="size-5" />}
              label={t('hub.line.label')}
              value={t('hub.line.value')}
              desc={t('hub.line.desc')}
              cta={t('hub.line.cta')}
              href={site.lineUrl}
              external
              iconClassName="bg-[#00B900]/10 text-[#00B900]"
            />
          </Reveal>
          <Reveal delay={160}>
            <HubCard
              icon={<InstagramIcon className="size-5" />}
              label={t('hub.instagram.label')}
              value={site.instagramHandle}
              desc={t('hub.instagram.desc')}
              cta={t('hub.instagram.cta')}
              href={site.instagram}
              external
              iconClassName="bg-[#E1306C]/10 text-[#E1306C]"
            />
          </Reveal>
        </div>

        {/* Flagship address — dark tonal block, the anchor of the hub. */}
        <Reveal>
          <div className="mt-8 flex flex-col items-start justify-between gap-8 rounded-3xl bg-foreground p-12 text-white md:flex-row md:items-center">
            <div className="space-y-4">
              <p className="text-[0.72rem] font-semibold uppercase tracking-[0.16em] text-white/50">
                {t('address.eyebrow')}
              </p>
              <h2 className="max-w-xl text-2xl font-semibold leading-[1.5] tracking-tight md:text-3xl">
                {site.addressFull}
              </h2>
            </div>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex shrink-0 items-center gap-2 rounded-full bg-background px-8 py-4 text-sm font-semibold text-foreground transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              <Navigation className="size-4" />
              {t('address.cta')}
            </a>
          </div>
        </Reveal>
      </section>

      {/* ── Inquiry form ───────────────────────────────────────── */}
      <section className="bg-sand py-32">
        <div className="mx-auto grid max-w-[1200px] items-start gap-16 px-[20px] md:px-8 lg:grid-cols-2 lg:gap-24">
          <Reveal>
            <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
              {t('form.title')}
            </h2>
            <p className="mt-8 max-w-md text-lg leading-[1.6] text-foreground/60">
              {t('form.desc')}
            </p>

            <div className="mt-12 space-y-8">
              {trust.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <span className="mt-0.5 text-forest">{item.icon}</span>
                  <div>
                    <h3 className="font-semibold text-foreground">{item.title}</h3>
                    <p className="mt-1 text-[0.95rem] leading-[1.55] text-foreground/55">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <p className="mt-12 text-[0.8rem] text-foreground/45">
              {t('license', { license: site.license })}
            </p>
          </Reveal>

          <div id="booking" className="scroll-mt-32">
            <Reveal delay={80}>
              <BookingForm interests={serviceCategories.map((category) => category.title)} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Visit us — hours + map ─────────────────────────────── */}
      <section className="py-32">
        <div className="mx-auto grid max-w-[1200px] items-center gap-12 px-[20px] md:grid-cols-12 md:px-8">
          <Reveal className="space-y-12 md:col-span-5">
            <div>
              <h2 className="text-4xl font-bold tracking-tight text-foreground md:text-5xl">
                {t('visit.title')}
              </h2>
            </div>

            <div className="space-y-2">
              {hoursRows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center justify-between border-b border-border py-4"
                >
                  <span className="font-medium text-foreground">{row.label}</span>
                  <span className={row.accent ? 'font-semibold text-forest' : 'text-foreground/55'}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener"
              className="inline-flex items-center gap-2.5 rounded-full bg-foreground px-8 py-4 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95"
            >
              <MapIcon className="size-4" />
              {t('visit.cta')}
            </a>
          </Reveal>

          <Reveal delay={80} className="md:col-span-7">
            <div className="relative h-[500px] overflow-hidden rounded-3xl shadow-2xl">
              <iframe
                src={site.mapsEmbedUrl}
                className="absolute inset-0 size-full"
                style={{ border: 0 }}
                loading="lazy"
                referrerPolicy="strict-origin-when-cross-origin"
                allowFullScreen
                title={t('mapTitle', { siteName: site.name })}
              />
              <div className="pointer-events-none absolute inset-0 bg-foreground/[0.03]" />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
