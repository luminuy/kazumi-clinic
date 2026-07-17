import Image from 'next/image';
import Link from 'next/link';
import { AtSign, ExternalLink, MessageCircle } from 'lucide-react';
import { site } from '@/lib/site';
import { navItems } from '@/lib/nav';

const legalLabels = ['Privacy Policy', 'Terms of Service', 'Career'];

export default function Footer({ logoMark }: { logoMark: string }) {
  return (
    <footer className="border-t border-olive/10 bg-[#e4e3db] text-olive-deep">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-10 md:px-14 md:py-16 lg:px-20">
        <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr_0.8fr]">
          <div className="max-w-sm">
            <Link
              href="/"
              className="inline-flex items-center gap-3"
              aria-label="Kazumi Clinic หน้าหลัก"
            >
              <Image
                src={logoMark}
                alt="Kazumi Clinic"
                width={30}
                height={30}
                sizes="30px"
                className="size-7 object-cover"
              />
              <span className="font-serif text-lg">Kazumi Clinic</span>
            </Link>
            <p className="mt-5 text-xs leading-[1.75] text-ink/60">
              {site.tagline}. Providing natural results with medical precision.
            </p>
            <div className="mt-5 flex items-center gap-4 text-olive-deep/65">
              <a href={site.lineUrl} target="_blank" rel="noopener" aria-label="LINE">
                <MessageCircle className="size-4" />
              </a>
              <a href={site.instagram} target="_blank" rel="noopener" aria-label="Instagram">
                <AtSign className="size-4" />
              </a>
              <a href={site.facebook} target="_blank" rel="noopener" aria-label="Facebook">
                <ExternalLink className="size-4" />
              </a>
            </div>
          </div>

          <nav>
            <p className="text-xs text-olive-deep/55">Navigation</p>
            <ul className="mt-5 space-y-3 text-xs">
              {navItems.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition-colors hover:text-olive">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav>
            <p className="text-xs text-olive-deep/55">Legal</p>
            <ul className="mt-5 space-y-3 text-xs">
              {legalLabels.map((label) => (
                <li key={label} className="text-olive-deep/75">
                  {label}
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-2 border-t border-olive/10 pt-5 text-[0.62rem] text-olive-deep/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All Rights Reserved.
          </p>
          <p>ใบอนุญาตสถานพยาบาลเลขที่ {site.license}</p>
        </div>
      </div>
    </footer>
  );
}
