import Link from 'next/link';
import { site } from '@/lib/site';
import { serviceCategories } from '@/lib/services';

export default function Footer() {
  return (
    <footer className="border-t border-olive/10 bg-olive-deep text-sand">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-14 md:grid-cols-3">
        <div>
          <p className="font-serif text-lg tracking-widest">KAZUMI CLINIC</p>
          <p className="mt-3 text-sm text-sand/70">{site.taglineTh}</p>
          <p className="mt-1 text-xs text-sand/50">ใบอนุญาตเลขที่ {site.license}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-sand/90">บริการ</p>
          <ul className="mt-3 space-y-2 text-sm text-sand/70">
            {serviceCategories.map((c) => (
              <li key={c.slug}>
                <Link href={`/${c.slug}`} className="hover:text-white">
                  {c.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div className="text-sm text-sand/70">
          <p>{site.addressFull}</p>
          <p className="mt-2">โทร {site.phone}</p>
          <p className="mt-2">ทุกวัน 9:00–22:00 (อาทิตย์ 9:00–17:00)</p>
          <div className="mt-4 flex gap-4">
            <a href={site.lineUrl} target="_blank" rel="noopener" className="hover:text-white">
              LINE
            </a>
            <a href={site.instagram} target="_blank" rel="noopener" className="hover:text-white">
              Instagram
            </a>
            <a href={site.facebook} target="_blank" rel="noopener" className="hover:text-white">
              Facebook
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
