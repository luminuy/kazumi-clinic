'use client';

import { Link } from '@/i18n/routing';
import { Button } from '@/components/ui/button';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetClose,
} from '@/components/ui/sheet';

export type MobileMenuItem = { href: string; label: string };

export type MobileMenuGroup = {
  glyph: string;
  label: string;
  categories: { slug: string; label: string }[];
};

export type MobileMenuContent = {
  items: MobileMenuItem[];
  /** Sub-menu expanded under {@link serviceHref}. */
  serviceGroups: MobileMenuGroup[];
  serviceHref: string;
  lineUrl: string;
  lineLabel: string;
};

/**
 * The panel itself — every byte of Base UI's Dialog lives behind this module's import, which is why
 * nothing outside `components/mobile-menu.tsx` may import it. Labels arrive pre-translated so the
 * lazy chunk doesn't drag next-intl's client runtime along with it, and the nav data arrives
 * flattened so `lib/services`' full catalogue never crosses the client boundary.
 */
export function MobileMenuSheet({
  open,
  onOpenChange,
  items,
  serviceGroups,
  serviceHref,
  lineUrl,
  lineLabel,
}: MobileMenuContent & {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right">
        <SheetHeader>
          <SheetTitle className="font-serif tracking-widest text-olive-deep">
            KAZUMI CLINIC
          </SheetTitle>
        </SheetHeader>
        <nav className="flex flex-col gap-1 overflow-y-auto px-4 pb-4">
          {items.map((item) => (
            <div key={item.href}>
              <SheetClose
                render={
                  <Link
                    href={item.href}
                    className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
                  />
                }
              >
                {item.label}
              </SheetClose>

              {/* The mega dropdown has no hover on touch — the groups expand inline instead. */}
              {item.href === serviceHref && (
                <div className="mb-2 mt-1 space-y-3 border-l border-olive/15 pl-3">
                  {serviceGroups.map((group) => (
                    <div key={group.label}>
                      <p className="px-3 text-[0.7rem] leading-snug text-olive-light">
                        <span aria-hidden="true">{group.glyph}</span> {group.label}
                      </p>
                      {group.categories.map((c) => (
                        <SheetClose
                          key={c.slug}
                          render={
                            <Link
                              href={`/${c.slug}`}
                              className="flex items-center gap-2 rounded-md px-3 py-1.5 text-sm text-ink/70 hover:bg-muted hover:text-primary"
                            />
                          }
                        >
                          <ServiceIcon slug={c.slug} className="size-3.5 text-olive-light" />
                          {c.label}
                        </SheetClose>
                      ))}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
          <Button
            render={<a href={lineUrl} target="_blank" rel="noopener" />}
            className="mt-4 bg-line text-white hover:bg-line/90"
          >
            <LineIcon className="size-4" />
            {lineLabel}
          </Button>
        </nav>
      </SheetContent>
    </Sheet>
  );
}
