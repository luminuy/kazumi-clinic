import Link from 'next/link';
import { MapPin, Phone, Clock, MessageCircle, AtSign, ExternalLink } from 'lucide-react';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';
import { navItems } from '@/lib/nav';
import { ServiceIcon } from '@/components/service-icon';

export default function Footer() {
  return (
    <footer className="border-t border-olive/10 bg-olive-deep text-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-4">
        <div>
          <Link href="/" className="inline-flex items-center gap-3" aria-label="Kazumi Clinic หน้าหลัก">
            {/* eslint-disable-next-line @next/next/no-img-element -- the local brand mark is a fixed, pre-cropped asset */}
            <img
              src={site.logoMark}
              alt="Kazumi Clinic"
              width={38}
              height={38}
              className="size-9 rounded-[0.35rem] object-cover ring-1 ring-sand/20"
            />
            <span className="flex flex-col font-serif leading-none tracking-[0.18em]">
              <span className="text-lg">KAZUMI</span>
              <span className="mt-1 pl-0.5 text-[0.52rem] tracking-[0.34em] text-sand/70">CLINIC</span>
            </span>
          </Link>
          <p className="mt-3 text-sm text-sand/70">{site.taglineTh}</p>
          <p className="mt-1 text-xs text-sand/50">ใบอนุญาตเลขที่ {site.license}</p>
          <nav className="mt-4 flex flex-col gap-2 text-sm text-sand/70">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className="hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
        <div>
          <p className="text-sm font-medium text-sand/90">
            <Link href="/services" className="hover:text-white">
              บริการ / หัตถการ
            </Link>
          </p>
          <ul className="mt-3 space-y-2 text-sm text-sand/70">
            {serviceCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="flex items-center gap-2 hover:text-white">
                  <ServiceIcon slug={c.slug} className="size-4" />
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-sand/70 md:col-span-2">
          <p className="flex items-start gap-2">
            <MapPin className="mt-0.5 size-4 shrink-0" />
            {site.addressFull}
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Phone className="size-4 shrink-0" />
            <a href={site.phoneUrl} className="hover:text-white">
              โทร {site.phone}
            </a>
          </p>
          <p className="mt-2 flex items-center gap-2">
            <Clock className="size-4 shrink-0" />
            {site.hoursDisplay.short}
          </p>
          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2">
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 hover:text-white"
            >
              <MessageCircle className="size-4" />
              LINE
            </a>
            <a
              href={site.instagram}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 hover:text-white"
            >
              <AtSign className="size-4" />
              Instagram
            </a>
            <a
              href={site.facebook}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 hover:text-white"
            >
              <ExternalLink className="size-4" />
              Facebook
            </a>
            <a
              href={site.mapsUrl}
              target="_blank"
              rel="noopener"
              className="flex items-center gap-1.5 hover:text-white"
            >
              <MapPin className="size-4" />
              แผนที่
            </a>
          </div>
        </div>
      </div>
      <div className="border-t border-sand/10 py-4 text-center text-xs text-sand/50">
        © {new Date().getFullYear()} {site.name}. All rights reserved.
      </div>
    </footer>
  );
}
