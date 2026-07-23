import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { Menu, ChevronDown, ArrowRight } from 'lucide-react';
import { site } from '@/lib/site';
import { navItems, resolvedServiceNavGroups } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { ServiceIcon } from '@/components/service-icon';
import { LineIcon } from '@/components/brand-icons';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import { useTranslations } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HeaderActions } from '@/components/header-actions';

export default function Header({
  logoMark,
  cartCount = 0,
}: {
  logoMark: string;
  cartCount?: number;
}) {
  const t = useTranslations('Navigation');
  const serviceGroups = resolvedServiceNavGroups();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label="Kazumi Clinic หน้าหลัก"
          className="group flex items-center gap-3 text-olive-deep"
        >
          <Image
            src={logoMark}
            alt="Kazumi Clinic"
            width={36}
            height={36}
            sizes="36px"
            className="size-9 rounded-[0.35rem] object-cover ring-1 ring-olive/10 transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="flex flex-col font-serif leading-none tracking-[0.18em]">
            <span className="text-[1.08rem]">KAZUMI</span>
            <span className="mt-1 pl-0.5 text-[0.56rem] tracking-[0.34em] text-olive/75">
              CLINIC
            </span>
          </span>
        </Link>

        {/* `group` + focus-within drives the mega dropdown with no JS — this stays a Server
            Component, and the menu opens on keyboard focus as well as hover. */}
        <nav className="hidden gap-6 text-sm text-foreground/80 md:flex">
          {navItems.map((item) => {
            const translationKey = item.href === '/services' ? 'services' : 
                                  item.href === '/reviews' ? 'reviews' :
                                  item.href === '/promotions' ? 'promotions' :
                                  item.href === '/about' ? 'about' :
                                  item.href === '/blog' ? 'blog' : 'contact';
            
            return item.href === '/services' ? (
              <div key={item.href} className="group">
                <Link href={item.href} className="flex items-center gap-1 py-2 hover:text-primary">
                  {t(translationKey)}
                  <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>

                {/* Full-bleed panel: header has position:sticky, which is a positioned ancestor,
                    so this can sit `absolute inset-x-0` off the header itself rather than the
                    narrow trigger — same edge-to-edge mega-menu shape as apple.com's nav. */}
                <div className="invisible absolute inset-x-0 top-full z-50 opacity-0 transition-[opacity,visibility] group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="border-b border-olive/10 bg-[var(--store-surface)] shadow-[0_24px_48px_-32px_rgb(38_40_31/0.25)]">
                    <div className="mx-auto grid max-w-6xl grid-cols-3 gap-x-10 gap-y-9 px-6 py-10">
                      {serviceGroups.map(({ group, categories }) => (
                        <div key={group.title}>
                          <p className="text-sm font-semibold leading-snug text-[var(--store-ink)]">
                            {/* TODO: Translate group.title */}
                            {group.title}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {categories.map((c) => (
                              <li key={c.slug}>
                                <Link
                                  href={`/${c.slug}`}
                                  className="text-sm text-[var(--store-muted)] transition-colors hover:text-primary"
                                >
                                  {/* TODO: Translate c.title */}
                                  {c.title}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </div>
                      ))}
                    </div>
                    <div className="border-t border-olive/10 px-6 py-4">
                      <div className="mx-auto max-w-6xl">
                        <Link
                          href="/services"
                          className="inline-flex items-center gap-1.5 text-sm text-forest hover:text-mint"
                        >
                          {t('allServices')} <ArrowRight className="size-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="py-2 hover:text-primary">
                {t(translationKey)}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1">
          <LanguageSwitcher />
          <HeaderActions cartCount={cartCount} />

          <Sheet>
            <SheetTrigger
              render={
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="เปิดเมนู" />
              }
            >
              <Menu className="size-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle className="font-serif tracking-widest text-olive-deep">
                  KAZUMI CLINIC
                </SheetTitle>
              </SheetHeader>
              <nav className="flex flex-col gap-1 overflow-y-auto px-4 pb-4">
                {navItems.map((item) => {
                  const translationKey = item.href === '/services' ? 'services' : 
                                        item.href === '/reviews' ? 'reviews' :
                                        item.href === '/promotions' ? 'promotions' :
                                        item.href === '/about' ? 'about' :
                                        item.href === '/blog' ? 'blog' : 'contact';
                  return (
                  <div key={item.href}>
                    <SheetClose
                      render={
                        <Link
                          href={item.href}
                          className="block rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
                        />
                      }
                    >
                      {t(translationKey)}
                    </SheetClose>

                    {/* The mega dropdown has no hover on touch — the groups expand inline instead. */}
                    {item.href === '/services' && (
                      <div className="mb-2 mt-1 space-y-3 border-l border-olive/15 pl-3">
                        {serviceGroups.map(({ group, categories }) => (
                          <div key={group.title}>
                            <p className="px-3 text-[0.7rem] leading-snug text-olive-light">
                              <span aria-hidden="true">{group.glyph}</span> {group.title}
                            </p>
                            {categories.map((c) => (
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
                                {c.title}
                              </SheetClose>
                            ))}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
                <Button
                  render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
                  className="mt-4 bg-line text-white hover:bg-line/90"
                >
                  <LineIcon className="size-4" />
                  {t('bookLine')}
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
