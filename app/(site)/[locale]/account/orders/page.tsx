import type { Metadata } from 'next';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { ShoppingBag, ChevronRight } from 'lucide-react';
import { redirect, Link } from '@/i18n/routing';
import { getCurrentMember } from '@/lib/members/session';
import { listMemberOrders } from '@/lib/members/orders';
import { formatSatang } from '@/lib/members/money';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'Orders' });
  return { title: t('list.title'), robots: { index: false, follow: false } };
}

export const dynamic = 'force-dynamic';

export default async function OrdersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('Orders');

  const member = await getCurrentMember();
  if (!member) redirect({ href: '/account/login', locale });
  const me = member!;

  const orders = await listMemberOrders(me.id);

  return (
    <section className="bg-[var(--store-surface)] py-16">
      <div className="mx-auto w-full max-w-2xl px-6">
        <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
          {t('list.eyebrow')}
        </p>
        <h1 className="mb-8 mt-1 font-serif text-3xl text-[var(--store-ink)]">{t('list.title')}</h1>

        {orders.length === 0 ? (
          <div className="rounded-[1.5rem] border border-black/5 bg-[var(--store-card)] p-12 text-center shadow-lg shadow-black/5">
            <span className="mx-auto grid size-14 place-items-center rounded-full bg-[var(--store-control)] text-[var(--store-ink)]">
              <ShoppingBag strokeWidth={1.5} className="size-7" />
            </span>
            <p className="mt-5 font-serif text-xl text-[var(--store-ink)]">{t('list.emptyTitle')}</p>
            <Link
              href="/services"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-forest px-6 py-3 text-xs font-medium text-white transition-colors hover:bg-mint"
            >
              {t('list.emptyCta')}
            </Link>
          </div>
        ) : (
          <ul className="space-y-3">
            {orders.map((order) => (
              <li key={order.id}>
                <Link
                  href={`/account/orders/${order.id}`}
                  className="group flex items-center gap-4 rounded-[1.25rem] border border-black/5 bg-[var(--store-card)] p-5 shadow-sm transition-transform hover:-translate-y-0.5"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-serif text-lg text-[var(--store-ink)]">{order.summary}</p>
                    <p className="mt-0.5 text-xs text-[var(--store-muted)]">
                      {t(`status.${order.status}`)} · {t('list.items', { count: order.itemCount })}
                    </p>
                  </div>
                  <span className="shrink-0 font-serif text-[var(--store-ink)]">
                    {formatSatang(order.subtotalSatang)}
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-[var(--store-muted)] transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
