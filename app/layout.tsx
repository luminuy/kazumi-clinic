import type { Metadata } from 'next';
import { EB_Garamond, Noto_Sans_Thai } from 'next/font/google';
import { site } from '@/lib/site';
import { clinicSchema, websiteSchema } from '@/lib/schema';
import { cld, cloudAssets } from '@/lib/cloud';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { MobileContactBar } from '@/components/mobile-contact-bar';
import { cn } from '@/lib/utils';
import './globals.css';

const ogDefault = cld(cloudAssets.heroHome, { width: 1200, height: 630, crop: 'fill' });

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} — สถานเสริมความงาม สุขุมวิท กรุงเทพฯ`,
    template: `%s — ${site.name}`,
  },
  description: site.description,
  alternates: { canonical: site.url },
  openGraph: {
    title: site.name,
    description: site.description,
    url: site.url,
    siteName: site.name,
    type: 'website',
    locale: 'th_TH',
    images: [{ url: ogDefault, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: [ogDefault],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={cn(serif.variable, sans.variable)}>
      <body className="pb-16 font-sans md:pb-0">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
        />
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
        <MobileContactBar />
      </body>
    </html>
  );
}
