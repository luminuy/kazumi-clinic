import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, Check, MessageCircle, ShieldCheck } from 'lucide-react';
import type { ServiceCategory } from '@/lib/services';
import { doctor } from '@/lib/doctor';
import { site } from '@/lib/site';
import { Button } from '@/components/ui/button';
import { Reveal } from '@/components/reveal';
import { SectionLabel } from '@/components/page-hero';

export function FillerServicePage({
  service,
  heroImage,
}: {
  service: ServiceCategory;
  heroImage: string;
}) {
  return (
    <div className="overflow-hidden bg-sand">
      <section className="px-6 pb-20 pt-28 md:px-10 md:pb-28 md:pt-36">
        <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-7">
            <nav aria-label="Breadcrumb" className="mb-12 flex items-center gap-2 text-xs text-ink/50">
              <Link href="/" className="transition-colors duration-150 hover:text-olive-deep">
                หน้าหลัก
              </Link>
              <span aria-hidden="true">/</span>
              <Link href="/services" className="transition-colors duration-150 hover:text-olive-deep">
                บริการ
              </Link>
              <span aria-hidden="true">/</span>
              <span className="text-olive-deep">{service.title}</span>
            </nav>

            <p className="section-eyebrow">Medical Aesthetic Excellence</p>
            <h1 className="mt-6 font-serif text-[clamp(4rem,9vw,8rem)] leading-[0.82] tracking-[-0.055em] text-olive-deep">
              {service.titleEn}
              <span className="mt-5 block text-[0.44em] font-normal italic tracking-[-0.02em] text-olive-light">
                ({service.title})
              </span>
            </h1>
            <p className="mt-10 max-w-2xl text-base leading-[1.9] text-ink/70 md:text-lg">
              {service.description}
            </p>

            <div className="mt-10 flex flex-col gap-4 border-t border-olive/20 pt-6 text-sm text-olive-deep sm:flex-row sm:gap-10">
              <span className="flex items-center gap-2.5">
                <ShieldCheck className="size-4" aria-hidden="true" />
                ประเมินโดยแพทย์ก่อนรับบริการ
              </span>
              <span className="flex items-center gap-2.5">
                <Check className="size-4" aria-hidden="true" />
                ฟิลเลอร์กรดไฮยาลูรอนิก
              </span>
            </div>
          </div>

          <div className="relative lg:col-span-5">
            <div className="relative ml-auto aspect-[1/1.618] w-[min(100%,31rem)] overflow-hidden bg-cream">
              <Image
                src={heroImage}
                alt={service.heroAlt ?? ''}
                fill
                priority
                fetchPriority="high"
                sizes="(min-width: 1024px) 40vw, 90vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-8 -left-8 -z-0 h-40 w-40 border-b border-l border-olive/25 md:h-52 md:w-52" aria-hidden="true" />
          </div>
        </div>
      </section>

      <section className="border-y border-olive/10 bg-cream px-6 py-20 text-center md:py-24">
        <Reveal className="mx-auto max-w-4xl">
          <SectionLabel index={1}>Our philosophy</SectionLabel>
          <h2 className="mt-7 font-serif text-4xl italic leading-tight text-olive-deep md:text-6xl">
            “{site.taglineTh}”
          </h2>
          <p className="mx-auto mt-6 max-w-xl text-sm leading-[1.8] text-ink/60">
            แพทย์ประเมินโครงหน้าและวางแผนการดูแลเฉพาะบุคคลก่อนรับบริการทุกครั้ง
          </p>
        </Reveal>
      </section>

      <section className="px-6 py-24 md:px-10 md:py-32">
        <div className="mx-auto max-w-6xl">
          <Reveal className="grid gap-8 border-b border-olive/20 pb-9 md:grid-cols-[1fr_0.62fr] md:items-end">
            <div>
              <SectionLabel index={2}>Treatment selection</SectionLabel>
              <h2 className="mt-5 font-serif text-4xl leading-none text-olive-deep md:text-6xl">
                รายการฟิลเลอร์
              </h2>
            </div>
            <p className="text-sm leading-[1.8] text-ink/60 md:text-right">
              รายการและขนาดผลิตภัณฑ์ที่คลินิกมีให้บริการ แพทย์จะเป็นผู้ประเมินความเหมาะสมก่อนทำหัตถการ
            </p>
          </Reveal>

          <div className="grid md:grid-cols-2 lg:grid-cols-3">
            {service.items.map((item, index) => (
              <Reveal
                key={`${item.name}-${item.detail ?? ''}`}
                delay={(index % 3) * 60}
                className="border-b border-olive/20 py-10 md:px-8 md:first:pl-0 lg:[&:nth-child(3n+1)]:pl-0 lg:[&:nth-child(3n)]:pr-0"
              >
                <article className="flex h-full flex-col">
                  <span className="font-serif text-5xl italic text-olive/20" aria-hidden="true">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <div className="mt-10 min-h-24 border-l border-clay pl-5">
                    <h3 className="font-serif text-2xl leading-tight text-olive-deep">{item.name}</h3>
                    {item.detail && (
                      <p className="mt-2 text-xs uppercase tracking-[0.16em] text-ink/50">
                        {item.detail}
                      </p>
                    )}
                  </div>
                  <div className="mt-10 flex items-end justify-between gap-4">
                    <span className="text-xs uppercase tracking-[0.18em] text-ink/45">ราคาโปรโมชัน</span>
                    <p className="font-serif text-3xl text-olive-deep">
                      {item.priceFrom !== undefined ? item.priceFrom.toLocaleString('th-TH') : 'สอบถาม'}
                      {item.priceFrom !== undefined && (
                        <span className="ml-2 font-sans text-xs tracking-wide text-ink/50">บาท / {item.unit}</span>
                      )}
                    </p>
                  </div>
                </article>
              </Reveal>
            ))}
          </div>

          <p className="mt-8 border-l border-olive/30 pl-5 text-xs leading-relaxed text-ink/50">
            *ราคาโปรโมชัน โปรดสอบถามช่วงเวลาและเงื่อนไขล่าสุดกับคลินิกก่อนรับบริการ · ทุกหัตถการไม่แนะนำสำหรับผู้มีอายุต่ำกว่า 18 ปี · ผลลัพธ์แตกต่างกันในแต่ละบุคคล
          </p>
        </div>
      </section>

      <section className="bg-cream px-6 py-20 md:px-10 md:py-24">
        <Reveal className="mx-auto grid max-w-6xl gap-10 md:grid-cols-12 md:items-end">
          <div className="md:col-span-7">
            <SectionLabel index={3}>Doctor-led assessment</SectionLabel>
            <h2 className="mt-5 font-serif text-4xl text-olive-deep md:text-5xl">ดูแลและประเมินโดยแพทย์</h2>
            <p className="mt-6 max-w-2xl text-sm leading-[1.9] text-ink/65">{doctor.summary}</p>
          </div>
          <div className="border-l border-olive/25 pl-6 md:col-span-5">
            <p className="font-serif text-2xl text-olive-deep">{doctor.nameTh}</p>
            <p className="mt-2 text-sm text-ink/60">{doctor.role} · ใบประกอบวิชาชีพ {doctor.licenseNo}</p>
            <p className="mt-2 text-xs text-ink/45">ใบอนุญาตสถานพยาบาล {site.license}</p>
          </div>
        </Reveal>
      </section>

      <section className="bg-olive-deep px-6 py-24 text-sand md:px-10 md:py-32">
        <Reveal className="mx-auto grid max-w-6xl gap-12 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <p className="section-eyebrow section-eyebrow--dark">Medical consultation</p>
            <h2 className="mt-6 font-serif text-5xl leading-[0.95] tracking-tight md:text-7xl">
              เริ่มต้นด้วยการประเมิน
              <span className="block italic text-clay">อย่างเหมาะสมกับคุณ</span>
            </h2>
            <p className="mt-7 max-w-2xl text-sm leading-[1.9] text-sand/65">
              ติดต่อทีมงานเพื่อจองคิวปรึกษาแพทย์และสอบถามรายละเอียดบริการฟิลเลอร์
            </p>
          </div>
          <div className="flex flex-col gap-3 md:col-span-4">
            <Button
              render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
              className="h-14 rounded-none bg-sand px-6 text-olive-deep transition-[transform,background-color] duration-150 hover:bg-cream active:scale-[0.97]"
            >
              <MessageCircle className="size-4" />
              จองคิวฟิลเลอร์ผ่าน LINE
            </Button>
            <Button
              render={<Link href="/services" />}
              variant="outline"
              className="h-14 rounded-none border-sand/35 bg-transparent px-6 text-sand transition-[transform,background-color] duration-150 hover:bg-sand/10 hover:text-sand active:scale-[0.97]"
            >
              ดูบริการอื่น <ArrowRight className="size-4" />
            </Button>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
