import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { ImageIcon, LogOut, ExternalLink } from 'lucide-react';
import { site } from '@/lib/site';
import { cld } from '@/lib/cloud';

export const metadata: Metadata = {
  title: { default: 'จัดการเว็บไซต์', template: '%s — Kazumi Admin' },
  // robots.ts already disallows /admin; this covers crawlers that ignore it. The real gate is
  // middleware.ts — these are only belt and braces.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminEmail = (await headers()).get('x-admin-email');

  return (
    <div className="min-h-screen bg-sand/40">
      <header className="sticky top-0 z-30 border-b border-olive/15 bg-cream/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-6 py-3">
          <Link href="/admin" className="flex items-center gap-2.5 text-olive-deep">
            {/* eslint-disable-next-line @next/next/no-img-element -- fixed 96x96 Cloudinary crop */}
            <img
              src={cld(site.logoMark, { width: 56, crop: 'fit' })}
              alt=""
              aria-hidden="true"
              width={28}
              height={28}
              className="size-7"
            />
            <span className="font-serif tracking-widest">KAZUMI</span>
            <span className="rounded-full bg-olive/10 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.15em] text-olive">
              Admin
            </span>
          </Link>

          <nav className="flex items-center gap-1 text-sm" aria-label="เมนูผู้ดูแล">
            <Link
              href="/admin"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-olive-deep hover:bg-olive/10"
            >
              <ImageIcon className="size-4" />
              รูปภาพ
            </Link>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-ink/60 hover:bg-olive/10 hover:text-olive-deep"
            >
              <ExternalLink className="size-4" />
              ดูเว็บจริง
            </a>
          </nav>

          <div className="flex items-center gap-3">
            {adminEmail && (
              <span className="hidden text-xs text-ink/50 sm:block">{adminEmail}</span>
            )}
            {/* Ends the Cloudflare Access session — the login itself is Cloudflare's, not ours. */}
            <a
              href="/cdn-cgi/access/logout"
              className="flex items-center gap-1.5 rounded-full border border-olive/20 px-3 py-1.5 text-xs text-ink/60 hover:bg-olive/10 hover:text-olive-deep"
            >
              <LogOut className="size-3.5" />
              ออกจากระบบ
            </a>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">{children}</main>
    </div>
  );
}
