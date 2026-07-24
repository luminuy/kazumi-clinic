import { cn } from '@/lib/utils';
import { site } from '@/lib/site';
import { LineIcon } from '@/components/brand-icons';
import { AddToCartButton } from '@/components/account/add-to-cart-button';
import type { ServiceItem } from '@/lib/services';

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
  return (
    <div className={cn('flex flex-col gap-2', compact ? 'items-end' : 'items-stretch', className)}>
      {canBuy && <AddToCartButton productId={item.id!} className={compact ? '' : 'w-full'} />}
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
        {canBuy ? 'จองผ่าน LINE' : 'จองคิว / สอบถามราคา ผ่าน LINE'}
      </a>
    </div>
  );
}
