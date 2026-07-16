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

      {/* ทีมแพทย์ — ชื่อและเลข ว. มาจาก "Kazumi NavBar Structure Final" (2026-07-16) ที่คลินิก
          มาร์คไว้ว่า verified · ห้ามเพิ่มแพทย์คนอื่นหรือวุฒิใด ๆ ที่คลินิกไม่ได้ยืนยันเป็นลายลักษณ์
          อักษร (ห้ามกุข้อมูล ดู CLAUDE.md §0.2) */}
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

            <ul className="mt-8 space-y-4">
              {site.doctors.map((doctor) => (
                <li
                  key={doctor.licenseNo}
                  className="flex items-start gap-4 rounded-2xl border border-olive/15 bg-sand/50 p-6"
                >
                  <UserRound className="mt-0.5 size-8 shrink-0 text-olive-light" />
                  <div>
                    <p className="font-serif text-xl text-olive-deep">
                      {doctor.name}
                      {doctor.nickname && (
                        <span className="ml-2 text-base text-ink/50">({doctor.nickname})</span>
                      )}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-olive-light">
                      เลขที่ใบประกอบวิชาชีพเวชกรรม {doctor.licenseNo}
                    </p>
                    <p className="mt-3 text-sm text-ink/70">{doctor.role}</p>
                  </div>
                </li>
              ))}
            </ul>

            <p className="mt-6 text-sm text-ink/60">
              สอบถามหรือนัดปรึกษาแพทย์ได้ทาง LINE — ผลลัพธ์ขึ้นอยู่กับสภาพผิวและปัญหาเฉพาะบุคคล
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}
