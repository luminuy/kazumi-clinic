import type { Metadata } from 'next';
import { ShieldCheck, Stethoscope, UserRound } from 'lucide-react';
import { site } from '@/lib/site';
import { breadcrumbSchema } from '@/lib/schema';
import { Reveal } from '@/components/reveal';
import { PageHero, SectionLabel } from '@/components/page-hero';

export const metadata: Metadata = {
  title: 'เกี่ยวกับเรา / แพทย์',
  description: `รู้จัก ${site.name} สถานเสริมความงามย่านสุขุมวิท กรุงเทพฯ และทีมแพทย์ผู้เชี่ยวชาญ ใบอนุญาตเลขที่ ${site.license}`,
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

      <PageHero
        eyebrow="About Us / Our Doctors"
        title={`เกี่ยวกับ ${site.name}`}
        lead={`“${site.tagline}” — 純粋さは永遠の美へ`}
        breadcrumb={[{ name: 'หน้าหลัก', href: '/' }, { name: 'เกี่ยวกับเรา / แพทย์' }]}
      />

      <section className="mx-auto max-w-3xl px-6 py-20">
        <Reveal>
          <SectionLabel index={1}>ปรัชญาของเรา</SectionLabel>
          <p className="mt-6 text-lg leading-relaxed text-ink/75">{site.description}</p>
          <p className="mt-5 leading-relaxed text-ink/70">
            {site.name} ยึดหลักปรัชญาความงามแบบมินิมอลสไตล์ญี่ปุ่น — Minimal Change, Maximum
            Confidence — เน้นการปรับแต่งอย่างพอดี ให้ผลลัพธ์ที่เป็นธรรมชาติ ดูแลโดยแพทย์ผู้เชี่ยวชาญ
            ในบรรยากาศคลินิกที่สงบและเป็นส่วนตัว
          </p>
          <p className="mt-6 flex items-center gap-2 text-sm text-ink/50">
            <ShieldCheck className="size-4 shrink-0" />
            ใบอนุญาตประกอบกิจการสถานพยาบาลเลขที่ {site.license}
          </p>
        </Reveal>
      </section>

      {/* ทีมแพทย์ — placeholder. เติมชื่อ/วุฒิ/เลขใบประกอบวิชาชีพเวชกรรมจริงของแพทย์ก่อน publish
          (ห้ามกุข้อมูล ดู CLAUDE.md §0.2) */}
      <section className="border-t border-olive/15 bg-cream">
        <div className="mx-auto max-w-3xl px-6 py-20">
          <Reveal>
            <SectionLabel index={2}>ทีมแพทย์</SectionLabel>
            <h2 className="mt-4 flex items-center gap-2 font-serif text-3xl text-olive-deep">
              <Stethoscope className="size-6 text-olive" />
              ทีมแพทย์ของเรา
            </h2>
            <p className="mt-4 text-ink/70">
              หัตถการทุกอย่างที่ {site.name} ดำเนินการโดยแพทย์ผู้มีใบประกอบวิชาชีพเวชกรรม
              ให้คำปรึกษาและออกแบบการรักษาเฉพาะบุคคล
            </p>

            <div className="mt-8 rounded-2xl border border-dashed border-olive/30 p-10 text-center">
              <UserRound className="mx-auto size-8 text-olive-light" />
              <p className="mx-auto mt-4 max-w-md text-sm text-ink/60">
                ข้อมูลแพทย์ (ชื่อ วุฒิการศึกษา และเลขที่ใบประกอบวิชาชีพเวชกรรม)
                จะแสดงที่นี่ — สอบถามหรือนัดปรึกษาแพทย์ได้ทาง LINE
              </p>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
