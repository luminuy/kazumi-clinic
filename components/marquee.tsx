import { cn } from '@/lib/utils';

// Seamless horizontal marquee. The track renders the items twice so the
// translateX(-50%) keyframe (see globals.css) lands exactly one set over and loops cleanly.
export function Marquee({
  items,
  className,
  durationSec = 40,
  separator = '·',
}: {
  items: string[];
  className?: string;
  durationSec?: number;
  separator?: string;
}) {
  const sequence = [...items, ...items];

  return (
    <div
      className={cn('marquee', className)}
      style={{ ['--marquee-duration' as string]: `${durationSec}s` }}
    >
      <div className="marquee-track">
        {sequence.map((item, i) => (
          <span key={i} className="flex items-center" aria-hidden={i >= items.length}>
            <span className="px-6">{item}</span>
            <span className="opacity-40">{separator}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
