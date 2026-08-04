import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { PasswordResetRequestForm } from '@/components/account/password-reset-form';
import { IntlBoundary } from '@/components/intl-boundary';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Account' });
  return { title: t('forgot.title'), robots: { index: false, follow: false } };
}

export default async function ForgotPasswordPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Account');

  return (
    <IntlBoundary namespaces={['Account']}>
      <section className="bg-[var(--store-surface)] py-20">
      <div className="mx-auto w-full max-w-md px-6">
        <div className="rounded-[2rem] border border-black/[0.03] bg-white p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] sm:p-10">
          <h1 className="font-serif text-3xl tracking-tight text-[var(--store-ink)]">
            {t('forgot.title')}
          </h1>
          <p className="mb-8 mt-2 text-[0.9rem] leading-[1.6] text-[var(--store-muted)]">
            {t('forgot.lead')}
          </p>
          <PasswordResetRequestForm />
        </div>
      </div>
      </section>
    </IntlBoundary>
  );
}
