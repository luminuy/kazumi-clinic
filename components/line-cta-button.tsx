import { site } from '@/lib/site';
import { LineIcon } from '@/components/brand-icons';
import { cn } from '@/lib/utils';

/**
 * The green "book via LINE" anchor at the bottom of every *-service-page.tsx (the big closing CTA
 * section, not the small per-item button in service-item-actions.tsx — those are different visual
 * contexts and stay separate). This was hand-copied into 7 files with near-identical Tailwind
 * classes; `className` here still takes the full per-page string so each page keeps its exact
 * existing spacing/width variant, only the href/target/rel/icon boilerplate is centralized.
 */
export function LineCtaButton({
  children,
  className,
}: {
  children: React.ReactNode;
  className: string;
}) {
  return (
    <a href={site.lineUrl} target="_blank" rel="noopener" className={cn(className)}>
      <LineIcon className="size-4" />
      {children}
    </a>
  );
}
