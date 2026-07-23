import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { site } from '@/lib/site';
import { getCart } from '@/lib/members/cart';
import { CartView } from '@/components/account/cart-view';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Cart' });
  return { title: t('title'), robots: { index: false, follow: false } };
}

// A cart is per-visitor and reads a cookie → always dynamic, never prerendered.
export const dynamic = 'force-dynamic';

export default async function CartPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Cart');
  const cart = await getCart();

  return (
    <section className="bg-[var(--store-surface)] py-20">
      <div className="mx-auto w-full max-w-5xl px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
          {t('eyebrow')}
        </p>
        <h1 className="mb-12 mt-2 font-serif text-4xl tracking-tight text-[var(--store-ink)]">{t('title')}</h1>
        <CartView initialCart={cart} lineUrl={site.lineUrl} />
      </div>
    </section>
  );
}
