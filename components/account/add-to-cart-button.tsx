'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Check, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';

type State = 'idle' | 'busy' | 'done' | 'error';

/**
 * Adds one purchasable product to the cart. On success it calls router.refresh() so the header cart
 * badge (a Server Component) re-renders, then flashes a "เพิ่มแล้ว" confirmation for a moment.
 *
 * Rendered only for products with a fixed published price (see lib/members/catalog.ts) — a
 * price-less medical program stays a LINE booking, never a cart line.
 */
export function AddToCartButton({
  productId,
  className = '',
}: {
  productId: string;
  className?: string;
}) {
  const t = useTranslations('Cart');
  const router = useRouter();
  const [state, setState] = useState<State>('idle');

  async function add() {
    if (state === 'busy') return;
    setState('busy');
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.refresh();
      setState('done');
      setTimeout(() => setState('idle'), 2000);
    } catch {
      setState('error');
      setTimeout(() => setState('idle'), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={add}
      disabled={state === 'busy'}
      aria-label={t('add')}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:bg-mint active:scale-[0.98] disabled:opacity-70 ${className}`}
    >
      {state === 'busy' && <Loader2 className="size-4 animate-spin" />}
      {state === 'done' && <Check className="size-4" />}
      {(state === 'idle' || state === 'error') && <ShoppingBag className="size-4" />}
      {state === 'done' ? t('added') : state === 'error' ? t('addError') : t('add')}
    </button>
  );
}
