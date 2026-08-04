import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getCurrentMember } from '@/lib/members/session';
import { configuredProviders } from '@/lib/members/oauth';
import { isEmailConfigured } from '@/lib/members/password-reset';
import { AuthForm } from '@/components/account/auth-form';
import { IntlBoundary } from '@/components/intl-boundary';

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
  searchParams: Promise<{ error?: string; registered?: string }>;
}) {
  const { locale } = await params;
  const { error, registered } = await searchParams;
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  // Already signed in → straight to the dashboard.
  if (await getCurrentMember()) redirect({ href: '/account', locale });

  return (
    <IntlBoundary namespaces={['Account']}>
      <section className="bg-[var(--store-surface)] py-20">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="rounded-[2rem] border border-black/[0.03] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <h1 className="font-serif text-3xl tracking-tight text-[var(--store-ink)]">{t('login.title')}</h1>
          <p className="mb-8 mt-2 text-[0.9rem] leading-[1.6] text-[var(--store-muted)]">
            {t('login.lead')}
          </p>
          {/* Shown after /account/register, which never signs anyone in — the copy has to read the
              same whether the address was new or already had an account (see that route handler). */}
          {registered && (
            <p
              className="mb-6 rounded-2xl bg-mint/10 px-4 py-3 text-[0.85rem] leading-[1.6] text-forest"
              role="status"
            >
              {t('login.registered')}
            </p>
          )}
          <AuthForm
            mode="login"
            oauthError={error}
            providers={configuredProviders()}
            emailConfigured={isEmailConfigured()}
          />
        </div>
      </div>
      </section>
    </IntlBoundary>
  );
}
