'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Loader2, Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MAX_IMAGES_PER_ENTITY } from '@/lib/entity-images-store';

export type GalleryImage = { id: string; publicId: string };
export type GalleryEntityType = 'product' | 'promotion' | 'post';

/**
 * The "additional photos" gallery shared by products, promotions, and blog posts — up to
 * MAX_IMAGES_PER_ENTITY tiles, add/remove/reorder, backed by /api/admin/entity-images (one shared
 * route + table, migrations/0019_entity_images.sql). This is separate from each entity's existing
 * single cover/primary image, which keeps driving the public site unchanged.
 *
 * Only usable once the entity has a real id — a brand-new, unsaved product/promotion/post has
 * nowhere to attach a gallery row to yet, same constraint the existing single-image upload button
 * already has.
 */
export function ImageGallery({
  entityType,
  entityId,
  images,
  onChange,
  disabled,
}: {
  entityType: GalleryEntityType;
  entityId: string;
  images: GalleryImage[];
  onChange: (images: GalleryImage[]) => void;
  disabled?: boolean;
}) {
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const full = images.length >= MAX_IMAGES_PER_ENTITY;
  const busy = busyKey !== null || Boolean(disabled);

  async function upload(file: File) {
    setBusyKey('upload');
    setError(null);
    const form = new FormData();
    form.append('entityType', entityType);
    form.append('entityId', entityId);
    form.append('file', file);
    try {
      const res = await fetch('/api/admin/entity-images', { method: 'POST', body: form });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? 'อัปโหลดไม่สำเร็จ');
      onChange([...images, { id: data.id, publicId: data.publicId }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปโหลดไม่สำเร็จ');
    } finally {
      setBusyKey(null);
    }
  }

  async function remove(image: GalleryImage) {
    setBusyKey('del-' + image.id);
    setError(null);
    try {
      const res = await fetch('/api/admin/entity-images', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: image.id }),
      });
      if (!res.ok) throw new Error('ลบรูปไม่สำเร็จ');
      onChange(images.filter((img) => img.id !== image.id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'ลบรูปไม่สำเร็จ');
    } finally {
      setBusyKey(null);
    }
  }

  async function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= images.length) return;
    const reordered = [...images];
    [reordered[index], reordered[next]] = [reordered[next], reordered[index]];
    setBusyKey('order');
    setError(null);
    try {
      const res = await fetch('/api/admin/entity-images', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ entityType, entityId, orderedIds: reordered.map((i) => i.id) }),
      });
      if (!res.ok) throw new Error('จัดลำดับไม่สำเร็จ');
      onChange(reordered);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'จัดลำดับไม่สำเร็จ');
    } finally {
      setBusyKey(null);
    }
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-ink/65">รูปเพิ่มเติม</span>
        <span className="text-[0.65rem] text-ink/35">
          {images.length}/{MAX_IMAGES_PER_ENTITY}
        </span>
      </div>
      {error && <p className="mt-1.5 text-[0.7rem] text-red-600">{error}</p>}
      <div className="mt-2 grid grid-cols-3 gap-2 sm:grid-cols-6">
        {images.map((image, index) => (
          <div
            key={image.id}
            className="group relative aspect-square overflow-hidden rounded-lg bg-sand ring-1 ring-black/[0.06]"
          >
            <Image
              src={image.publicId}
              alt=""
              aria-hidden="true"
              fill
              sizes="120px"
              className={cn('object-cover', busyKey === 'del-' + image.id && 'opacity-40')}
            />
            {busyKey === 'del-' + image.id && (
              <span className="absolute inset-0 grid place-items-center bg-cream/40">
                <Loader2 className="size-4 animate-spin text-forest" />
              </span>
            )}
            <button
              type="button"
              disabled={busy}
              onClick={() => remove(image)}
              aria-label="ลบรูปนี้"
              className="absolute top-1 right-1 grid size-6 place-items-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100 disabled:opacity-0"
            >
              <X className="size-3.5" />
            </button>
            {images.length > 1 && (
              <div className="absolute inset-x-0 bottom-1 flex items-center justify-center gap-1">
                <button
                  type="button"
                  disabled={busy || index === 0}
                  onClick={() => move(index, -1)}
                  aria-label="เลื่อนไปทางซ้าย"
                  className="grid size-6 place-items-center rounded-full bg-black/50 text-white disabled:opacity-0"
                >
                  <ChevronLeft className="size-3.5" />
                </button>
                <button
                  type="button"
                  disabled={busy || index === images.length - 1}
                  onClick={() => move(index, 1)}
                  aria-label="เลื่อนไปทางขวา"
                  className="grid size-6 place-items-center rounded-full bg-black/50 text-white disabled:opacity-0"
                >
                  <ChevronRight className="size-3.5" />
                </button>
              </div>
            )}
          </div>
        ))}
        {!full && (
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            aria-label="เพิ่มรูป"
            className="grid aspect-square place-items-center rounded-lg border border-dashed border-black/15 text-ink/35 transition-colors hover:border-black/25 hover:text-ink/50 disabled:opacity-40"
          >
            {busyKey === 'upload' ? <Loader2 className="size-5 animate-spin" /> : <Plus className="size-5" />}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="sr-only"
        aria-label="เพิ่มรูป"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) upload(file);
          event.target.value = '';
        }}
      />
    </div>
  );
}
