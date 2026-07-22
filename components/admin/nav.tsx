'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { FileText, ImageIcon, Package, Star, Tag } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { href: '/admin', label: 'รูปภาพ', icon: ImageIcon },
  { href: '/admin/products', label: 'สินค้า', icon: Package },
  { href: '/admin/promotions', label: 'โปรโมชั่น', icon: Tag },
  { href: '/admin/reviews', label: 'รีวิว', icon: Star },
  { href: '/admin/blog', label: 'บทความ', icon: FileText },
] as const;

/** Header section switcher with an active-page pill. */
export function AdminNav() {
  const pathname = usePathname();
  return (
    <nav className="flex items-center gap-1" aria-label="เมนูผู้ดูแล">
      {items.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-colors',
              active ? 'bg-ink text-white' : 'text-ink/55 hover:bg-black/[0.05] hover:text-ink',
            )}
          >
            <Icon className="size-4" />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

/**
 * Sticky in-page category nav that tracks the section currently in view. Observes the section
 * elements by id (the page renders them with matching ids) and highlights whichever sits nearest
 * the top of the viewport.
 */
export function SectionNav({ items: sections }: { items: { id: string; label: string }[] }) {
  const [active, setActive] = useState(sections[0]?.id ?? '');

  useEffect(() => {
    const els = sections
      .map((s) => document.getElementById(s.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const onscreen = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (onscreen[0]) setActive(onscreen[0].target.id);
      },
      // Trip the highlight when a section reaches the upper third, and hold it until the next one
      // does — so the active chip matches what the eye is reading, not what's merely on screen.
      { rootMargin: '-15% 0px -75% 0px' },
    );
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, [sections]);

  return (
    <nav
      aria-label="หมวดหมู่"
      className="sticky top-[5.75rem] z-10 -mx-6 flex gap-1.5 overflow-x-auto border-b border-black/[0.06] bg-sand/80 px-6 py-3 backdrop-blur-xl sm:top-[3.25rem]"
    >
      {sections.map(({ id, label }) => (
        <a
          key={id}
          href={`#${id}`}
          aria-current={active === id ? 'true' : undefined}
          className={cn(
            'shrink-0 rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
            active === id
              ? 'bg-ink text-white'
              : 'bg-black/[0.04] text-ink/55 hover:bg-black/[0.08] hover:text-ink',
          )}
        >
          {label}
        </a>
      ))}
    </nav>
  );
}
