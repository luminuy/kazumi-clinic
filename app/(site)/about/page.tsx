import type { Metadata } from 'next';
import Image from 'next/image';
import { Award, Languages, ShieldCheck, Sparkles, Stethoscope } from 'lucide-react';
import { site } from '@/lib/site';
import { cld, cloudAssets } from '@/lib/cloud';
import { doctor } from '@/lib/doctor';
import { breadcrumbSchema, doctorSchema } from '@/lib/schema';
import { getImageOverrides, getOgImage } from '@/lib/site-images-store';
import { Reveal } from '@/components/reveal';
import { PageHero, SectionLabel } from '@/components/page-hero';

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: 'เกี่ยวกับเรา / แพทย์',
    description: `รู้จัก ${site.name} สถานเสริมความงามย่านสุขุมวิท กรุงเทพฯ และ ${doctor.name} ${doctor.role} ใบอนุญาตสถานพยาบาลเลขที่ ${site.license}`,
    alternates: { canonical: `${site.url}/about` },
    openGraph: {
      title: `เกี่ยวกับเรา — ${site.name}`,
      description: site.description,
      url: `${site.url}/about`,
      type: 'website',
      images: [
        {
          url: await getOgImage('og-about'),
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function AboutPage() {
  const overrides = await getImageOverrides();
  const doctorSrc = overrides.get('doctor-pratch')?.public_id ?? doctor.image;
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
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorSchema(doctorSrc)) }}
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
            Confidence — เน้นการปรับแต่งอย่างพอดี โดยแพทย์เป็นผู้ประเมินและวางแผนการดูแล
            ในบรรยากาศคลินิกที่สงบและเป็นส่วนตัว
          </p>
          <p className="mt-6 flex items-center gap-2 text-sm text-ink/50">
            <ShieldCheck className="size-4 shrink-0" />
            ใบอนุญาตประกอบกิจการสถานพยาบาลเลขที่ {site.license}
          </p>
        </Reveal>
      </section>

      <section className="border-t border-olive/15 bg-cream">
        <div className="mx-auto max-w-6xl px-6 py-20">
          <Reveal className="grid gap-10 md:grid-cols-[0.75fr_1.25fr] md:items-start">
            <div className="relative aspect-[4/5] overflow-hidden rounded-[2rem] bg-sage-pale">
              <Image
                src={doctorSrc}
                alt={`${doctor.name} ${doctor.role}`}
                fill
                sizes="(min-width: 768px) 36vw, 90vw"
                className="object-cover"
              />
            </div>
            <div>
              <SectionLabel index={2}>แพทย์ประจำคลินิก</SectionLabel>
              <p className="mt-5 text-xs uppercase tracking-[0.24em] text-olive-light">
                {doctor.role}
              </p>
              <h2 className="mt-2 font-serif text-4xl text-olive-deep md:text-5xl">
                {doctor.name}
              </h2>
              <p className="mt-5 leading-relaxed text-ink/70">{doctor.summary}</p>
              <p className="mt-3 text-xs text-ink/50">
                {doctor.nameTh} · ใบประกอบวิชาชีพเวชกรรมเลขที่ {doctor.licenseNo}
              </p>

              <div className="mt-8 grid gap-6 sm:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 font-medium text-olive-deep">
                    <Award className="size-4 text-olive" /> วุฒิการศึกษา
                  </h3>
                  <ul className="mt-3 space-y-3 text-sm text-ink/65">
                    {doctor.education.map((item) => (
                      <li key={item.degree}>
                        <p className="font-medium text-ink/80">{item.degree}</p>
                        <p className="mt-0.5 text-xs leading-relaxed">{item.institution}</p>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 font-medium text-olive-deep">
                    <Stethoscope className="size-4 text-olive" /> ขอบเขตการให้คำปรึกษา
                  </h3>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {doctor.expertise.map((item) => (
                      <li
                        key={item}
                        className="rounded-full border border-olive/15 px-3 py-1.5 text-xs text-ink/65"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-6 flex items-center gap-2 text-sm text-ink/60">
                    <Languages className="size-4 text-olive" /> {doctor.languages.join(' · ')}
                  </p>
                  <p className="mt-4 flex items-start gap-2 text-xs leading-relaxed text-ink/45">
                    <Sparkles className="mt-0.5 size-3.5 shrink-0" />
                    แผนการดูแลและผลลัพธ์แตกต่างกันตามการประเมินของแพทย์และแต่ละบุคคล
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}
