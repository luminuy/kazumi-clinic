'use client';

import { useState } from 'react';
import { ArrowRight, Loader2 } from 'lucide-react';
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
  const canBuy = Boolean(item.id) && item.priceFrom !== undefined;

  if (!canBuy) {
    return (
      <div className={cn('flex flex-col gap-2', compact ? 'items-end' : 'items-stretch', className)}>
        <a
          href={site.lineUrl}
          target="_blank"
          rel="noopener"
          aria-label={`จองคิว ${item.name}${item.detail ? ` ${item.detail}` : ''} ผ่าน LINE`}
          className={cn(
            'inline-flex items-center justify-center gap-2 rounded-full bg-[#06C755] font-medium text-white transition-all duration-200 hover:bg-[#05b34c] active:scale-[0.98]',
            compact ? 'px-4 py-2 text-[0.66rem]' : 'w-full px-5 py-3 text-xs',
          )}
        >
          <LineIcon className={compact ? 'size-3' : 'size-4'} />
          จองคิว / สอบถามราคา ผ่าน LINE
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
    <div className={cn('flex items-center gap-2', className)}>
      <AddToCartButton
        productId={item.id!}
        iconOnly
        aria-label={`เพิ่ม ${item.name}${item.detail ? ` ${item.detail}` : ''} ลงตะกร้า`}
        className={compact ? 'size-8' : undefined}
      />
      <a
        href={site.lineUrl}
        target="_blank"
        rel="noopener"
        aria-label={`สอบถาม ${item.name}${item.detail ? ` ${item.detail}` : ''} ผ่าน LINE`}
        className={cn(
          'grid size-10 shrink-0 place-items-center rounded-full bg-[#06C755] text-white transition-all duration-200 hover:bg-[#05b34c] active:scale-[0.96]',
          compact && 'size-8',
        )}
      >
        <LineIcon className={compact ? 'size-3' : 'size-4'} />
      </a>
      <button
        type="button"
        onClick={buyNow}
        disabled={buyNowState === 'busy'}
        className={cn(
          'inline-flex min-w-0 flex-1 items-center justify-center gap-2 rounded-full bg-forest px-5 py-2.5 text-xs font-medium text-white transition-all duration-200 hover:bg-mint active:scale-[0.98] disabled:opacity-70',
          compact && 'px-4 py-2 text-[0.7rem]',
        )}
      >
        {buyNowState === 'error' ? 'เพิ่มลงตะกร้าไม่สำเร็จ' : 'ซื้อเลย'}
        {buyNowState === 'busy' ? <Loader2 className="size-4 animate-spin" /> : <ArrowRight className="size-4" />}
      </button>
    </div>
  );
}
