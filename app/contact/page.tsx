import type { Metadata } from 'next';
import { MapPin, Phone, Clock, MessageCircle, AtSign } from 'lucide-react';
import { site, hoursLines } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';

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
              {site.addressFull}
            </li>
            <li className="flex items-center gap-3">
              <Phone className="size-5 shrink-0 text-olive" />
              โทร {site.phone}
            </li>
            <li className="flex items-start gap-3">
              <Clock className="mt-0.5 size-5 shrink-0 text-olive" />
              <span>
                {hoursLines().map((line) => (
                  <span key={line.days} className="block">
                    {line.days} {line.time}
                  </span>
                ))}
              </span>
            </li>
          </ul>
          <div className="mt-8 flex gap-4">
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
        </Reveal>
        <Reveal delay={80} className="overflow-hidden rounded-2xl border border-olive/15">
          <iframe
            src={mapSrc}
            width="100%"
            height="380"
            style={{ border: 0 }}
            loading="lazy"
            title={`แผนที่ ${site.name}`}
          />
        </Reveal>
      </section>
    </>
  );
}
