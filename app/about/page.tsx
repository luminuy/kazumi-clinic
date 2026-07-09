import type { Metadata } from 'next';
import Link from 'next/link';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา',
  description: `รู้จัก ${site.name} สถานเสริมความงามย่านสุขุมวิท กรุงเทพฯ ใบอนุญาตเลขที่ ${site.license}`,
  alternates: { canonical: `${site.url}/about` },
  openGraph: {
    title: `เกี่ยวกับเรา — ${site.name}`,
    description: site.description,
    url: `${site.url}/about`,
    type: 'website',
    images: [{ url: `${site.url}/images/og/about.jpg`, width: 1200, height: 630 }],
  },
};

export default function AboutPage() {
  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'เกี่ยวกับเรา', path: '/about' },
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
        / <span className="text-ink/70">เกี่ยวกับเรา</span>
      </nav>

      <section className="mx-auto max-w-3xl px-6 py-14">
        <h1 className="font-serif text-3xl text-olive-deep md:text-4xl">เกี่ยวกับ {site.name}</h1>
        <p className="mt-2 font-serif italic text-olive-light">&ldquo;{site.tagline}&rdquo;</p>
        <p className="mt-6 text-ink/70">{site.description}</p>
        <p className="mt-4 text-ink/70">
          {site.name} ยึดหลักปรัชญาความงามแบบมินิมอลสไตล์ญี่ปุ่น — Minimal Change, Maximum
          Confidence — เน้นการปรับแต่งอย่างพอดี ให้ผลลัพธ์ที่เป็นธรรมชาติ ดูแลโดยแพทย์ผู้เชี่ยวชาญ
          ในบรรยากาศคลินิกที่สงบและเป็นส่วนตัว
        </p>
        <p className="mt-6 text-sm text-ink/50">ใบอนุญาตประกอบกิจการสถานพยาบาลเลขที่ {site.license}</p>
      </section>
    </>
  );
}
