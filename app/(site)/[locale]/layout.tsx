import type { Metadata } from 'next';
import { EB_Garamond, Noto_Sans_Thai } from 'next/font/google';
import { jsonLdHtml } from '@/lib/json-ld';
import Header from '@/components/Header';
import { configuredProviders } from '@/lib/members/oauth';
import Footer from '@/components/Footer';
import { MobileContactBar } from '@/components/mobile-contact-bar';
import { clinicSchema, websiteSchema } from '@/lib/schema';
import { getImage } from '@/lib/site-images-store';
import { site, localizedAlternates } from '@/lib/site';
import { siteSocialImage } from '@/lib/metadata-images';
import { cn } from '@/lib/utils';

/**
 * Chrome for the public site. It lives here rather than in the root layout so /admin doesn't
 * inherit it — the clinic's staff shouldn't be managing images underneath a "จองคิว LINE"
 * button, and the MedicalBusiness/WebSite JSON-LD describes the public site, not the CMS.
 *
 * A route group adds no path segment, so every URL is exactly what it was.
 */
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { routing } from '@/i18n/routing';
import { notFound } from 'next/navigation';
import '../../globals.css';

const serif = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600'],
});

// Noto Sans Thai is required — Geist/other Latin-only fonts silently fall back for Thai glyphs.
const sans = Noto_Sans_Thai({
  subsets: ['thai', 'latin'],
  variable: '--font-sans',
  weight: ['300', '400', '500', '600'],
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
  const socialImage = await siteSocialImage('hero-home', `${site.name} คลินิกความงามสุขุมวิท`);

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — สถานเสริมความงาม สุขุมวิท กรุงเทพฯ`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    alternates: localizedAlternates(locale),
    icons: {
      icon: [{ url: '/icon.png', type: 'image/png', sizes: '64x64' }],
      shortcut: ['/icon.png'],
      apple: [{ url: '/apple-icon.png', type: 'image/png', sizes: '180x180' }],
    },
    openGraph: {
      title: site.name,
      description: site.description,
      url: site.url,
      siteName: site.name,
      type: 'website',
      locale: locale === 'en' ? 'en_US' : 'th_TH',
      ...(socialImage && { images: [socialImage] }),
    },
    twitter: {
      card: socialImage ? 'summary_large_image' : 'summary',
      title: site.name,
      description: site.description,
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
  });

  const messages = await getMessages();

  return (
    <html lang={locale} className={cn(serif.variable, sans.variable)}>
      {/* Nearly every hero/LCP image on the site resolves through res.cloudinary.com
          (lib/cloud.ts) — without this hint the browser can't start DNS/TLS/TCP setup for that
          origin until it parses the <img> tag referencing it, adding a full connection handshake
          in front of every LCP image request. Next.js hoists direct <link> children into <head>. */}
      <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
      <body className="font-sans">
        <NextIntlClientProvider messages={messages}>
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
          <Footer logoMark={brandMark} />
          <MobileContactBar />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
