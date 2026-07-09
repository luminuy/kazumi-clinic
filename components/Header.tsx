import Link from 'next/link';
import { Menu, MessageCircle } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
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

const navItems = [
  ...serviceCategories.map((c) => ({ href: `/${c.slug}`, label: c.title, slug: c.slug })),
  { href: '/about', label: 'เกี่ยวกับเรา', slug: null },
  { href: '/contact', label: 'ติดต่อ', slug: null },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl tracking-widest text-olive-deep">
          KAZUMI <span className="align-top text-sm">CLINIC</span>
        </Link>

        <nav className="hidden gap-6 text-sm text-foreground/80 md:flex">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} className="hover:text-primary">
              {item.label}
            </Link>
          ))}
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
              <nav className="flex flex-col gap-1 px-4">
                {navItems.map((item) => (
                  <SheetClose
                    key={item.href}
                    render={
                      <Link
                        href={item.href}
                        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-foreground/80 hover:bg-muted hover:text-primary"
                      />
                    }
                  >
                    {item.slug && <ServiceIcon slug={item.slug} className="size-4" />}
                    {item.label}
                  </SheetClose>
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
