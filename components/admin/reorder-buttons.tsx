import { ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn } from './ui';

/**
 * Up/down move controls, shared by every reorderable list (products, promotions, reviews, and
 * blog once it gets sort_order). Sized to the 36px `icon-lg` floor rather than the 28px the
 * editors used individually — the tap targets were the most-cited "hard to hit on mobile" spot.
 */
export function ReorderButtons({
  disabled,
  first,
  last,
  onMoveUp,
  onMoveDown,
}: {
  disabled: boolean;
  first: boolean;
  last: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  return (
    <span className="flex items-center gap-1.5">
      <button
        type="button"
        disabled={disabled || first}
        onClick={onMoveUp}
        aria-label="เลื่อนขึ้น"
        className={cn(btn.icon, 'size-9')}
      >
        <ChevronUp className="size-4" />
      </button>
      <button
        type="button"
        disabled={disabled || last}
        onClick={onMoveDown}
        aria-label="เลื่อนลง"
        className={cn(btn.icon, 'size-9')}
      >
        <ChevronDown className="size-4" />
      </button>
    </span>
  );
}
