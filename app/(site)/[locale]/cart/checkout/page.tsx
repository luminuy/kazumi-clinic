import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { redirect } from '@/i18n/routing';
import { getActiveCartForOrder } from '@/lib/members/cart';
import { getCurrentMemberRow } from '@/lib/members/session';
import { DEPOSIT_PERCENT, depositSatang } from '@/lib/members/config';
import { CheckoutForm } from '@/components/account/checkout-form';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Checkout' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Checkout');

  // No cart, nothing to check out — back to the (empty) cart page.
  const cart = await getActiveCartForOrder();
  if (!cart) redirect({ href: '/cart', locale });
  const activeCart = cart!;

  const member = await getCurrentMemberRow();

  return (
    <section className="bg-[var(--store-surface)] py-16">
      <div className="mx-auto w-full max-w-5xl px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
          {t('eyebrow')}
        </p>
        <h1 className="mb-8 mt-1 font-serif text-3xl text-[var(--store-ink)]">{t('title')}</h1>
        <CheckoutForm
          subtotalSatang={activeCart.subtotalSatang}
          depositSatang={depositSatang(activeCart.subtotalSatang)}
          depositPercent={DEPOSIT_PERCENT}
          prefill={{
            name: member?.name ?? '',
            phone: member?.phone ?? '',
            email: member?.email ?? '',
          }}
        />
      </div>
    </section>
  );
}
