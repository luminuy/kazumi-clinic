import { Link } from '@/i18n/routing';
import Image from 'next/image';
import { ChevronDown, ArrowRight } from 'lucide-react';
import { site } from '@/lib/site';
import { navItems, resolvedServiceNavGroups } from '@/lib/nav';
import { useTranslations, useLocale } from 'next-intl';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { HeaderActions } from '@/components/header-actions';
import { MobileMenu } from '@/components/mobile-menu';
import { isEmailConfigured } from '@/lib/members/password-reset';
import type { OAuthProvider } from '@/lib/members/oauth';

/** The href whose entry carries the service mega-menu, in both the desktop nav and the mobile one. */
const SERVICE_HREF = '/services';

/**
 * `Navigation` message keys don't match the hrefs they label, so the mapping is spelled out once
 * here — it used to be an inline ternary chain duplicated between the desktop nav and the mobile
 * sheet, which meant a new nav item had to be taught to two places or it silently rendered the
 * "contact" label.
 */
const navTranslationKeys: Record<string, string> = {
  '/services': 'services',
  '/reviews': 'reviews',
  '/promotions': 'promotions',
  '/about': 'about',
  '/blog': 'blog',
  '/contact': 'contact',
};

export default function Header({
  logoMark,
  oauthProviders = [],
}: {
  logoMark: string;
  oauthProviders?: OAuthProvider[];
}) {
  const t = useTranslations('Navigation');
  const isEn = useLocale() === 'en';
  const serviceGroups = resolvedServiceNavGroups();
  const emailConfigured = isEmailConfigured();

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/40 bg-background/70 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link
          href="/"
          aria-label={t('homeLink')}
          className="group flex items-center gap-3 text-olive-deep"
        >
          {/* Empty until the clinic uploads a mark (lib/site-images.ts ships no dead default any
              more) — the wordmark beside it already names the clinic, so nothing is lost. */}
          {logoMark && (
            <Image
              src={logoMark}
              alt="Kazumi Clinic"
              width={36}
              height={36}
              sizes="36px"
              className="size-9 rounded-[0.35rem] object-cover ring-1 ring-olive/10 transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )}
          <span className="flex flex-col font-serif leading-none tracking-[0.18em]">
            <span className="text-[1.08rem]">KAZUMI</span>
            <span className="mt-1 pl-0.5 text-[0.56rem] tracking-[0.34em] text-olive">
              CLINIC
            </span>
          </span>
        </Link>

        {/* `group` + focus-within drives the mega dropdown with no JS — this stays a Server
            Component, and the menu opens on keyboard focus as well as hover. */}
        <nav className="hidden gap-6 text-sm text-foreground/80 md:flex">
          {navItems.map((item) => {
            const translationKey = navTranslationKeys[item.href] ?? 'contact';

            return item.href === SERVICE_HREF ? (
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
                            {isEn ? group.titleEn : group.title}
                          </p>
                          <ul className="mt-3 space-y-2">
                            {categories.map((c) => (
                              <li key={c.slug}>
                                <Link
                                  href={`/${c.slug}`}
                                  prefetch={false}
                                  className="text-sm text-[var(--store-muted)] transition-colors hover:text-primary"
                                >
                                  {isEn ? c.titleEn : c.title}
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
          <HeaderActions oauthProviders={oauthProviders} emailConfigured={emailConfigured} />

          <MobileMenu
            openLabel={t('openMenu')}
            items={navItems.map((item) => ({
              href: item.href,
              label: t(navTranslationKeys[item.href] ?? 'contact'),
            }))}
            serviceGroups={serviceGroups.map(({ group, categories }) => ({
              glyph: group.glyph,
              label: isEn ? group.titleEn : group.title,
              categories: categories.map((c) => ({
                slug: c.slug,
                label: isEn ? c.titleEn : c.title,
              })),
            }))}
            serviceHref={SERVICE_HREF}
            lineUrl={site.lineUrl}
            lineLabel={t('bookLine')}
          />
        </div>
      </div>
    </header>
  );
}
