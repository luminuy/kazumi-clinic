import Image from 'next/image';
import { Link } from '@/i18n/routing';
import { site } from '@/lib/site';
import { navItems } from '@/lib/nav';
import { FacebookIcon, InstagramIcon, LineIcon } from '@/components/brand-icons';
import { useTranslations } from 'next-intl';

export default function Footer({ logoMark }: { logoMark: string }) {
  const tNav = useTranslations('Navigation');
  const tFooter = useTranslations('Footer');
  return (
    <footer className="border-t border-olive/10 bg-[#f5f5f7] text-olive-deep">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-10 md:px-14 md:py-20 lg:px-20">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr]">
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
            <p className="mt-5 text-xs leading-[1.75] text-ink/60">{site.description}</p>
            <div className="mt-5 flex items-center gap-4">
              <a
                href={site.lineUrl}
                target="_blank"
                rel="noopener"
                aria-label="LINE"
                className="text-line transition-opacity hover:opacity-75"
              >
                <LineIcon className="size-4" />
              </a>
              <a
                href={site.instagram}
                target="_blank"
                rel="noopener"
                aria-label="Instagram"
                className="text-instagram transition-opacity hover:opacity-75"
              >
                <InstagramIcon className="size-4" />
              </a>
              <a
                href={site.facebook}
                target="_blank"
                rel="noopener"
                aria-label="Facebook"
                className="text-facebook transition-opacity hover:opacity-75"
              >
                <FacebookIcon className="size-4" />
              </a>
            </div>
          </div>

          <nav>
            <p className="text-xs text-olive-deep/55">Navigation</p>
            <ul className="mt-5 space-y-3 text-xs">
              {navItems.map((item) => {
                const translationKey = item.href === '/services' ? 'services' : 
                                      item.href === '/reviews' ? 'reviews' :
                                      item.href === '/promotions' ? 'promotions' :
                                      item.href === '/about' ? 'about' :
                                      item.href === '/blog' ? 'blog' : 'contact';
                return (
                  <li key={item.href}>
                    <Link href={item.href} className="transition-colors hover:text-forest">
                      {tNav(translationKey)}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </div>

        <div className="mt-20 flex flex-col gap-2 border-t border-olive/10 pt-5 text-[0.62rem] text-olive-deep/55 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {site.name}. All Rights Reserved.
          </p>
          <p>{tFooter('license', { license: site.license })}</p>
        </div>
      </div>
    </footer>
  );
}
