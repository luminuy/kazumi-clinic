import type { Metadata } from 'next';
import { MapPin, Phone, Clock, Navigation } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { breadcrumbSchema } from '@/lib/schema';
import { siteSocialImage } from '@/lib/metadata-images';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';
import { BookingForm } from '@/components/booking-form';
import { LineIcon, InstagramIcon } from '@/components/brand-icons';

const pageTitle = 'ติดต่อเรา';
const pageDescription = `ที่อยู่ เบอร์โทร และเวลาทำการของ ${site.name} ย่านสุขุมวิท กรุงเทพฯ`;

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage('hero-iv-drip-2', `ติดต่อ ${site.name}`);

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
      />

      <section className="bg-[var(--store-surface)] pt-8 pb-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 lg:grid-cols-2 lg:gap-14">
          <Reveal className="flex flex-col gap-6">
          {/* Card 1: Address */}
          <div className="group relative flex flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-black/5 bg-[var(--store-card)] p-8 shadow-xl shadow-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10">
            <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive-deep">
              <MapPin strokeWidth={1.5} className="size-6" />
            </div>
            <div>
              <h3 className="font-serif text-xl text-olive-deep">ที่ตั้งคลินิก</h3>
              <p className="mt-2 text-sm leading-[1.8] text-ink/75">{site.addressFull}</p>
              <a href={site.mapsUrl} target="_blank" rel="noopener" className="mt-4 inline-flex items-center gap-1.5 text-xs font-medium uppercase tracking-[0.1em] text-olive-deep hover:text-forest">
                ดูบน Google Maps <Navigation className="size-3" />
              </a>
            </div>
          </div>

          {/* Card 2: Contact Info */}
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="group relative flex flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-black/5 bg-[var(--store-card)] p-8 shadow-xl shadow-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive-deep">
                <Phone strokeWidth={1.5} className="size-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-olive-deep">โทรศัพท์</h3>
                <a href={site.phoneUrl} className="mt-2 block text-sm leading-[1.8] text-ink/75 hover:text-forest">{site.phone}</a>
              </div>
            </div>

            <div className="group relative flex flex-col gap-4 overflow-hidden rounded-[1.75rem] border border-black/5 bg-[var(--store-card)] p-8 shadow-xl shadow-black/5 transition-transform duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-black/10">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-olive/10 text-olive-deep">
                <Clock strokeWidth={1.5} className="size-6" />
              </div>
              <div>
                <h3 className="font-serif text-xl text-olive-deep">เวลาทำการ</h3>
                <p className="mt-2 text-sm leading-[1.8] text-ink/75">
                  {site.hoursDisplay.weekdays}
                  <br />
                  {site.hoursDisplay.sunday}
                </p>
              </div>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="mt-2 flex flex-wrap gap-4">
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2.5 rounded-full bg-[#06C755] px-6 py-3 text-xs font-medium tracking-[0.1em] text-white shadow-lg shadow-[#06C755]/20 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-[#06C755]/30 active:scale-95"
            >
              <LineIcon className="size-4" />
              ติดต่อผ่าน LINE
            </a>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-2.5 rounded-full border border-ink/10 bg-white px-6 py-3 text-xs font-medium tracking-[0.1em] text-ink shadow-lg shadow-black/5 transition-all duration-300 hover:-translate-y-0.5 hover:border-[#E1306C] hover:text-[#E1306C] hover:shadow-xl active:scale-95"
            >
              <InstagramIcon className="size-4" />
              Instagram
            </a>
          </div>
        </Reveal>

        {/* Booking Form in the grid */}
        <div id="booking" className="flex flex-col scroll-mt-24">
          <Reveal delay={80} className="flex-1 overflow-hidden rounded-[1.75rem] border border-black/5 bg-[var(--store-card)] p-8 shadow-2xl shadow-black/5 md:p-10">
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
              Book an Appointment
            </p>
            <h2 className="mt-2 font-serif text-3xl text-[var(--store-ink)]">นัดหมาย / ปรึกษาแพทย์</h2>
            <p className="mb-8 mt-2 text-sm leading-[1.8] text-[var(--store-muted)]">
              กรอกแบบฟอร์มสั้น ๆ ทีมงานจะติดต่อกลับเพื่อยืนยันนัดหมาย หรือทักผ่าน LINE ได้ทันที
            </p>
            <BookingForm interests={serviceCategories.map((category) => category.title)} />
          </Reveal>
        </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="bg-[var(--store-surface)] py-12 pb-24">
        <div className="mx-auto max-w-7xl px-6">
          <Reveal className="relative h-[450px] w-full overflow-hidden rounded-[1.75rem] shadow-2xl shadow-black/5">
            <iframe
              src={site.mapsEmbedUrl}
              className="absolute inset-0 size-full"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="strict-origin-when-cross-origin"
              allowFullScreen
              title={`แผนที่ ${site.name}`}
            />
          </Reveal>
        </div>
      </section>
    </>
  );
}
