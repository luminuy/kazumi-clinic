import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ShoppingBag, User as UserIcon } from 'lucide-react';
import { redirect, Link } from '@/i18n/routing';
import { getCurrentMember } from '@/lib/members/session';
import { LogoutButton } from '@/components/account/logout-button';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return { title: t('dashboard.title'), robots: { index: false, follow: false } };
}

export default async function AccountPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  const member = await getCurrentMember();
  if (!member) redirect({ href: '/account/login', locale });
  // After the redirect above, `member` is defined; the assertion keeps TypeScript happy.
  const me = member!;

  return (
    <section className="bg-[var(--store-surface)] py-20">
      <div className="mx-auto w-full max-w-3xl px-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
              {t('dashboard.eyebrow')}
            </p>
            <h1 className="mt-2 font-serif text-4xl tracking-tight text-[var(--store-ink)]">
              {t('dashboard.greeting', { name: me.name || me.email || t('dashboard.member') })}
            </h1>
          </div>
          <LogoutButton />
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
          <div className="rounded-[2rem] bg-[var(--store-card)] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
            <div className="flex size-12 items-center justify-center rounded-full bg-black/[0.03] text-[var(--store-ink)]">
              <UserIcon strokeWidth={1.25} className="size-5" />
            </div>
            <h2 className="mt-5 font-serif text-xl text-[var(--store-ink)]">
              {t('dashboard.profile')}
            </h2>
            <dl className="mt-4 space-y-2 text-sm text-[var(--store-muted)]">
              <div className="flex justify-between gap-4">
                <dt>{t('field.email')}</dt>
                <dd className="text-[var(--store-ink)]">{me.email ?? '—'}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>{t('field.name')}</dt>
                <dd className="text-[var(--store-ink)]">{me.name ?? '—'}</dd>
              </div>
            </dl>
          </div>

          <Link
            href="/account/orders"
            className="group rounded-[2rem] bg-[var(--store-card)] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] transition-all hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.06)]"
          >
            <div className="flex size-12 items-center justify-center rounded-full bg-black/[0.03] text-[var(--store-ink)]">
              <ShoppingBag strokeWidth={1.25} className="size-5" />
            </div>
            <h2 className="mt-5 font-serif text-xl text-[var(--store-ink)]">
              {t('dashboard.orders')}
            </h2>
            <p className="mt-3 text-sm leading-[1.7] text-[var(--store-muted)]">
              {t('dashboard.ordersDesc')}
            </p>
          </Link>
        </div>
      </div>
    </section>
  );
}
