import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, MapPin, ShieldCheck, Sparkles } from 'lucide-react';
import { site } from '@/lib/site';
import { doctor, doctorEesha } from '@/lib/doctor';
import { breadcrumbSchema, doctorSchema } from '@/lib/schema';
import { getImageOverrides } from '@/lib/site-images-store';
import { siteSocialImage } from '@/lib/metadata-images';
import { Reveal } from '@/components/reveal';
import { SectionLabel } from '@/components/page-hero';

const pageTitle = 'เกี่ยวกับเรา / แพทย์';
const pageDescription = `รู้จัก ${site.name} สถานเสริมความงามย่านสุขุมวิท กรุงเทพฯ และ ${doctor.name} ${doctor.role} ใบอนุญาตสถานพยาบาลเลขที่ ${site.license}`;

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = await siteSocialImage('og-about', `เกี่ยวกับ ${site.name}`);

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: `${site.url}/about` },
    openGraph: {
      title: `เกี่ยวกับเรา — ${site.name}`,
      description: pageDescription,
      url: `${site.url}/about`,
      type: 'website',
      images: [socialImage],
    },
    twitter: {
      card: 'summary_large_image',
      title: `เกี่ยวกับเรา — ${site.name}`,
      description: pageDescription,
      images: [socialImage.url],
    },
  };
}

/** A tonal panel with an icon, shown for an image slot the clinic hasn't uploaded yet. */
function ImagePlaceholder() {
  return (
    <span aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
      <Sparkles className="size-10 text-olive/20" strokeWidth={0.75} />
    </span>
  );
}

export default async function AboutPage() {
  const overrides = await getImageOverrides();
  const doctorSrc = overrides.get('doctor-pratch')?.public_id ?? doctor.image;
  // Dr. Eesha has no shipped default photo — undefined until the clinic uploads one via /admin.
  const eeshaSrc = overrides.get('doctor-eesha')?.public_id;
  const heroSrc = overrides.get('about-hero')?.public_id;
  const interiorSrc = overrides.get('about-interior')?.public_id;

  const breadcrumb = breadcrumbSchema([
    { name: 'หน้าหลัก', path: '/' },
    { name: 'เกี่ยวกับเรา', path: '/about' },
  ]);

  return (
    <div className="bg-sand">
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorSchema(doctor, doctorSrc)) }}
      />
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: JSON.stringify(doctorSchema(doctorEesha, eeshaSrc)) }}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="px-6 pb-24 pt-24 sm:px-10 md:px-14 md:pt-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <nav
            aria-label="เส้นทางหน้า"
            className="mb-12 flex flex-wrap items-center gap-1.5 text-xs text-ink/40"
          >
            <Link href="/" className="transition-colors hover:text-olive-deep">
              หน้าหลัก
            </Link>
            <span aria-hidden="true" className="text-ink/25">
              /
            </span>
            <span className="text-ink/70">เกี่ยวกับเรา</span>
          </nav>

          <div className="grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p lang="en" className="text-[0.68rem] uppercase tracking-[0.28em] text-olive/60">
                About Us / Our Doctors
              </p>
              <h1 className="mt-6 font-serif text-4xl leading-[1.15] text-olive-deep md:text-5xl">
                เกี่ยวกับ {site.name}
              </h1>
              {/* The clinic's own identity lines, straight from lib/site.ts — not new copy. */}
              <p lang="en" className="mt-6 font-serif text-xl italic leading-snug text-olive/70">
                “{site.tagline}”
                <span lang="ja" className="mt-1 block text-base not-italic text-olive/55">
                  {site.taglineJa}
                </span>
              </p>
              <p className="mt-6 max-w-lg text-sm leading-[1.9] text-ink/70 md:text-base">
                {site.description}
              </p>
              <p className="mt-8 inline-block border-t border-olive/20 pt-4 text-[0.66rem] uppercase tracking-[0.22em] text-olive-deep">
                Sukhumvit · Bangkok
              </p>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden border border-olive/10 bg-olive-deep/[0.06]">
                {heroSrc ? (
                  <Image
                    src={heroSrc}
                    alt=""
                    aria-hidden="true"
                    fill
                    priority
                    fetchPriority="high"
                    sizes="(min-width: 768px) 45vw, 90vw"
                    className="object-cover"
                  />
                ) : (
                  <ImagePlaceholder />
                )}
              </div>
              {/* The reference overlaps a dark quote block onto the image's lower-left. */}
              <div className="absolute -bottom-6 -left-6 hidden max-w-[15rem] bg-olive-deep p-6 text-sand md:block">
                <p lang="en" className="font-serif text-lg italic leading-snug">
                  “{site.taglineTh}”
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── (01) Philosophy ──────────────────────────────────── */}
      <section className="border-t border-olive/10 bg-cream px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <Reveal>
              <SectionLabel index={1}>ปรัชญาของเรา</SectionLabel>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <Reveal className="grid gap-10 sm:grid-cols-2">
              <div>
                <h2 className="font-serif text-2xl text-olive-deep">ความพิถีพิถัน</h2>
                <p className="mt-4 text-sm leading-[1.9] text-ink/65">
                  {site.name} ยึดหลักปรัชญาความงามแบบมินิมอลสไตล์ญี่ปุ่น เน้นการปรับแต่งอย่างพอดี
                  โดยแพทย์เป็นผู้ประเมินและวางแผนการดูแล ในบรรยากาศที่สงบและเป็นส่วนตัว
                </p>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-olive-deep">มาตรฐานทางการแพทย์</h2>
                <p className="mt-4 text-sm leading-[1.9] text-ink/65">
                  ให้บริการฟิลเลอร์ โบท็อกซ์ IV Drip วิตามิน สกินบูสเตอร์ และคอลลาเจนบูสเตอร์
                  โดยคำนึงถึงความปลอดภัยและความเป็นธรรมชาติเป็นสำคัญ
                </p>
              </div>
            </Reveal>
            <Reveal className="mt-10 border border-olive/15 bg-sand p-8 md:p-10">
              <p lang="en" className="font-serif text-lg italic leading-relaxed text-olive-deep/80">
                “{site.tagline}” — {site.taglineTh}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── (02) Clinic Director ─────────────────────────────── */}
      <section className="px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-14 md:flex-row md:gap-20">
            <div className="w-full md:w-5/12">
              <Reveal>
                <div className="border border-olive/10 p-2">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-olive-deep/[0.06]">
                    <Image
                      src={doctorSrc}
                      alt={`${doctor.nameTh} ${doctor.role} ของ ${site.name}`}
                      fill
                      sizes="(min-width: 768px) 40vw, 90vw"
                      className="object-cover"
                    />
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-[0.66rem] uppercase tracking-[0.2em] text-olive-deep">
                    ใบประกอบวิชาชีพเวชกรรมเลขที่ {doctor.licenseNo}
                  </p>
                  <p className="text-[0.66rem] tracking-wide text-ink/55">
                    ให้คำปรึกษาเป็นภาษา {doctor.languages.join(' · ')}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="w-full md:w-7/12">
              <Reveal className="space-y-12 border-l border-olive/20 pl-8 md:pl-12">
                <div>
                  <SectionLabel index={2}>แพทย์ผู้อำนวยการ</SectionLabel>
                  <h2 className="mt-4 font-serif text-4xl text-olive-deep md:text-5xl">
                    {doctor.nameTh}
                  </h2>
                  <p lang="en" className="mt-2 font-serif text-xl text-olive/60">
                    {doctor.name}
                  </p>
                  <p className="mt-6 max-w-xl text-sm leading-[1.9] text-ink/65">
                    {doctor.summary}
                  </p>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="border-b border-olive/15 pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                  >
                    Academic Excellence
                  </h3>
                  <ul className="mt-6 space-y-6">
                    {doctor.education.map((item) => (
                      <li
                        key={item.degree}
                        className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6"
                      >
                        <span className="font-serif text-lg text-olive-deep md:w-72 md:shrink-0">
                          {item.degree}
                        </span>
                        <span className="text-xs leading-relaxed text-ink/60">
                          {item.institution}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                  >
                    Specializations
                  </h3>
                  <ul className="mt-5 flex flex-wrap gap-3">
                    {doctor.expertise.map((item) => (
                      <li
                        key={item}
                        lang="en"
                        className="border border-olive/25 px-4 py-2 text-[0.66rem] uppercase tracking-[0.12em] text-olive-deep"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-ink/45">
                    <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    แผนการดูแลและผลลัพธ์แตกต่างกันตามการประเมินของแพทย์และแต่ละบุคคล
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── (03) Clinic Physician — Dr. Eesha ────────────────── */}
      <section className="border-t border-olive/10 bg-cream px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-14 md:flex-row-reverse md:gap-20">
            <div className="w-full md:w-5/12">
              <Reveal>
                <div className="border border-olive/10 p-2">
                  <div className="relative aspect-[3/4] w-full overflow-hidden bg-olive-deep/[0.06]">
                    {eeshaSrc ? (
                      <Image
                        src={eeshaSrc}
                        alt={`${doctorEesha.name} ${doctorEesha.role} ของ ${site.name}`}
                        fill
                        sizes="(min-width: 768px) 40vw, 90vw"
                        className="object-cover"
                      />
                    ) : (
                      <ImagePlaceholder />
                    )}
                  </div>
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-[0.66rem] uppercase tracking-[0.2em] text-olive-deep">
                    ใบประกอบวิชาชีพเวชกรรมเลขที่ {doctorEesha.licenseNo}
                  </p>
                  <p className="text-[0.66rem] tracking-wide text-ink/55">
                    ให้คำปรึกษาเป็นภาษา {doctorEesha.languages.join(' · ')}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="w-full md:w-7/12">
              <Reveal className="space-y-12 border-l border-olive/20 pl-8 md:pl-12">
                <div>
                  <SectionLabel index={3}>แพทย์ประจำคลินิก</SectionLabel>
                  <h2 className="mt-4 font-serif text-4xl text-olive-deep md:text-5xl">
                    {doctorEesha.name}
                  </h2>
                  <p
                    lang="en"
                    className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-olive/60"
                  >
                    {doctorEesha.credentials}
                  </p>
                  <p className="mt-3 text-sm text-olive/70">{doctorEesha.role}</p>
                  <p className="mt-6 max-w-xl text-sm leading-[1.9] text-ink/65">
                    {doctorEesha.summary}
                  </p>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="border-b border-olive/15 pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                  >
                    Education &amp; Credentials
                  </h3>
                  <ul className="mt-6 space-y-6">
                    {doctorEesha.education.map((item) => (
                      <li
                        key={item.degree}
                        className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6"
                      >
                        <span className="font-serif text-lg text-olive-deep md:w-72 md:shrink-0">
                          {item.degree}
                        </span>
                        <span className="text-xs leading-relaxed text-ink/60">
                          {item.institution}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="border-b border-olive/15 pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                  >
                    Experience
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {doctorEesha.experience.map((item) => (
                      <li key={item} className="flex gap-3 text-xs leading-[1.7] text-ink/65">
                        <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-clay" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-10 sm:grid-cols-2">
                  <div>
                    <h3
                      lang="en"
                      className="border-b border-olive/15 pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                    >
                      Selected Training
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {doctorEesha.training.map((item) => (
                        <li key={item} className="flex gap-3 text-xs leading-[1.7] text-ink/65">
                          <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-clay" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3
                      lang="en"
                      className="border-b border-olive/15 pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                    >
                      Professional &amp; Research
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {doctorEesha.memberships.map((item) => (
                        <li key={item} className="flex gap-3 text-xs leading-[1.7] text-ink/65">
                          <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-clay" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                  >
                    Clinical Focus
                  </h3>
                  <ul className="mt-5 flex flex-wrap gap-3">
                    {doctorEesha.expertise.map((item) => (
                      <li
                        key={item}
                        lang="en"
                        className="border border-olive/25 px-4 py-2 text-[0.66rem] uppercase tracking-[0.12em] text-olive-deep"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep"
                  >
                    Technologies &amp; Modalities
                  </h3>
                  <p lang="en" className="mt-5 text-sm leading-[2] text-ink/60">
                    {doctorEesha.technologies.join(' · ')}
                  </p>
                  <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-ink/45">
                    <Sparkles aria-hidden="true" className="mt-0.5 size-3.5 shrink-0" />
                    แผนการดูแลและผลลัพธ์แตกต่างกันตามการประเมินของแพทย์และแต่ละบุคคล
                  </p>
                </div>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* ── Art anchor ───────────────────────────────────────── */}
      <section className="relative h-[26rem] overflow-hidden md:h-[33rem]">
        {interiorSrc ? (
          <Image
            src={interiorSrc}
            alt=""
            aria-hidden="true"
            fill
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div aria-hidden="true" className="absolute inset-0 bg-olive-deep/[0.08]">
            <ImagePlaceholder />
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-olive-deep/40" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-sand md:text-5xl">{site.name}</h2>
            <p className="mt-4 text-sm tracking-wide text-sand/80">
              {site.address.street} · {site.address.district} · กรุงเทพฯ
            </p>
          </div>
        </div>
      </section>

      {/* ── Consultation CTA + info ──────────────────────────── */}
      <section className="bg-cream px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-14 md:flex-row md:justify-between">
          <div className="w-full space-y-8 md:w-1/2">
            <h2 className="font-serif text-3xl text-olive-deep md:text-4xl">นัดหมายปรึกษาแพทย์</h2>
            <p className="max-w-md text-sm leading-[1.9] text-ink/65 md:text-base">
              ทุกหัตถการเริ่มต้นจากการประเมินโครงหน้าและเป้าหมายของแต่ละบุคคลอย่างละเอียดโดยแพทย์
            </p>
            <div className="flex flex-col gap-4">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between bg-olive-deep p-6 text-sand transition-opacity duration-200 hover:opacity-90"
              >
                <span className="text-[0.68rem] uppercase tracking-[0.24em]">จองคิวผ่าน LINE</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>
              <Link
                href="/services"
                className="group flex items-center justify-between border border-olive-deep p-6 text-olive-deep transition-colors duration-200 hover:bg-olive-deep hover:text-sand"
              >
                <span className="text-[0.68rem] uppercase tracking-[0.24em]">ดูบริการทั้งหมด</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          <div className="w-full space-y-8 border-t border-olive/15 pt-12 md:w-1/3 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <div>
              <h3 className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep">
                ที่ตั้ง
              </h3>
              <p className="mt-4 text-sm leading-[1.9] text-ink/65">{site.addressFull}</p>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-wide text-olive-deep underline underline-offset-4 hover:opacity-60"
              >
                <MapPin aria-hidden="true" className="size-3.5" /> ดูแผนที่
              </a>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-olive-deep">
                <ShieldCheck aria-hidden="true" className="size-3.5" /> ใบอนุญาตสถานพยาบาล
              </h3>
              <p className="mt-3 text-sm text-ink/65">{site.license}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
