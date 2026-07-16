import type { Metadata } from 'next';
import { MapPin, Phone, Clock, MessageCircle, AtSign, Navigation } from 'lucide-react';
import { site } from '@/lib/site';
import { cld, cloudAssets } from '@/lib/cloud';
import { breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';

// Derived from the Cloudinary hero rather than a file in public/ — the previous
// `/images/og/contact.jpg` was never actually added, so every share of this page
// rendered with no preview image at all.
const ogImage = cld(cloudAssets.heroIvDrip2, {
  width: 1200,
  height: 630,
  crop: 'fill',
  gravity: 'auto',
});

export const metadata: Metadata = {
  title: 'ติดต่อเรา',
  description: `ที่อยู่ เบอร์โทร และเวลาทำการของ ${site.name} ย่านสุขุมวิท กรุงเทพฯ`,
  alternates: { canonical: `${site.url}/contact` },
  openGraph: {
    title: `ติดต่อเรา — ${site.name}`,
    description: site.description,
    url: `${site.url}/contact`,
    type: 'website',
    images: [{ url: ogImage, width: 1200, height: 630 }],
  },
};

export default function ContactPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'ติดต่อเรา', path: '/contact' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHero
        eyebrow="Contact Us"
        title="ติดต่อเรา"
        lead={`${site.name} ยินดีให้คำปรึกษาและดูแลทุกหัตถการ — นัดหมายหรือสอบถามได้ทุกวัน`}
        breadcrumb={[{ name: 'หน้าหลัก', href: '/' }, { name: 'ติดต่อเรา' }]}
      />

      <section className="mx-auto grid max-w-6xl gap-12 px-6 py-20 md:grid-cols-2">
        <Reveal>
          <ul className="space-y-6 text-ink/75">
            <li className="flex items-start gap-3">
              <MapPin className="mt-0.5 size-5 shrink-0 text-olive" />
              <a href={site.mapsUrl} target="_blank" rel="noopener" className="hover:text-olive">
                {site.addressFull}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-olive" />
              <a href={site.phoneUrl} className="hover:text-olive">
                โทร {site.phone}
              </a>
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-olive" />
              <span>
                {site.hoursDisplay.weekdays}
                <br />
                {site.hoursDisplay.sunday}
              </span>
            </li>
          </ul>
          <div className="mt-8 flex flex-wrap gap-3">
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
            <Button
              render={<a href={site.mapsUrl} target="_blank" rel="noopener" />}
              variant="outline"
              className="rounded-full border-olive text-olive-deep hover:bg-olive/10"
            >
              <Navigation className="size-4" />
              เปิด Google Maps
            </Button>
          </div>
        </Reveal>
        <Reveal delay={80} className="overflow-hidden rounded-2xl border border-olive/15">
          <iframe
            src={site.mapsEmbedUrl}
            width="100%"
            height="380"
            style={{ border: 0 }}
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            title={`แผนที่ ${site.name}`}
          />
        </Reveal>
      </section>
    </>
  );
}
