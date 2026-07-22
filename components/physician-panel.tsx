import Image from 'next/image';
import Link from 'next/link';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { Reveal } from '@/components/reveal';

export type PhysicianPanelProps = {
  label: string;
  name: string;
  nameSecondary: string;
  role: string;
  licenseNo: string;
  summary: string;
  expertise: readonly string[];
  languages: readonly string[];
  imageSrc?: string;
  imageAlt: string;
  delay?: number;
};

export function PhysicianPanel({
  label,
  name,
  nameSecondary,
  role,
  licenseNo,
  summary,
  expertise,
  languages,
  imageSrc,
  imageAlt,
  delay = 0,
}: PhysicianPanelProps) {
  return (
    <Reveal delay={delay} className="h-full">
      <article className="apple-doctor-card group flex h-full flex-col overflow-hidden rounded-[1.75rem] bg-[var(--store-card)] text-[var(--store-ink)]">
        {/* Photo on top — Apple-style card image. Shorter on phones so the whole card stays compact. */}
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-sand md:aspect-[2/1]">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={imageAlt}
              fill
              sizes="(min-width: 768px) 40rem, 100vw"
              className="object-cover object-top transition-transform duration-700 ease-out group-hover:scale-[1.03]"
            />
          ) : (
            <div aria-hidden="true" className="absolute inset-0 flex items-center justify-center">
              <div className="flex size-24 items-center justify-center rounded-full border border-[var(--store-control)]">
                <Sparkles className="size-8 text-[var(--store-muted)]" strokeWidth={1} />
              </div>
            </div>
          )}
        </div>

        {/* Text below */}
        <div className="flex flex-1 flex-col px-6 pb-6 pt-5 text-center sm:px-10 sm:pb-8 sm:pt-7 md:px-8 lg:px-12">
          <p className="text-[0.62rem] uppercase tracking-[0.28em] text-[var(--store-muted)]">{label}</p>
          <h3 className="mt-2 font-serif text-[1.55rem] leading-tight sm:mt-2.5 sm:text-[1.9rem] md:text-[2.15rem]">
            {name}
          </h3>
          <p lang="en" className="mt-1 font-serif text-base italic text-[var(--store-muted)]">
            {nameSecondary}
          </p>
          <p className="mt-2 text-[0.68rem] uppercase tracking-[0.17em] text-forest sm:mt-2.5">{role}</p>
          <p className="mx-auto mt-3 line-clamp-3 max-w-lg text-[0.82rem] leading-[1.65] text-[var(--store-muted)] sm:mt-4 sm:line-clamp-none sm:text-sm sm:leading-[1.8]">
            {summary}
          </p>

          <ul
            lang="en"
            className="mx-auto mt-4 flex max-w-lg flex-wrap justify-center gap-1.5 sm:mt-5 sm:gap-2"
          >
            {expertise.map((item) => (
              <li
                key={item}
                className="rounded-full bg-[var(--store-surface)] px-2.5 py-1 text-[0.68rem] text-[var(--store-control-ink)] sm:px-3 sm:py-1.5 sm:text-[0.7rem]"
              >
                {item}
              </li>
            ))}
          </ul>

          <dl className="mx-auto mt-4 flex flex-wrap justify-center gap-x-6 gap-y-1.5 text-[0.7rem] text-[var(--store-muted)] sm:mt-5 sm:gap-x-8 sm:gap-y-2 sm:text-[0.72rem]">
            <div className="flex items-center gap-1.5">
              <dt className="uppercase tracking-[0.16em] text-[var(--store-muted)]/70">ใบประกอบวิชาชีพ</dt>
              <dd className="text-[var(--store-ink)]">เลขที่ {licenseNo}</dd>
            </div>
            <div className="flex items-center gap-1.5">
              <dt className="uppercase tracking-[0.16em] text-[var(--store-muted)]/70">ภาษา</dt>
              <dd className="text-[var(--store-ink)]">{languages.join(' · ')}</dd>
            </div>
          </dl>

          <div className="mt-auto pt-5 sm:pt-6">
            <Link
              href="/about"
              className="inline-flex items-center gap-1.5 text-[0.9rem] text-forest transition-colors duration-200 hover:text-mint"
            >
              ดูประวัติฉบับเต็ม <ArrowUpRight className="size-4" />
            </Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}
