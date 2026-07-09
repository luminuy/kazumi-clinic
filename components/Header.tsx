import Link from 'next/link';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-olive/10 bg-sand/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-serif text-xl tracking-widest text-olive-deep">
          KAZUMI <span className="text-sm align-top">CLINIC</span>
        </Link>
        <nav className="hidden gap-6 text-sm text-ink/80 md:flex">
          {serviceCategories.map((c) => (
            <Link key={c.slug} href={`/${c.slug}`} className="hover:text-olive">
              {c.title}
            </Link>
          ))}
          <Link href="/about" className="hover:text-olive">
            เกี่ยวกับเรา
          </Link>
          <Link href="/contact" className="hover:text-olive">
            ติดต่อ
          </Link>
        </nav>
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          className="rounded-full bg-line px-4 py-2 text-sm font-medium text-white"
        >
          จองคิว LINE
        </a>
      </div>
    </header>
  );
}
