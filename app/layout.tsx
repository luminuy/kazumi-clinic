import type { Metadata } from 'next';
import { EB_Garamond, Noto_Sans_Thai } from 'next/font/google';
import { site } from '@/lib/site';
import { clinicSchema } from '@/lib/schema';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import './globals.css';

const serif = EB_Garamond({
  subsets: ['latin'],
  variable: '--font-serif',
  weight: ['400', '500', '600'],
});

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
    images: [{ url: `${site.url}/images/og/default.jpg`, width: 1200, height: 630 }],
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
    images: [`${site.url}/images/og/default.jpg`],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="th" className={`${serif.variable} ${sans.variable}`}>
      <body className="font-sans">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger
          dangerouslySetInnerHTML={{ __html: JSON.stringify(clinicSchema) }}
        />
        <Header />
        <main>{children}</main>
        <Footer />
      </body>
    </html>
  );
}
