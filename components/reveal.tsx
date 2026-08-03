import { cn } from '@/lib/utils';

/**
 * Fade-and-rise as the element scrolls into view.
 *
 * Deliberately NOT a client component. This used to be `'use client'` with `useState` +
 * `IntersectionObserver`, which meant 97 hydration roots across the site (8 on the home page alone)
 * whose only job was toggling one class. The same effect is a CSS scroll-driven animation, so the
 * work moves off the main thread entirely — see `.reveal` in app/globals.css.
 *
 * The settled state is also the *default* state there, so content stays visible in browsers without
 * `animation-timeline` support and in any request rendered without JS. The old version had the
 * opposite failure mode: `opacity: 0` until JS ran, which left the whole page blank to anything that
 * didn't execute scripts.
 */
export function Reveal({
  children,
  className,
  delay = 0,
  as: Tag = 'div',
}: {
  children: React.ReactNode;
  className?: string;
  /** Stagger against sibling Reveals, in ms — mapped onto the view-timeline range below. */
  delay?: number;
  as?: React.ElementType;
}) {
  // A view timeline has no clock, so the old ms `transition-delay` has no equivalent: stagger has to
  // be expressed as a shift along the scroll range instead. Capped so a large delay can't push the
  // animation past the point where the element has already been read.
  const shift = Math.min(Math.max(delay, 0), 200) / 8;

  return (
    <Tag
      className={cn('reveal', className)}
      style={
        shift
          ? ({
              '--reveal-start': `${5 + shift}%`,
              '--reveal-end': `${60 + shift}%`,
            } as React.CSSProperties)
          : undefined
      }
    >
      {children}
    </Tag>
  );
}
