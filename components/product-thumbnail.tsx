import Image from 'next/image';
import type { ServiceItem } from '@/lib/services';
import { ServiceIcon } from '@/components/service-icon';
import { cn } from '@/lib/utils';

/** Product photos belong to their D1 product rows, never to a site-image slot. */
export function ProductThumbnail({
  item,
  category,
  className,
}: {
  item: ServiceItem;
  category: string;
  className?: string;
}) {
  return (
    <div className={cn('relative shrink-0 overflow-hidden bg-[var(--store-surface)]', className)}>
      {item.imagePublicId ? (
        <Image
          src={item.imagePublicId}
          alt=""
          aria-hidden="true"
          fill
          sizes="(min-width: 768px) 8rem, 5rem"
          className="object-cover"
        />
      ) : (
        <ServiceIcon
          aria-hidden="true"
          slug={category}
          className="absolute inset-0 m-auto size-5 text-[var(--store-muted)]/60"
          strokeWidth={0.8}
        />
      )}
    </div>
  );
}
