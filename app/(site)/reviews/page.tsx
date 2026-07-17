import type { Metadata } from 'next';
import { ExternalLink, MessageCircle, Star } from 'lucide-react';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { siteSocialImage } from '@/lib/metadata-images';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { PageHero } from '@/components/page-hero';

const pageTitle = 'รีวิว / ผลลัพธ์ก่อน-หลัง';
const pageDescription = `รีวิวและผลลัพธ์ก่อน-หลังทำหัตถการที่ ${site.name} ย่านสุขุมวิท กรุงเทพฯ`;

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage('hero-iv-drip-1', `${site.name} รีวิวและผลลัพธ์`);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/reviews` },
    openGraph: {
      title: `${pageTitle} — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/reviews`,
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

// NOTE: This page is an intentional scaffold. Reviews and before/after images must be REAL
// content supplied and consented to by actual patients — never fabricated (see CLAUDE.md §0.2).
// Do not add Review/AggregateRating JSON-LD until backed by genuine, verifiable reviews, and
// before/after medical images require patient consent + advertising-compliance review.

export default function ReviewsPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'รีวิว / ผลลัพธ์ก่อน-หลัง', path: '/reviews' },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />

      <PageHero
        eyebrow="Reviews / Before & After"
        title="รีวิว / ผลลัพธ์ก่อน-หลัง"
        lead={`ผลลัพธ์จากการทำหัตถการที่ ${site.name} — ดูรีวิวจากลูกค้าจริงและผลลัพธ์ก่อน-หลังทำ`}
        breadcrumb={[{ name: 'หน้าหลัก', href: '/' }, { name: 'รีวิว / ผลลัพธ์ก่อน-หลัง' }]}
      />

      <section className="mx-auto max-w-6xl px-6 py-20">
        <Reveal className="rounded-2xl border border-dashed border-olive/30 bg-cream p-14 text-center">
          <div className="flex justify-center gap-1 text-olive-light">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5" />
            ))}
          </div>
          <p className="mt-4 font-serif text-xl text-olive-deep">กำลังรวบรวมรีวิวจากลูกค้า</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
            รีวิวและภาพผลลัพธ์ก่อน-หลังจากลูกค้าจริงกำลังจะมาเร็ว ๆ นี้
            ระหว่างนี้สามารถดูรีวิวได้ที่ Google และ Instagram ของเรา
            หรือสอบถามผลลัพธ์เฉพาะบุคคลผ่าน LINE
          </p>
          <p className="mt-4 text-xs text-ink/40">*ผลลัพธ์ขึ้นอยู่กับสภาพผิวและปัญหาเฉพาะบุคคล</p>
        </Reveal>

        <div className="mt-12 flex flex-wrap gap-3">
          <Button
            render={<a href={site.mapsUrl} target="_blank" rel="noopener" />}
            size="lg"
            variant="outline"
            className="rounded-full border-olive px-8 text-olive-deep hover:bg-olive/10"
          >
            <ExternalLink className="size-4" />
            ดูรีวิวจริงบน Google Maps
          </Button>
          <Button
            render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
            size="lg"
            className="rounded-full bg-line px-8 text-white hover:bg-line/90"
          >
            <MessageCircle className="size-4" />
            สอบถามผลลัพธ์ผ่าน LINE
          </Button>
        </div>
      </section>
    </>
  );
}
