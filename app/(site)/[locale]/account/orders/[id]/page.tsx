import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { Check, Clock, CreditCard } from 'lucide-react';
import { site } from '@/lib/site';
import { Link } from '@/i18n/routing';
import { getOrderById } from '@/lib/members/orders';
import { getCurrentMember } from '@/lib/members/session';
import { formatSatang } from '@/lib/members/money';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Orders' });
  return { title: t('detail.title'), robots: { index: false, follow: false } };
}

export const dynamic = 'force-dynamic';

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Orders');

  const order = await getOrderById(id);
  if (!order) notFound();

  // A member's order is private to them; a guest order (no member_id) is viewable by anyone holding
  // the freshly issued id — the post-checkout confirmation link.
  const member = await getCurrentMember();
  if (order.memberId && order.memberId !== member?.id) notFound();

  // Next-step guidance depends on how they chose to settle.
  const awaitingGateway = order.status === 'awaiting_payment' && order.paymentMethod === 'gateway';
  const nextStepKey = awaitingGateway
    ? 'next.gateway'
    : order.amountDueSatang > 0
      ? 'next.payAtClinic'
      : 'next.booking';

  return (
    <section className="bg-[var(--store-surface)] py-16">
      <div className="mx-auto w-full max-w-2xl px-6">
        <div className="rounded-[1.5rem] border border-black/5 bg-[var(--store-card)] p-8 shadow-xl shadow-black/5 md:p-10">
          <span className="grid size-12 place-items-center rounded-full bg-forest/10 text-forest">
            {awaitingGateway ? <CreditCard className="size-6" /> : <Check className="size-6" />}
          </span>
          <h1 className="mt-5 font-serif text-2xl text-[var(--store-ink)]">
            {awaitingGateway ? t('detail.awaitingTitle') : t('detail.thanksTitle')}
          </h1>
          <p className="mt-2 text-sm leading-[1.7] text-[var(--store-muted)]">{t(nextStepKey)}</p>

          <dl className="mt-6 space-y-1 border-y border-black/[0.08] py-4 text-sm">
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--store-muted)]">{t('detail.orderId')}</dt>
              <dd className="font-mono text-[var(--store-ink)]">{order.id}</dd>
            </div>
            <div className="flex justify-between gap-4">
              <dt className="text-[var(--store-muted)]">{t('detail.status')}</dt>
              <dd className="flex items-center gap-1.5 text-[var(--store-ink)]">
                <Clock className="size-3.5" />
                {t(`status.${order.status}`)}
              </dd>
            </div>
          </dl>

          <ul className="mt-4 space-y-2">
            {order.items.map((item) => (
              <li key={item.productId} className="flex items-baseline justify-between gap-4 text-sm">
                <span className="text-[var(--store-ink)]">
                  {item.title}
                  {item.quantity > 1 && <span className="text-[var(--store-muted)]"> × {item.quantity}</span>}
                </span>
                <span className="shrink-0 text-[var(--store-muted)]">{formatSatang(item.lineTotalSatang)}</span>
              </li>
            ))}
          </ul>

          <div className="mt-4 space-y-1 border-t border-black/[0.08] pt-4 text-sm">
            <div className="flex justify-between">
              <span className="text-[var(--store-muted)]">{t('detail.subtotal')}</span>
              <span className="text-[var(--store-ink)]">{formatSatang(order.subtotalSatang)}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium text-[var(--store-ink)]">{t('detail.dueNow')}</span>
              <span className="font-serif text-lg text-[var(--store-ink)]">{formatSatang(order.amountDueSatang)}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <a
              href={site.lineUrl}
              target="_blank"
              rel="noopener"
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#06C755] px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-[#05b34c]"
            >
              {t('detail.contactLine')}
            </a>
            <Link
              href={member ? '/account/orders' : '/services'}
              className="flex flex-1 items-center justify-center rounded-full border border-black/15 px-6 py-3 text-xs font-medium text-[var(--store-ink)] transition-colors hover:bg-black/5"
            >
              {member ? t('detail.myOrders') : t('detail.moreServices')}
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
