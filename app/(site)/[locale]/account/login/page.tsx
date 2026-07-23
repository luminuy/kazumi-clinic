import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getCurrentMember } from '@/lib/members/session';
import { AuthForm } from '@/components/account/auth-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return { title: t('login.title'), robots: { index: false, follow: false } };
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale } = await params;
  const { error } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  // Already signed in → straight to the dashboard.
  if (await getCurrentMember()) redirect({ href: '/account', locale });

  return (
    <section className="bg-[var(--store-surface)] py-20">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="rounded-[1.5rem] border border-black/5 bg-[var(--store-card)] p-8 shadow-2xl shadow-black/5 md:p-10">
          <h1 className="font-serif text-3xl text-[var(--store-ink)]">{t('login.title')}</h1>
          <p className="mb-8 mt-2 text-sm leading-[1.7] text-[var(--store-muted)]">
            {t('login.lead')}
          </p>
          <AuthForm mode="login" oauthError={error} />
        </div>
      </div>
    </section>
  );
}
