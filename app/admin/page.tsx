import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Image from 'next/image';
import { AlertTriangle, Lock } from 'lucide-react';
import { siteImages, bakedInImages } from '@/lib/site-images';

// Belt and braces with robots.ts §5: robots.txt asks crawlers not to fetch /admin, this tells
// any that ignore it not to index what they find. Middleware is what actually keeps them out.
export const metadata: Metadata = {
  title: 'จัดการรูปภาพ',
  robots: { index: false, follow: false },
};

// The clinic's images are per-request state, not build output — never prerender this.
export const dynamic = 'force-dynamic';

export default async function AdminImagesPage() {
  // Set by middleware.ts after it verified the Cloudflare Access JWT. Reaching this line at all
  // means the gate passed; if middleware were ever removed this would be empty, so read it
  // rather than assume.
  const adminEmail = (await headers()).get('x-admin-email');

  return (
    <div className="mx-auto max-w-5xl px-6 py-12">
      <header className="flex flex-wrap items-end justify-between gap-4 border-b border-olive/15 pb-6">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-olive-light">Admin</p>
          <h1 className="mt-2 font-serif text-3xl text-olive-deep">จัดการรูปภาพ</h1>
        </div>
        {adminEmail && (
          <p className="flex items-center gap-2 text-xs text-ink/50">
            <Lock className="size-3.5" />
            {adminEmail}
          </p>
        )}
      </header>

      <section className="mt-10">
        <h2 className="font-serif text-xl text-olive-deep">รูปที่เปลี่ยนเองได้</h2>
        <p className="mt-1.5 text-sm text-ink/60">
          รูปเหล่านี้เก็บบน Cloudinary — เปลี่ยนแล้วเว็บอัปเดตโดยไม่ต้องแก้โค้ด
        </p>

        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {siteImages.map((image) => (
            <li
              key={image.key}
              className="flex gap-4 rounded-2xl border border-olive/15 bg-cream p-4"
            >
              <div className="relative size-24 shrink-0 overflow-hidden rounded-xl bg-sand">
                <Image
                  src={image.defaultPublicId}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0">
                <p className="font-serif text-lg text-olive-deep">{image.label}</p>
                <p className="mt-0.5 text-xs text-ink/55">{image.where}</p>
                <p className="mt-1.5 text-xs text-olive-light">{image.ratioHint}</p>
                <code className="mt-2 block truncate text-[0.65rem] text-ink/40">
                  {image.defaultPublicId}
                </code>
              </div>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-12">
        <h2 className="font-serif text-xl text-olive-deep">รูปที่ยังเปลี่ยนเองไม่ได้</h2>
        <div className="mt-3 flex gap-3 rounded-2xl border border-clay/50 bg-clay/10 p-4 text-sm text-ink/70">
          <AlertTriangle className="mt-0.5 size-4 shrink-0 text-clay" />
          <p>
            รูป {bakedInImages.length} ใบนี้เป็นไฟล์ที่ถูก build ติดไปกับโค้ด (อยู่ใน{' '}
            <code className="text-xs">public/</code>) — เปลี่ยนจากหน้านี้ไม่ได้ ต้องย้ายขึ้น
            Cloudinary ก่อน
          </p>
        </div>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {bakedInImages.map((image) => (
            <li
              key={image.path}
              className="flex items-center gap-3 rounded-xl border border-olive/10 px-3 py-2"
            >
              <span className="relative size-10 shrink-0 overflow-hidden rounded-md bg-sand">
                <Image
                  src={image.path}
                  alt=""
                  aria-hidden="true"
                  fill
                  sizes="40px"
                  className="object-cover"
                />
              </span>
              <span className="min-w-0">
                <span className="block truncate text-sm text-ink/75">{image.label}</span>
                <span className="block truncate text-xs text-ink/45">{image.where}</span>
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
