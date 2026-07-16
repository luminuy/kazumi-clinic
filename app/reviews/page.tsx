import type { Metadata } from 'next';
import Link from 'next/link';
import { MessageCircle, Star } from 'lucide-react';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = {
  title: 'รีวิว / ผลลัพธ์ก่อน-หลัง',
  description: `รีวิวและผลลัพธ์ก่อน-หลังทำหัตถการที่ ${site.name} ย่านสุขุมวิท กรุงเทพฯ`,
  alternates: { canonical: `${site.url}/reviews` },
  openGraph: {
    title: `รีวิว / ผลลัพธ์ก่อน-หลัง — ${site.name}`,
    description: site.description,
    url: `${site.url}/reviews`,
    type: 'website',
    images: [{ url: `${site.url}/images/og/reviews.jpg`, width: 1200, height: 630 }],
  },
};

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

      <nav className="mx-auto max-w-6xl px-6 pt-8 text-xs text-ink/50">
        <Link href="/" className="hover:text-olive">
          หน้าหลัก
        </Link>{' '}
        / <span className="text-ink/70">รีวิว / ผลลัพธ์ก่อน-หลัง</span>
      </nav>

      <section className="mx-auto max-w-6xl px-6 py-10">
        <h1 className="font-serif text-3xl text-olive-deep md:text-4xl">
          รีวิว / ผลลัพธ์ก่อน-หลัง
        </h1>
        <p className="mt-4 max-w-2xl text-ink/70">
          ผลลัพธ์จากการทำหัตถการที่ {site.name} — ดูรีวิวจากลูกค้าจริงและผลลัพธ์ก่อน-หลังทำ
        </p>

        <div className="mt-10 rounded-2xl border border-dashed border-olive/30 bg-white p-10 text-center">
          <div className="flex justify-center gap-1 text-olive-light">
            {Array.from({ length: 5 }).map((_, i) => (
              <Star key={i} className="size-5" />
            ))}
          </div>
          <p className="mt-4 font-serif text-lg text-olive-deep">กำลังรวบรวมรีวิวจากลูกค้า</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink/60">
            รีวิวและภาพผลลัพธ์ก่อน-หลังจากลูกค้าจริงกำลังจะมาเร็ว ๆ นี้
            ระหว่างนี้สามารถดูรีวิวได้ที่ Google และ Instagram ของเรา
            หรือสอบถามผลลัพธ์เฉพาะบุคคลผ่าน LINE
          </p>
          <p className="mt-4 text-xs text-ink/40">
            *ผลลัพธ์ขึ้นอยู่กับสภาพผิวและปัญหาเฉพาะบุคคล
          </p>
        </div>

        <Button
          render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
          size="lg"
          className="mt-10 rounded-full bg-line px-8 text-white hover:bg-line/90"
        >
          <MessageCircle className="size-4" />
          สอบถามผลลัพธ์ผ่าน LINE
        </Button>
      </section>
    </>
  );
}
