import type { Metadata } from 'next';
import Link from 'next/link';
import { headers } from 'next/headers';
import { LogOut, ExternalLink } from 'lucide-react';
import { site } from '@/lib/site';
import { cld } from '@/lib/cloud';
import { AdminNav } from '@/components/admin/nav';

export const metadata: Metadata = {
  title: { default: 'จัดการเว็บไซต์', template: '%s — Kazumi Admin' },
  // robots.ts already disallows /admin; this covers crawlers that ignore it. The real gate is
  // middleware.ts — these are only belt and braces.
  robots: { index: false, follow: false },
};

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const adminEmail = (await headers()).get('x-admin-email');

  return (
    <div className="min-h-screen bg-sand">
      <header className="sticky top-0 z-30 border-b border-black/[0.07] bg-cream/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-6 py-2.5">
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-2.5">
              {/* eslint-disable-next-line @next/next/no-img-element -- fixed 96x96 Cloudinary crop */}
              <img
                src={cld(site.logoMark, { width: 56, crop: 'fit' })}
                alt=""
                aria-hidden="true"
                width={28}
                height={28}
                className="size-7"
              />
              <span className="font-serif text-lg tracking-[0.14em] text-ink">KAZUMI</span>
              <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.14em] text-ink/45">
                Admin
              </span>
            </Link>
            <span className="hidden h-5 w-px bg-black/10 sm:block" />
            <div className="hidden sm:block">
              <AdminNav />
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="hidden items-center gap-1.5 rounded-full px-3 py-1.5 text-xs text-ink/50 transition-colors hover:bg-black/[0.05] hover:text-ink md:flex"
            >
              <ExternalLink className="size-3.5" />
              ดูเว็บจริง
            </a>
            {adminEmail && (
              <span className="hidden text-xs text-ink/40 lg:block">{adminEmail}</span>
            )}
            {/* Ends the Cloudflare Access session — the login itself is Cloudflare's, not ours.
                no-html-link-for-pages fires a false positive here: it matches /cdn-cgi/... against
                the [category] dynamic route. This endpoint is served by Cloudflare, never by Next,
                so <Link> would client-side navigate into the category page and never log anyone out. */}
            {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
            <a
              href="/cdn-cgi/access/logout"
              className="flex items-center gap-1.5 rounded-full bg-black/[0.05] px-3 py-1.5 text-xs text-ink/70 transition-colors hover:bg-black/[0.09] hover:text-ink"
            >
              <LogOut className="size-3.5" />
              <span className="hidden sm:inline">ออกจากระบบ</span>
            </a>
          </div>
        </div>

        {/* On small screens the section switcher drops to its own row so the brand bar stays calm. */}
        <div className="border-t border-black/[0.06] px-6 py-2 sm:hidden">
          <AdminNav />
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 sm:py-12">{children}</main>
    </div>
  );
}
