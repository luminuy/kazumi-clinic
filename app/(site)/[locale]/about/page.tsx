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
import { LineIcon } from '@/components/brand-icons';

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
    <div className="bg-[var(--background)]">
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
          <div className="mt-12 grid items-center gap-12 md:grid-cols-2 md:gap-16">
            <div>
              <p lang="en" className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--store-muted)]">
                About Us / Our Doctors
              </p>
              <h1 className="mt-6 font-serif text-4xl leading-[1.15] text-[var(--store-ink)] md:text-5xl">
                เกี่ยวกับ {site.name}
              </h1>
              {/* The clinic's own identity lines, straight from lib/site.ts — not new copy. */}
              <p lang="en" className="mt-6 font-serif text-xl italic leading-snug text-[var(--store-muted)]">
                “{site.tagline}”
                <span lang="ja" className="mt-1 block text-base not-italic text-[var(--store-muted)]">
                  {site.taglineJa}
                </span>
              </p>
              <p className="mt-6 max-w-lg text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
                {site.description}
              </p>
              <p className="mt-8 inline-block border-t border-black/10 pt-4 text-[0.66rem] uppercase tracking-[0.22em] text-[var(--store-ink)]">
                Sukhumvit · Bangkok
              </p>
            </div>

            <div className="relative">
              <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] shadow-2xl shadow-black/5">
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
            </div>
          </div>
        </div>
      </section>

      {/* ── (01) Philosophy ──────────────────────────────────── */}
      <section className="border-t border-black/[0.08] bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:gap-10">
          <div className="md:col-span-4">
            <Reveal>
              <SectionLabel index={1}>ปรัชญาของเรา</SectionLabel>
            </Reveal>
          </div>
          <div className="md:col-span-8">
            <Reveal className="grid gap-10 sm:grid-cols-2">
              <div>
                <h2 className="font-serif text-2xl text-[var(--store-ink)]">ความพิถีพิถัน</h2>
                <p className="mt-4 text-sm leading-[1.9] text-[var(--store-muted)]">
                  {site.name} ยึดหลักปรัชญาความงามแบบมินิมอลสไตล์ญี่ปุ่น เน้นการปรับแต่งอย่างพอดี
                  โดยแพทย์เป็นผู้ประเมินและวางแผนการดูแล ในบรรยากาศที่สงบและเป็นส่วนตัว
                </p>
              </div>
              <div>
                <h2 className="font-serif text-2xl text-[var(--store-ink)]">มาตรฐานทางการแพทย์</h2>
                <p className="mt-4 text-sm leading-[1.9] text-[var(--store-muted)]">
                  ให้บริการฟิลเลอร์ โบท็อกซ์ IV Drip วิตามิน สกินบูสเตอร์ และคอลลาเจนบูสเตอร์
                  โดยคำนึงถึงความปลอดภัยและความเป็นธรรมชาติเป็นสำคัญ
                </p>
              </div>
            </Reveal>
            <Reveal className="mt-10 rounded-3xl border border-black/[0.08] bg-[var(--store-card)] p-8 shadow-sm md:p-10">
              <p lang="en" className="font-serif text-lg italic leading-relaxed text-[var(--store-ink)]">
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
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] shadow-2xl shadow-black/5">
                  <Image
                    src={doctorSrc}
                    alt={`${doctor.nameTh} ${doctor.role} ของ ${site.name}`}
                    fill
                    sizes="(min-width: 768px) 40vw, 90vw"
                    className="object-cover"
                  />
                </div>
                <div className="mt-6 space-y-2">
                  <p className="text-[0.66rem] uppercase tracking-[0.2em] text-[var(--store-ink)]">
                    ใบประกอบวิชาชีพเวชกรรมเลขที่ {doctor.licenseNo}
                  </p>
                  <p className="text-[0.66rem] tracking-wide text-[var(--store-muted)]">
                    ให้คำปรึกษาเป็นภาษา {doctor.languages.join(' · ')}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="w-full md:w-7/12">
              <Reveal className="space-y-12 border-l border-black/10 pl-8 md:pl-12">
                <div>
                  <SectionLabel index={2}>แพทย์ผู้อำนวยการ</SectionLabel>
                  <h2 className="mt-4 font-serif text-4xl text-[var(--store-ink)] md:text-5xl">
                    {doctor.nameTh}
                  </h2>
                  <p lang="en" className="mt-2 font-serif text-xl text-[var(--store-muted)]">
                    {doctor.name}
                  </p>
                  <p className="mt-6 max-w-xl text-sm leading-[1.9] text-[var(--store-muted)]">
                    {doctor.summary}
                  </p>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="border-b border-black/[0.08] pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                  >
                    Academic Excellence
                  </h3>
                  <ul className="mt-6 space-y-6">
                    {doctor.education.map((item) => (
                      <li
                        key={item.degree}
                        className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6"
                      >
                        <span className="font-serif text-lg text-[var(--store-ink)] md:w-72 md:shrink-0">
                          {item.degree}
                        </span>
                        <span className="text-xs leading-relaxed text-[var(--store-muted)]">
                          {item.institution}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="border-b border-black/[0.08] pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                  >
                    Experience
                  </h3>
                  <ul className="mt-6 mb-12 space-y-3">
                    {doctor.experience.map((item) => (
                      <li key={item} className="flex gap-3 text-xs leading-[1.7] text-[var(--store-muted)]">
                        <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-black/10" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                  >
                    Specializations
                  </h3>
                  <ul className="mt-5 flex flex-wrap gap-3">
                    {doctor.expertise.map((item) => (
                      <li
                        key={item}
                        lang="en"
                        className="rounded-full border border-black/10 px-4 py-2 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--store-ink)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                  <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-[var(--store-muted)]">
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
      <section className="border-t border-black/[0.08] bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex flex-col gap-14 md:flex-row-reverse md:gap-20">
            <div className="w-full md:w-5/12">
              <Reveal>
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] shadow-2xl shadow-black/5">
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
                <div className="mt-6 space-y-2">
                  <p className="text-[0.66rem] uppercase tracking-[0.2em] text-[var(--store-ink)]">
                    ใบประกอบวิชาชีพเวชกรรมเลขที่ {doctorEesha.licenseNo}
                  </p>
                  <p className="text-[0.66rem] tracking-wide text-[var(--store-muted)]">
                    ให้คำปรึกษาเป็นภาษา {doctorEesha.languages.join(' · ')}
                  </p>
                </div>
              </Reveal>
            </div>

            <div className="w-full md:w-7/12">
              <Reveal className="space-y-12 border-l border-black/10 pl-8 md:pl-12">
                <div>
                  <SectionLabel index={3}>แพทย์ประจำคลินิก</SectionLabel>
                  <h2 className="mt-4 font-serif text-4xl text-[var(--store-ink)] md:text-5xl">
                    {doctorEesha.name}
                  </h2>
                  <p className="mt-1 font-serif text-xl text-[var(--store-muted)]">{doctorEesha.nameTh}</p>
                  <p
                    lang="en"
                    className="mt-3 text-[0.7rem] uppercase tracking-[0.14em] text-[var(--store-muted)]"
                  >
                    {doctorEesha.credentials}
                  </p>
                  <p className="mt-3 text-sm text-[var(--store-muted)]">{doctorEesha.role}</p>
                  <p className="mt-6 max-w-xl text-sm leading-[1.9] text-[var(--store-muted)]">
                    {doctorEesha.summary}
                  </p>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="border-b border-black/[0.08] pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                  >
                    Education &amp; Credentials
                  </h3>
                  <ul className="mt-6 space-y-6">
                    {doctorEesha.education.map((item) => (
                      <li
                        key={item.degree}
                        className="flex flex-col gap-1 md:flex-row md:items-baseline md:gap-6"
                      >
                        <span className="font-serif text-lg text-[var(--store-ink)] md:w-72 md:shrink-0">
                          {item.degree}
                        </span>
                        <span className="text-xs leading-relaxed text-[var(--store-muted)]">
                          {item.institution}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="border-b border-black/[0.08] pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                  >
                    Experience
                  </h3>
                  <ul className="mt-5 space-y-3">
                    {doctorEesha.experience.map((item) => (
                      <li key={item} className="flex gap-3 text-xs leading-[1.7] text-[var(--store-muted)]">
                        <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-black/10" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="grid gap-10 sm:grid-cols-2">
                  <div>
                    <h3
                      lang="en"
                      className="border-b border-black/[0.08] pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                    >
                      Selected Training
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {doctorEesha.training.map((item) => (
                        <li key={item} className="flex gap-3 text-xs leading-[1.7] text-[var(--store-muted)]">
                          <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-black/10" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3
                      lang="en"
                      className="border-b border-black/[0.08] pb-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                    >
                      Professional &amp; Research
                    </h3>
                    <ul className="mt-5 space-y-3">
                      {doctorEesha.memberships.map((item) => (
                        <li key={item} className="flex gap-3 text-xs leading-[1.7] text-[var(--store-muted)]">
                          <span aria-hidden="true" className="mt-2 h-px w-3 shrink-0 bg-black/10" />
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                  >
                    Clinical Focus
                  </h3>
                  <ul className="mt-5 flex flex-wrap gap-3">
                    {doctorEesha.expertise.map((item) => (
                      <li
                        key={item}
                        lang="en"
                        className="rounded-full border border-black/10 px-4 py-2 text-[0.66rem] uppercase tracking-[0.12em] text-[var(--store-ink)]"
                      >
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h3
                    lang="en"
                    className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]"
                  >
                    Technologies &amp; Modalities
                  </h3>
                  <p lang="en" className="mt-5 text-sm leading-[2] text-[var(--store-muted)]">
                    {doctorEesha.technologies.join(' · ')}
                  </p>
                  <p className="mt-8 flex items-start gap-2 text-xs leading-relaxed text-[var(--store-muted)]">
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
          <div aria-hidden="true" className="absolute inset-0 bg-[var(--store-surface)]">
            <ImagePlaceholder />
          </div>
        )}
        <div aria-hidden="true" className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 flex items-center justify-center px-6 text-center">
          <div className="max-w-2xl">
            <h2 className="font-serif text-3xl text-white md:text-5xl">{site.name}</h2>
            <p className="mt-4 text-sm tracking-wide text-white/80">
              {site.address.street} · {site.address.district} · กรุงเทพฯ
            </p>
          </div>
        </div>
      </section>

      {/* ── Consultation CTA + info ──────────────────────────── */}
      <section className="bg-[var(--store-surface)] px-6 py-24 sm:px-10 md:px-14 md:py-28 lg:px-20">
        <div className="mx-auto flex max-w-6xl flex-col gap-14 md:flex-row md:justify-between">
          <div className="w-full space-y-8 md:w-1/2">
            <h2 className="font-serif text-3xl text-[var(--store-ink)] md:text-4xl">นัดหมายปรึกษาแพทย์</h2>
            <p className="max-w-md text-sm leading-[1.9] text-[var(--store-muted)] md:text-base">
              ทุกหัตถการเริ่มต้นจากการประเมินโครงหน้าและเป้าหมายของแต่ละบุคคลอย่างละเอียดโดยแพทย์
            </p>
            <div className="flex flex-col gap-4">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                className="group flex items-center justify-between rounded-full bg-[#06C755] px-8 py-4 text-white transition-all duration-200 hover:bg-[#05b34c] hover:shadow-sm active:scale-[0.98]"
              >
                <span className="flex items-center gap-2.5 text-xs font-medium tracking-[0.1em]">
                  <LineIcon className="size-4" />
                  จองคิวผ่าน LINE
                </span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </a>
              <Link
                href="/services"
                className="group flex items-center justify-between rounded-full border border-black/20 bg-transparent px-8 py-4 text-[var(--store-ink)] transition-all duration-200 hover:border-black/30 hover:bg-black/5 active:scale-[0.98]"
              >
                <span className="text-xs font-medium tracking-[0.1em]">ดูบริการทั้งหมด</span>
                <ArrowRight
                  aria-hidden="true"
                  className="size-4 transition-transform duration-200 group-hover:translate-x-1"
                />
              </Link>
            </div>
          </div>

          <div className="w-full space-y-8 border-t border-black/[0.08] pt-12 md:w-1/3 md:border-l md:border-t-0 md:pl-12 md:pt-0">
            <div>
              <h3 className="text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]">
                ที่ตั้ง
              </h3>
              <p className="mt-4 text-sm leading-[1.9] text-[var(--store-muted)]">{site.addressFull}</p>
              <a
                href={site.mapsUrl}
                target="_blank"
                rel="noopener"
                className="mt-3 inline-flex items-center gap-1.5 text-[0.66rem] uppercase tracking-wide text-[var(--store-ink)] underline underline-offset-4 hover:opacity-60"
              >
                <MapPin aria-hidden="true" className="size-3.5" /> ดูแผนที่
              </a>
            </div>
            <div>
              <h3 className="flex items-center gap-2 text-[0.66rem] font-medium uppercase tracking-[0.2em] text-[var(--store-ink)]">
                <ShieldCheck aria-hidden="true" className="size-3.5" /> ใบอนุญาตสถานพยาบาล
              </h3>
              <p className="mt-3 text-sm text-[var(--store-muted)]">{site.license}</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
