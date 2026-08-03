'use client';

import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Google's Maps embed iframe pulls in the full interactive Maps JavaScript API once its document
 * loads (~850KB / ~850ms of main-thread time — places.js, controls.js, map.js, etc.), not a cheap
 * static image. `loading="lazy"` alone doesn't keep it off the critical path: Lighthouse's mobile
 * trace simulates scrolling the whole page, which triggers the native lazy-load before the trace
 * ends, and the resulting main-thread congestion was severe enough that LCP couldn't be measured
 * at all ("NO_LCP"). This renders nothing but a placeholder + button until the visitor actually
 * asks for the map — the same click-to-load "facade" pattern as lite-youtube-embed.
 */
export function MapEmbed({
  src,
  title,
  loadLabel,
  referrerPolicy = 'no-referrer-when-downgrade',
  className,
}: {
  src: string;
  title: string;
  loadLabel: string;
  referrerPolicy?: React.IframeHTMLAttributes<HTMLIFrameElement>['referrerPolicy'];
  className?: string;
}) {
  const [loaded, setLoaded] = useState(false);

  if (loaded) {
    return (
      <iframe
        src={src}
        title={title}
        loading="lazy"
        referrerPolicy={referrerPolicy}
        allowFullScreen
        className={cn('absolute inset-0 size-full border-0', className)}
      />
    );
  }

  return (
    <div
      className={cn(
        'absolute inset-0 flex size-full items-center justify-center bg-[var(--store-surface)]',
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setLoaded(true)}
        className="inline-flex items-center gap-2 rounded-full bg-[var(--forest)] px-5 py-3 text-xs font-medium text-white transition-colors hover:bg-[var(--mint)]"
      >
        <MapPin className="size-4" aria-hidden="true" />
        {loadLabel}
      </button>
    </div>
  );
}
