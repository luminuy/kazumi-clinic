'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  CalendarCheck,
  ExternalLink,
  FileText,
  ImageIcon,
  LayoutDashboard,
  LogOut,
  Menu,
  Package,
  Star,
  Tag,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cld } from '@/lib/cloud';
import { cn } from '@/lib/utils';

type NavItem = { href: string; label: string; icon: LucideIcon; hint: string };
type NavGroup = { label?: string; items: NavItem[] };

// Grouped so the clinic reads the panel as "where do I go?" not "which of six links?".
const NAV: NavGroup[] = [
  { items: [{ href: '/admin', label: 'ภาพรวม', icon: LayoutDashboard, hint: 'สรุปทั้งหมด' }] },
  {
    label: 'เนื้อหาเว็บไซต์',
    items: [
      { href: '/admin/images', label: 'รูปภาพ', icon: ImageIcon, hint: 'รูปทั้งไซต์' },
      { href: '/admin/products', label: 'สินค้า', icon: Package, hint: 'บริการ + ราคา' },
      { href: '/admin/promotions', label: 'โปรโมชั่น', icon: Tag, hint: 'โปรฯ / แพ็กเกจ' },
      { href: '/admin/reviews', label: 'รีวิว', icon: Star, hint: 'รีวิว + ก่อน-หลัง' },
      { href: '/admin/blog', label: 'บทความ', icon: FileText, hint: 'บทความ / ความรู้' },
    ],
  },
  {
    label: 'ลูกค้า',
    items: [{ href: '/admin/leads', label: 'นัดหมาย', icon: CalendarCheck, hint: 'คำขอนัดหมาย' }],
  },
];

/**
 * `logoPublicId` is resolved from the `brand-mark` slot by the layout, not read from
 * `site.logoMark`: the shipped default no longer exists in Cloudinary, so building the URL from
 * it put a broken image in the admin's own header. No upload yet → the wordmark stands alone.
 */
function Brand({ logoPublicId, onNavigate }: { logoPublicId?: string; onNavigate?: () => void }) {
  return (
    <Link href="/admin" onClick={onNavigate} className="flex items-center gap-2.5">
      {logoPublicId && (
        /* eslint-disable-next-line @next/next/no-img-element -- fixed 56px Cloudinary crop */
        <img
          src={cld(logoPublicId, { width: 56, crop: 'fit' })}
          alt=""
          aria-hidden="true"
          width={28}
          height={28}
          className="size-7"
        />
      )}
      <span className="font-serif text-lg tracking-[0.14em] text-ink">KAZUMI</span>
      <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[0.58rem] font-medium uppercase tracking-[0.14em] text-ink/45">
        Admin
      </span>
    </Link>
  );
}

function NavLinks({ onNavigate, newLeads }: { onNavigate?: () => void; newLeads: number }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-5" aria-label="เมนูผู้ดูแล">
      {NAV.map((group, i) => (
        <div key={group.label ?? `group-${i}`} className="flex flex-col gap-1">
          {group.label && (
            <p className="px-3 pb-1 text-[0.62rem] font-medium uppercase tracking-[0.14em] text-ink/35">
              {group.label}
            </p>
          )}
          {group.items.map(({ href, label, icon: Icon, hint }) => {
            // Exact match: /admin is a prefix of every other route, so startsWith would light them all.
            const active = pathname === href;
            const badge = href === '/admin/leads' && newLeads > 0 ? newLeads : null;
            return (
              <Link
                key={href}
                href={href}
                onClick={onNavigate}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'group flex items-center gap-3 rounded-xl px-3 py-2.5 transition-colors',
                  active ? 'bg-ink text-white' : 'text-ink/65 hover:bg-black/[0.05] hover:text-ink',
                )}
              >
                <Icon
                  className={cn('size-[1.15rem] shrink-0', active ? 'text-white' : 'text-ink/45')}
                  strokeWidth={1.6}
                />
                <span className="flex min-w-0 flex-col">
                  <span className="text-sm font-medium leading-tight">{label}</span>
                  <span
                    className={cn(
                      'text-[0.68rem] leading-tight',
                      active ? 'text-white/60' : 'text-ink/40',
                    )}
                  >
                    {hint}
                  </span>
                </span>
                {badge != null && (
                  <span
                    className={cn(
                      'ml-auto grid min-w-5 shrink-0 place-items-center rounded-full px-1.5 py-0.5 text-[0.62rem] font-semibold tabular-nums',
                      active ? 'bg-white/20 text-white' : 'bg-forest text-white',
                    )}
                    aria-label={`${badge} รายการใหม่`}
                  >
                    {badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );
}

function SidebarBody({
  email,
  newLeads,
  logoPublicId,
  onNavigate,
}: {
  email: string | null;
  newLeads: number;
  logoPublicId?: string;
  onNavigate?: () => void;
}) {
  return (
    <div className="flex h-full flex-col">
      <div className="px-5 py-5">
        <Brand logoPublicId={logoPublicId} onNavigate={onNavigate} />
      </div>
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <NavLinks onNavigate={onNavigate} newLeads={newLeads} />
      </div>
      <div className="border-t border-black/[0.06] px-3 py-3">
        <a
          href="/"
          target="_blank"
          rel="noopener"
          className="flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink/60 transition-colors hover:bg-black/[0.05] hover:text-ink"
        >
          <ExternalLink className="size-[1.05rem] shrink-0 text-ink/40" strokeWidth={1.6} />
          ดูเว็บจริง
        </a>
        {/* Ends the Cloudflare Access session — the login itself is Cloudflare's, not ours.
            no-html-link-for-pages false-positives here (it matches /cdn-cgi against the [category]
            route); this endpoint is served by Cloudflare, so <Link> would never log anyone out. */}
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a
          href="/cdn-cgi/access/logout"
          className="mt-0.5 flex items-center gap-2.5 rounded-xl px-3 py-2 text-sm text-ink/60 transition-colors hover:bg-black/[0.05] hover:text-ink"
        >
          <LogOut className="size-[1.05rem] shrink-0 text-ink/40" strokeWidth={1.6} />
          ออกจากระบบ
        </a>
        {email && (
          <p className="truncate px-3 pt-2 text-[0.68rem] text-ink/35" title={email}>
            {email}
          </p>
        )}
      </div>
    </div>
  );
}

export function AdminSidebar({
  email,
  newLeads = 0,
  logoPublicId,
}: {
  email: string | null;
  newLeads?: number;
  logoPublicId?: string;
}) {
  const [open, setOpen] = useState(false);

  // The drawer closes itself from every in-drawer link (onNavigate) and the backdrop/Escape, so
  // no route-watching effect is needed — which also keeps setState out of an effect body.

  // Escape closes the drawer; lock body scroll while it's open.
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open]);

  return (
    <>
      {/* Mobile top bar */}
      <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-black/[0.07] bg-cream/85 px-4 backdrop-blur-xl lg:hidden">
        <Brand logoPublicId={logoPublicId} />
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="เปิดเมนู"
          aria-expanded={open}
          className="grid size-9 place-items-center rounded-full text-ink/70 transition-colors hover:bg-black/[0.06]"
        >
          <Menu className="size-5" />
        </button>
      </header>

      {/* Mobile drawer backdrop */}
      {open && (
        <button
          type="button"
          aria-label="ปิดเมนู"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-ink/30 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar — off-canvas drawer on mobile, sticky column on desktop */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-72 border-r border-black/[0.07] bg-cream transition-transform duration-300 ease-out',
          'lg:sticky lg:top-0 lg:z-auto lg:h-screen lg:w-60 lg:shrink-0 lg:translate-x-0 lg:transition-none',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Close button, mobile only */}
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="ปิดเมนู"
          className="absolute right-3 top-4 grid size-8 place-items-center rounded-full text-ink/60 transition-colors hover:bg-black/[0.06] lg:hidden"
        >
          <X className="size-4" />
        </button>
        <SidebarBody
          email={email}
          newLeads={newLeads}
          logoPublicId={logoPublicId}
          onNavigate={() => setOpen(false)}
        />
      </aside>
    </>
  );
}
