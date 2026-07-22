'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

/**
 * Sticky in-page section nav for the long admin pages (images, products). Observes the section
 * elements by id (the page renders them with matching ids) and highlights whichever sits nearest
 * the top of the viewport. The primary /admin area switcher is the left sidebar, not this.
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
      // Sticks below the mobile top bar (h-14); on desktop there is no top bar, so it pins to 0.
      className="sticky top-14 z-10 -mx-6 flex gap-1.5 overflow-x-auto border-b border-black/[0.06] bg-sand/80 px-6 py-3 backdrop-blur-xl lg:top-0"
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
