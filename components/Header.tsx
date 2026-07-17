import Link from 'next/link';
import Image from 'next/image';
import { Menu, MessageCircle, ChevronDown, ArrowRight } from 'lucide-react';
import { site } from '@/lib/site';
import { navItems, resolvedServiceNavGroups } from '@/lib/nav';
import { Button } from '@/components/ui/button';
import { ServiceIcon } from '@/components/service-icon';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';

export default function Header({ logoMark }: { logoMark: string }) {
  const serviceGroups = resolvedServiceNavGroups();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
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
          {navItems.map((item) =>
            item.href === '/services' ? (
              <div key={item.href} className="group relative">
                <Link href={item.href} className="flex items-center gap-1 py-2 hover:text-primary">
                  {item.label}
                  <ChevronDown className="size-3.5 transition-transform group-hover:rotate-180 group-focus-within:rotate-180" />
                </Link>

                <div className="invisible absolute left-1/2 top-full z-50 w-[44rem] -translate-x-1/2 pt-3 opacity-0 transition-[opacity,visibility] group-hover:visible group-hover:opacity-100 group-focus-within:visible group-focus-within:opacity-100">
                  <div className="grid grid-cols-2 gap-x-8 gap-y-6 rounded-2xl border border-olive/15 bg-cream p-7 shadow-xl shadow-olive-deep/5">
                    {serviceGroups.map(({ group, categories }) => (
                      <div key={group.title}>
                        <p className="flex items-start gap-2 text-xs font-medium leading-snug text-olive-deep">
                          <span aria-hidden="true">{group.glyph}</span>
                          {group.title}
                        </p>
                        <ul className="mt-2.5 space-y-1.5 border-l border-olive/15 pl-3">
                          {categories.map((c) => (
                            <li key={c.slug}>
                              <Link
                                href={`/${c.slug}`}
                                className="flex items-center gap-2 text-sm text-ink/70 hover:text-primary"
                              >
                                <ServiceIcon slug={c.slug} className="size-3.5 text-olive-light" />
                                {c.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}

                    <Link
                      href="/services"
                      className="col-span-2 flex items-center gap-1.5 border-t border-olive/15 pt-4 text-sm text-olive hover:text-olive-deep"
                    >
                      ดูบริการทั้งหมด <ArrowRight className="size-4" />
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <Link key={item.href} href={item.href} className="py-2 hover:text-primary">
                {item.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button
            render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
            className="hidden bg-line text-white hover:bg-line/90 sm:inline-flex"
          >
            <MessageCircle className="size-4" />
            จองคิว LINE
          </Button>

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
                {navItems.map((item) => (
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
                ))}
                <Button
                  render={<a href={site.lineUrl} target="_blank" rel="noopener" />}
                  className="mt-4 bg-line text-white hover:bg-line/90"
                >
                  <MessageCircle className="size-4" />
                  จองคิว LINE
                </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
