import type { Metadata } from 'next';
import { EB_Garamond, Noto_Sans_Thai } from 'next/font/google';
import { jsonLdHtml } from '@/lib/json-ld';
import Header from '@/components/Header';
import { configuredProviders } from '@/lib/members/oauth';
import Footer from '@/components/Footer';
import { MobileContactBar } from '@/components/mobile-contact-bar';
import { GoogleAnalytics } from '@/components/google-analytics';
import { clinicSchema, websiteSchema } from '@/lib/schema';
import { getImage } from '@/lib/site-images-store';
import { site, localizedAlternates } from '@/lib/site';
import { siteSocialImage } from '@/lib/metadata-images';
import { cn } from '@/lib/utils';
import { IntlBoundary } from '@/components/intl-boundary';
import { LAYOUT_CLIENT_NAMESPACES } from '@/i18n/client-namespaces';

/**
 * Chrome for the public site. It lives here rather than in the root layout so /admin doesn't
 * inherit it — the clinic's staff shouldn't be managing images underneath a "จองคิว LINE"
 * button, and the MedicalBusiness/WebSite JSON-LD describes the public site, not the CMS.
 *
 * A route group adds no path segment, so every URL is exactly what it was.
 */
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '../../globals.css';

// `preload: false` on both families is deliberate and measured (2026-08-03). next/font otherwise
// emits <link rel="preload"> for three woff2 files (99KB) that the browser fetches at High priority
// 1-3ms BEFORE the hero image — and the home page's LCP element IS that image, at only 24KB. On
// Lighthouse's Slow-4G model the image lost the bandwidth race and its Load Time phase was 3.5s.
// Fonts still load from the CSS @font-face; they just stop outranking the LCP element. Text has no
// visible flash because next/font's `adjustFontFallback` (on by default for Google fonts) inserts a
// size-adjusted local fallback, which is also why CLS stays at 0 — verify both if you change this.
const serif = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600'],
  preload: false,
});

// Noto Sans Thai is required — Geist/other Latin-only fonts silently fall back for Thai glyphs.
// Weight 300 is not loaded: the only three `font-light` usages in the codebase are on service/
// category pages, and each pairs it with `italic` on a Latin `lang="en"` span, so they render from
// the serif stack anyway. Dropping it removes a whole Thai weight file from the build.
const sans = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-sans',
  weight: ['400', '500', '600'],
  preload: false,
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'SiteLayout' });
  const socialImage = await siteSocialImage(
    'hero-home',
    t('socialImageAlt', { siteName: site.name }),
  );

  return {
    metadataBase: new URL(site.url),
    title: {
      default: t('defaultTitle', { siteName: site.name }),
      template: `%s — ${site.name}`,
    },
    description: t('description', { siteName: site.name }),
    alternates: localizedAlternates(locale),
    // No `shortcut` entry: it emits a second <link rel="shortcut icon"> for the *same* URL as
    // `icon`, and Chrome treats the two rels as separate requests — measured 2026-08-03, /icon.png
    // was fetched twice at High priority. `rel="shortcut icon"` is a legacy IE alias that no
    // supported browser needs, so the duplicate bought nothing.
    icons: {
      icon: [{ url: '/icon.png', type: 'image/png', sizes: '64x64' }],
      apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
    },
    openGraph: {
      title: site.name,
      description: t('description', { siteName: site.name }),
      url: site.url,
      siteName: site.name,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'th_TH',
      ...(socialImage && { images: [socialImage] }),
    },
    twitter: {
      card: socialImage ? 'summary_large_image' : 'summary',
      title: site.name,
      description: t('description', { siteName: site.name }),
      ...(socialImage && { images: [socialImage.url] }),
    },
  };
}

export default async function SiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }
  
  setRequestLocale(locale);
  // One cached D1 read resolves all three slots. Keeping these in the public layout makes the
  // admin-controlled logo and business schema consistent on every public route.
  const [brandMark, brandLogo, heroImage] = await Promise.all([
    getImage('brand-mark'),
    getImage('brand-logo'),
    getImage('hero-home'),
  ]);
  const businessSchema = clinicSchema({
    imagePublicId: heroImage,
    logoPublicId: brandLogo,
    locale,
  });
  const siteDescription = locale === 'en' ? site.descriptionEn : site.description;

  return (
    <html lang={locale} className={cn(serif.variable, sans.variable)}>
      {/* Nearly every hero/LCP image on the site resolves through res.cloudinary.com
          (lib/cloud.ts) — without this hint the browser can't start DNS/TLS/TCP setup for that
          origin until it parses the <img> tag referencing it, adding a full connection handshake
          in front of every LCP image request. Next.js hoists direct <link> children into <head>. */}
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <body className="font-sans">
        <IntlBoundary namespaces={LAYOUT_CLIENT_NAMESPACES}>
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: jsonLdHtml(businessSchema) }}
          />
          <script
            type="application/ld+json"
            // eslint-disable-next-line react/no-danger
            dangerouslySetInnerHTML={{ __html: jsonLdHtml(websiteSchema) }}
          />
          <Header logoMark={brandMark} oauthProviders={configuredProviders()} />
          <main>{children}</main>
          <Footer logoMark={brandMark} description={siteDescription} />
          <MobileContactBar />
        </IntlBoundary>
        {/* Renders nothing until GA_MEASUREMENT_ID is set — see the component for the cost. */}
        <GoogleAnalytics />
      </body>
    </html>
  );
}
