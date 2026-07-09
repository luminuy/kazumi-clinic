import type { Metadata } from 'next';
import Link from 'next/link';
import { MapPin, Phone, Clock, MessageCircle, AtSign } from 'lucide-react';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'ติดต่อเรา',
  description: `ที่อยู่ เบอร์โทร และเวลาทำการของ ${site.name} ย่านสุขุมวิท กรุงเทพฯ`,
  alternates: { canonical: `${site.url}/contact` },
  openGraph: {
    title: `ติดต่อเรา — ${site.name}`,
    description: site.description,
    url: `${site.url}/contact`,
    type: 'website',
    images: [{ url: `${site.url}/images/og/contact.jpg`, width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'ติดต่อเรา', path: '/contact' },
  ]);

  const mapSrc = `https://www.google.com/maps?q=${site.geo.lat},${site.geo.lng}&z=16&output=embed`;

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <nav className="mx-auto max-w-6xl px-6 pt-8 text-xs text-ink/50">
        <Link href="/" className="hover:text-olive">
          หน้าหลัก
        </Link>{' '}
        / <span className="text-ink/70">ติดต่อเรา</span>
      </nav>

      <section className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-2">
        <div>
          <h1 className="font-serif text-3xl text-olive-deep md:text-4xl">ติดต่อเรา</h1>
          <p className="mt-6 flex items-start gap-2 text-ink/70">
            <MapPin className="mt-0.5 size-4 shrink-0 text-olive" />
            {site.addressFull}
          </p>
          <ul className="mt-6 space-y-2 text-sm text-ink/70">
            <li className="flex items-center gap-2">
              <Phone className="size-4 shrink-0 text-olive" />
              โทร: {site.phone}
            </li>
            <li className="flex items-center gap-2">
              <Clock className="size-4 shrink-0 text-olive" />
              เวลาทำการ: จันทร์–เสาร์ 9:00–22:00, อาทิตย์ 9:00–17:00
            </li>
          </ul>
          <div className="mt-6 flex gap-4">
            <Button
              render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
              className="rounded-full bg-line text-white hover:bg-line/90"
            >
              <MessageCircle className="size-4" />
              LINE
            </Button>
            <Button
              render={<a href={site.instagram} target="_blank" rel="noopener" />}
              variant="outline"
              className="rounded-full border-olive text-olive-deep hover:bg-olive/10"
            >
              <AtSign className="size-4" />
              Instagram
            </Button>
          </div>
        </div>
        <div className="overflow-hidden rounded-2xl border border-olive/15">
          <iframe
            src={mapSrc}
            width="100%"
            height="360"
            style={{ border: 0 }}
            loading="lazy"
            title={`แผนที่ ${site.name}`}
          />
        </div>
      </section>
    </>
  );
}
