'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Check, Loader2, RotateCcw, TriangleAlert, Upload } from 'lucide-react';
import type { SiteImageSpec } from '@/lib/site-images';
import { cn } from '@/lib/utils';

type Status = { kind: 'idle' | 'saving' | 'saved' } | { kind: 'error'; message: string };

export type ImageSlot = SiteImageSpec & {
  /** What's live right now — the clinic's upload if there is one, else the shipped default. */
  currentPublicId: string;
  isOverridden: boolean;
  updatedAt: number | null;
  updatedBy: string | null;
};

export function ImageSlotCard({ slot }: { slot: ImageSlot }) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<Status>({ kind: 'idle' });
  const busy = status.kind === 'saving';

  async function upload(file: File) {
    setStatus({ kind: 'saving' });
    const body = new FormData();
    body.append('key', slot.key);
    body.append('file', file);

    try {
      const res = await fetch('/api/admin/images', { method: 'POST', body });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'อัปโหลดไม่สำเร็จ');
      setStatus({ kind: 'saved' });
      // Pull the new public ID down from the server rather than guessing it client-side.
      router.refresh();
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ',
      });
    }
  }

  async function reset() {
    setStatus({ kind: 'saving' });
    try {
      const res = await fetch('/api/admin/images', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ key: slot.key }),
      });
      const data = (await res.json()) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? 'คืนค่าเริ่มต้นไม่สำเร็จ');
      setStatus({ kind: 'saved' });
      router.refresh();
    } catch (error) {
      setStatus({
        kind: 'error',
        message: error instanceof Error ? error.message : 'คืนค่าเริ่มต้นไม่สำเร็จ',
      });
    }
  }

  return (
    <li className="flex gap-4 rounded-2xl border border-olive/15 bg-cream p-4">
      <div className="relative size-28 shrink-0 overflow-hidden rounded-xl bg-sand">
        <Image
          key={slot.currentPublicId}
          src={slot.currentPublicId}
          alt=""
          aria-hidden="true"
          fill
          sizes="112px"
          className={cn('object-cover transition-opacity', busy && 'opacity-40')}
        />
        {busy && (
          <span className="absolute inset-0 grid place-items-center">
            <Loader2 className="size-5 animate-spin text-olive" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-lg leading-tight text-olive-deep">{slot.label}</h3>
          {slot.isOverridden && (
            <span className="shrink-0 rounded-full bg-olive/10 px-2 py-0.5 text-[0.65rem] text-olive">
              เปลี่ยนแล้ว
            </span>
          )}
        </div>
        <p className="mt-0.5 text-xs text-ink/55">{slot.where}</p>
        <p className="mt-1 text-xs text-olive-light">{slot.ratioHint}</p>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            aria-label={`เลือกรูปใหม่สำหรับ${slot.label}`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) void upload(file);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-full bg-olive px-3.5 py-1.5 text-xs text-cream transition-colors hover:bg-olive-deep disabled:opacity-50"
          >
            <Upload className="size-3.5" />
            เปลี่ยนรูป
          </button>

          {slot.isOverridden && (
            <button
              type="button"
              disabled={busy}
              onClick={() => void reset()}
              className="inline-flex items-center gap-1.5 rounded-full border border-olive/25 px-3 py-1.5 text-xs text-ink/60 transition-colors hover:bg-olive/10 hover:text-olive-deep disabled:opacity-50"
            >
              <RotateCcw className="size-3.5" />
              คืนรูปเดิม
            </button>
          )}

          {/* role=status so a screen reader hears the result without the focus moving. */}
          <span role="status" className="text-xs">
            {status.kind === 'saved' && (
              <span className="inline-flex items-center gap-1 text-olive">
                <Check className="size-3.5" /> บันทึกแล้ว
              </span>
            )}
            {status.kind === 'error' && (
              <span className="inline-flex items-center gap-1 text-red-700">
                <TriangleAlert className="size-3.5" /> {status.message}
              </span>
            )}
          </span>
        </div>

        <code className="mt-2.5 truncate text-[0.65rem] text-ink/35">{slot.currentPublicId}</code>
      </div>
    </li>
  );
}
