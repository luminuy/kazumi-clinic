import type { Metadata } from 'next';
import { EB_Garamond, Noto_Sans_Thai } from 'next/font/google';
import { site } from '@/lib/site';
import { siteSocialImage } from '@/lib/metadata-images';
import { cn } from '@/lib/utils';
import './globals.css';

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

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage(
    'hero-home',
    `${site.name} คลินิกความงามสุขุมวิท`,
  );

  return {
    metadataBase: new URL(site.url),
    title: {
      default: `${site.name} — สถานเสริมความงาม สุขุมวิท กรุงเทพฯ`,
      template: `%s — ${site.name}`,
    },
    description: site.description,
    alternates: { canonical: site.url },
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
      locale: 'th_TH',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: site.name,
      description: site.description,
      images: [socialImage.url],
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={cn(serif.variable, sans.variable)}>
      {/* Only the document shell lives here — the public site's header, footer and JSON-LD are
          in app/(site)/layout.tsx so /admin renders without them. */}
      <body className="font-sans">{children}</body>
    </html>
  );
}
