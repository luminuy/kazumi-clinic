'use client';

import { useCallback, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import { Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { MobileMenuContent } from '@/components/mobile-menu-sheet';

// The hamburger panel was the only *eager* Base UI Dialog on the public site, and Dialog is a
// 57KB / 18.4KB-gzip chunk of its own (measured on production 2026-08-04) — downloaded, parsed and
// hydrated on every page view, desktop included, for a control that only exists below `md`.
// Search and account modals were already `next/dynamic`, but they shared that chunk, so splitting
// them bought nothing while the header pulled Dialog in statically. This is the missing half.
//
// Only the trigger stays in the initial bundle. The panel module is fetched on the first hint of
// intent (hover/focus/press) and mounted on the click itself, so by the time the sheet is asked to
// open the chunk is normally already there.
const MobileMenuSheet = dynamic(
  () => import('@/components/mobile-menu-sheet').then((m) => m.MobileMenuSheet),
  { ssr: false },
);

export function MobileMenu({
  openLabel,
  ...content
}: MobileMenuContent & { openLabel: string }) {
  const [open, setOpen] = useState(false);
  // Kept latched: closing the sheet shouldn't unmount the module we just paid to load.
  const [mounted, setMounted] = useState(false);
  const warmed = useRef(false);

  const warm = useCallback(() => {
    if (warmed.current) return;
    warmed.current = true;
    void import('@/components/mobile-menu-sheet');
  }, []);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        aria-label={openLabel}
        onPointerEnter={warm}
        onPointerDown={warm}
        onFocus={warm}
        onClick={() => {
          setMounted(true);
          setOpen(true);
        }}
      >
        <Menu className="size-5" />
      </Button>

      {mounted && <MobileMenuSheet open={open} onOpenChange={setOpen} {...content} />}
    </>
  );
}
