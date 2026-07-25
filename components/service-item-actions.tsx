'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { cn } from '@/lib/utils';
import { site } from '@/lib/site';
import { LineIcon } from '@/components/brand-icons';
import { AddToCartButton } from '@/components/account/add-to-cart-button';
import type { ServiceItem } from '@/lib/services';

type BuyNowState = 'idle' | 'busy' | 'error';

/**
 * The purchase actions for one service item: an add-to-cart button when the clinic has
 * published a price for it, always paired with a LINE booking/enquiry button. One shared
 * component so every category page's item cards read as the same design instead of nine
 * separately hand-tuned button variants.
 */
export function ServiceItemActions({
  item,
  className,
  compact = false,
}: {
  item: ServiceItem;
  className?: string;
  /** Use inside a narrow inline row (a compact menu row) instead of a wide card/column. */
  compact?: boolean;
}) {
  const t = useTranslations('A11y');
  const tCart = useTranslations('Cart');
  // The catalogue only carries Thai item names (lib/services.ts), so an English visitor still sees
  // the Thai product name inside an otherwise English label — that is the product name itself.
  const label = `${item.name}${item.detail ? ` ${item.detail}` : ''}`;
  const canBuy = Boolean(item.id) && item.priceFrom !== undefined;

  if (!canBuy) {
    return (
      <div className={cn('flex flex-col gap-2', compact ? 'items-end' : 'items-stretch', className)}>
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          aria-label={t('bookViaLine', { name: label })}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] font-medium text-white transition-all duration-200 hover:bg-[#05b34c] active:scale-[0.98]',
            compact ? 'px-4 py-2 text-[0.66rem]' : 'w-full px-5 py-3 text-xs',
          )}
        >
          <LineIcon className={compact ? 'size-3' : 'size-4'} />
          {tCart('bookOrAskLine')}
        </a>
      </div>
    );
  }

  return <PurchasableActions item={item} className={className} compact={compact} />;
}

function PurchasableActions({
  item,
  className,
  compact,
}: {
  item: ServiceItem;
  className?: string;
  compact: boolean;
}) {
  const t = useTranslations('A11y');
  const tCart = useTranslations('Cart');
  const label = `${item.name}${item.detail ? ` ${item.detail}` : ''}`;
  const router = useRouter();
  const [buyNowState, setBuyNowState] = useState<BuyNowState>('idle');

  async function buyNow() {
    if (buyNowState === 'busy') return;

    setBuyNowState('busy');
    try {
      const res = await fetch('/api/cart/items', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ productId: item.id! }),
      });
      if (!res.ok) throw new Error(String(res.status));
      router.push('/cart/checkout');
    } catch {
      setBuyNowState('error');
      setTimeout(() => setBuyNowState('idle'), 2500);
    }
  }

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div
        className={cn(
          'flex items-center gap-1 rounded-full border border-black/5 bg-black/[0.02]',
          compact ? 'p-0.5' : 'p-1',
        )}
      >
        <AddToCartButton
          productId={item.id!}
          iconOnly
          aria-label={t('addItemToCart', { name: label })}
          className={compact ? 'size-7' : undefined}
        />
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          aria-label={t('askViaLine', { name: label })}
          className={cn(
            'grid size-9 shrink-0 place-items-center rounded-full text-[#06C755] transition-all duration-200 hover:bg-white hover:shadow-sm active:scale-[0.94]',
            compact && 'size-7',
          )}
        >
          <LineIcon className={compact ? 'size-3' : 'size-4'} />
        </a>
      </div>
      <button
        type="button"
        onClick={buyNow}
        disabled={buyNowState === 'busy'}
        className={cn(
          'inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-5 py-3 text-xs font-medium text-white shadow-[0_2px_8px_rgba(0,110,43,0.25)] transition-all duration-200 hover:bg-mint hover:shadow-[0_4px_14px_rgba(6,199,85,0.3)] active:scale-[0.98] disabled:opacity-70',
          compact && 'px-4 py-2 text-[0.7rem]',
        )}
      >
        {buyNowState === 'error' ? tCart('buyNowError') : tCart('buyNow')}
        {buyNowState === 'busy' ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
      </button>
    </div>
  );
}
