'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Minus, Plus, Trash2, ShoppingBag, Loader2 } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { useTranslations } from 'next-intl';
import { formatSatang } from '@/lib/members/money';

type CartLine = {
  productId: string;
  title: string;
  unitPriceSatang: number;
  quantity: number;
  lineTotalSatang: number;
};
type CartSummary = { items: CartLine[]; count: number; subtotalSatang: number };

/**
 * Interactive cart. Quantity/remove actions PATCH or DELETE /api/cart/items, which returns the
 * updated cart — we render straight from that response, then router.refresh() so the header badge
 * (a Server Component) stays in sync. The checkout CTA is disabled until Phase 3 wires the order
 * flow; the interim guidance points at LINE so a customer is never stuck.
 */
export function CartView({ initialCart, lineUrl }: { initialCart: CartSummary; lineUrl: string }) {
  const t = useTranslations('Cart');
  const router = useRouter();
  const [cart, setCart] = useState<CartSummary>(initialCart);
  const [busy, setBusy] = useState<string | null>(null);

  async function mutate(method: 'PATCH' | 'DELETE', productId: string, quantity?: number) {
    setBusy(productId);
    try {
      const res = await fetch('/api/cart/items', {
        method,
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(quantity === undefined ? { productId } : { productId, quantity }),
      });
      if (res.ok) {
        const data = (await res.json()) as { cart: CartSummary };
        setCart(data.cart);
        router.refresh();
      }
    } finally {
      setBusy(null);
    }
  }

  if (cart.items.length === 0) {
    return (
      <div className="rounded-[2rem] bg-[var(--store-card)] p-16 text-center shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <span className="mx-auto grid size-20 place-items-center rounded-full bg-black/[0.03] text-[var(--store-ink)]">
          <ShoppingBag strokeWidth={1.25} className="size-8" />
        </span>
        <p className="mt-8 font-serif text-2xl text-[var(--store-ink)]">{t('empty.title')}</p>
        <p className="mx-auto mt-3 max-w-sm text-sm leading-[1.7] text-[var(--store-muted)]">
          {t('empty.desc')}
        </p>
        <Link
          href="/services"
          className="mt-8 inline-flex items-center gap-2 rounded-full bg-forest px-8 py-4 text-[0.8rem] font-medium text-white transition-all hover:scale-[1.02] hover:bg-mint"
        >
          {t('empty.cta')}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:items-start">
      <ul className="divide-y divide-black/[0.04] rounded-[2rem] bg-[var(--store-card)] px-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        {cart.items.map((item) => {
          const isBusy = busy === item.productId;
          return (
            <li key={item.productId} className="flex items-center gap-4 py-6">
              <div className="min-w-0 flex-1">
                <p className="truncate font-serif text-lg text-[var(--store-ink)]">{item.title}</p>
                <p className="mt-0.5 text-xs text-[var(--store-muted)]">
                  {formatSatang(item.unitPriceSatang)}
                </p>
              </div>

              <div className="flex items-center gap-1 rounded-full border border-black/10 p-1">
                <button
                  type="button"
                  aria-label={t('decrease')}
                  disabled={isBusy}
                  onClick={() => mutate('PATCH', item.productId, item.quantity - 1)}
                  className="grid size-7 place-items-center rounded-full text-[var(--store-ink)] transition-colors hover:bg-[var(--store-control)] disabled:opacity-50"
                >
                  <Minus className="size-3.5" />
                </button>
                <span className="w-7 text-center text-sm tabular-nums text-[var(--store-ink)]">
                  {isBusy ? <Loader2 className="mx-auto size-3.5 animate-spin" /> : item.quantity}
                </span>
                <button
                  type="button"
                  aria-label={t('increase')}
                  disabled={isBusy}
                  onClick={() => mutate('PATCH', item.productId, item.quantity + 1)}
                  className="grid size-7 place-items-center rounded-full text-[var(--store-ink)] transition-colors hover:bg-[var(--store-control)] disabled:opacity-50"
                >
                  <Plus className="size-3.5" />
                </button>
              </div>

              <div className="w-24 shrink-0 text-right font-serif text-lg text-[var(--store-ink)]">
                {formatSatang(item.lineTotalSatang)}
              </div>

              <button
                type="button"
                aria-label={t('remove')}
                disabled={isBusy}
                onClick={() => mutate('DELETE', item.productId)}
                className="grid size-8 shrink-0 place-items-center rounded-full text-[var(--store-muted)] transition-colors hover:bg-red-50 hover:text-red-600 disabled:opacity-50"
              >
                <Trash2 className="size-4" />
              </button>
            </li>
          );
        })}
      </ul>

      <aside className="rounded-[2rem] bg-[var(--store-card)] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] lg:sticky lg:top-24">
        <h2 className="font-serif text-xl text-[var(--store-ink)]">{t('summary.title')}</h2>
        <div className="mt-5 flex items-center justify-between text-sm">
          <span className="text-[var(--store-muted)]">
            {t('summary.subtotal', { count: cart.count })}
          </span>
          <span className="font-serif text-lg text-[var(--store-ink)]">
            {formatSatang(cart.subtotalSatang)}
          </span>
        </div>

        <Link
          href="/cart/checkout"
          className="mt-8 flex w-full items-center justify-center rounded-full bg-forest py-4 text-[0.8rem] font-medium text-white transition-all hover:scale-[1.02] hover:bg-mint"
        >
          {t('summary.checkout')}
        </Link>
        <a
          href={lineUrl}
          target="_blank"
          rel="noopener"
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-black/10 py-4 text-[0.8rem] font-medium text-[var(--store-ink)] transition-colors hover:bg-black/[0.03]"
        >
          {t('summary.bookLine')}
        </a>
        <p className="mt-4 text-center text-[0.62rem] leading-[1.7] text-[var(--store-muted)]">
          {t('summary.priceNote')}
        </p>
      </aside>
    </div>
  );
}
