'use client';

import * as React from 'react';
import { Dialog } from '@base-ui/react/dialog';
import { Button } from '@/components/ui/button';
import { XIcon, SearchIcon, ArrowRightIcon } from 'lucide-react';
import { useTranslations } from 'next-intl';

export function SearchModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const t = useTranslations('Search');
  const inputRef = React.useRef<HTMLInputElement>(null);

  // Focus input when modal opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [open]);

  // These pointed at /services/laser, /services/acne and /services/facial-design, none of which
  // exist — all three answered 404 in production (checked 2026-07-27). Category slugs live at the
  // root (`/laser-hifu`), not under /services. "ปรับรูปหน้า" has no category of its own, so it goes
  // to the catalogue rather than to a guessed treatment.
  const quickLinks = [
    { name: t('quickLinks.laser'), href: '/laser-hifu' },
    { name: t('quickLinks.acne'), href: '/acne-care' },
    { name: t('quickLinks.facialDesign'), href: '/services' },
    { name: t('quickLinks.promotions'), href: '/promotions' },
  ];

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-150 data-ending-style:opacity-0 data-starting-style:opacity-0" />
        <Dialog.Popup className="fixed left-[50%] top-4 sm:top-24 z-50 grid w-[calc(100vw-2rem)] sm:w-full max-w-2xl translate-x-[-50%] gap-4 border border-black/5 bg-white p-4 sm:p-6 shadow-xl transition duration-200 ease-out data-ending-style:scale-95 data-ending-style:opacity-0 data-starting-style:scale-95 data-starting-style:opacity-0 rounded-2xl">
          <div className="flex items-center gap-3 border-b border-black/5 pb-4">
            <SearchIcon className="size-5 text-black/40" />
            <input
              ref={inputRef}
              type="text"
              placeholder={t('modalPlaceholder')}
              className="flex-1 bg-transparent text-base sm:text-lg outline-none placeholder:text-black/30"
            />
            <Dialog.Close
              render={<Button variant="ghost" size="icon-sm" className="rounded-full" />}
            >
              <XIcon />
              <span className="sr-only">Close</span>
            </Dialog.Close>
          </div>
          
          <div className="pt-2">
            <h3 className="mb-3 text-sm font-medium text-muted-foreground">
              {t('quickLinksTitle')}
            </h3>
            <ul className="grid gap-2 sm:grid-cols-2">
              {quickLinks.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="flex items-center justify-between rounded-lg p-3 text-sm transition-colors hover:bg-muted"
                  >
                    {link.name}
                    <ArrowRightIcon className="size-4 text-muted-foreground opacity-50" />
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </Dialog.Popup>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
