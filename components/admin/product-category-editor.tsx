'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import {
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card, inputClass, SectionHeading, Field, EnglishFallbackNote } from './ui';
import { useEntityEditor } from './use-entity-editor';
import { EditorDrawer } from './editor-drawer';
import { ReorderButtons } from './reorder-buttons';
import { ImageGallery, type GalleryImage } from './image-gallery';

export type AdminProduct = {
  id: string;
  name: string;
  nameEn: string;
  detail: string;
  detailEn: string;
  tagline: string;
  taglineEn: string;
  benefits: string[];
  benefitsEn: string[];
  collection: string;
  priceFrom: number | null;
  unit: string;
  imagePublicId: string | null;
  /** In the shipped catalogue (lib/services.ts) — can be reset, not truly deleted. */
  isDefault: boolean;
  /** Has a saved override row in D1. */
  isEdited: boolean;
  /** Additional photos beyond the single cover image — see components/admin/image-gallery.tsx. */
  galleryImages: GalleryImage[];
};

type Draft = {
  name: string;
  nameEn: string;
  detail: string;
  detailEn: string;
  collection: string;
  tagline: string;
  taglineEn: string;
  price: string;
  unit: string;
  benefits: string;
  benefitsEn: string;
};

const emptyDraft: Draft = {
  name: '',
  nameEn: '',
  detail: '',
  detailEn: '',
  collection: '',
  tagline: '',
  taglineEn: '',
  price: '',
  unit: 'ครั้ง',
  benefits: '',
  benefitsEn: '',
};

function draftFrom(product: AdminProduct): Draft {
  return {
    name: product.name,
    nameEn: product.nameEn,
    detail: product.detail,
    detailEn: product.detailEn,
    collection: product.collection,
    tagline: product.tagline,
    taglineEn: product.taglineEn,
    price: product.priceFrom === null ? '' : String(product.priceFrom),
    unit: product.unit || 'ครั้ง',
    benefits: product.benefits.join('\n'),
    benefitsEn: product.benefitsEn.join('\n'),
  };
}

export function ProductCategoryEditor({
  slug,
  title,
  products,
  hiddenProducts,
}: {
  slug: string;
  title: string;
  products: AdminProduct[];
  hiddenProducts: AdminProduct[];
}) {
  const { editing, draft, setDraft, busyId, busy, error, setError, openAdd, openEdit, close, mutate } =
    useEntityEditor<AdminProduct, Draft>({ emptyDraft, draftFrom });
  // The gallery persists each change immediately via its own API calls (see image-gallery.tsx),
  // so it lives outside `draft`/save() — this just mirrors whichever product is open for editing.
  const [galleryImages, setGalleryImages] = useState<GalleryImage[]>([]);

  function startEdit(product: AdminProduct) {
    openEdit(product);
    setGalleryImages(product.galleryImages);
  }

  async function save() {
    const name = draft.name.trim();
    if (!name) return setError('ต้องมีชื่อสินค้า');
    const priceValue = draft.price.trim();
    const priceFrom = priceValue === '' ? null : Number(priceValue);
    if (priceFrom !== null && (!Number.isInteger(priceFrom) || priceFrom <= 0)) {
      return setError('ราคาต้องเป็นจำนวนเต็มบวก หรือเว้นว่างไว้');
    }
    const benefits = draft.benefits
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);
    const benefitsEn = draft.benefitsEn
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const body = {
      ...(editing && editing !== 'new' ? { id: editing } : {}),
      category: slug,
      name,
      nameEn: draft.nameEn.trim() || null,
      detail: draft.detail.trim() || null,
      detailEn: draft.detailEn.trim() || null,
      collection: draft.collection.trim() || null,
      tagline: draft.tagline.trim() || null,
      taglineEn: draft.taglineEn.trim() || null,
      benefits: benefits.length > 0 ? benefits : null,
      benefitsEn: benefitsEn.length > 0 ? benefitsEn : null,
      priceFrom,
      unit: draft.unit.trim() || 'ครั้ง',
    };

    await mutate(
      editing ?? 'new',
      () =>
        fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      () => close(),
    );
  }

  async function remove(product: AdminProduct) {
    if (!window.confirm(`ซ่อนสินค้านี้จากเว็บ?\n\n${product.name}`)) return;
    await mutate('del-' + product.id, () =>
      fetch('/api/admin/products', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: product.id, category: slug }),
      }),
    );
  }

  async function restore(product: AdminProduct) {
    await mutate('restore-' + product.id, () =>
      fetch('/api/admin/products', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: product.id, category: slug }),
      }),
    );
  }

  async function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= products.length) return;
    const orderedIds = products.map((p) => p.id);
    [orderedIds[index], orderedIds[next]] = [orderedIds[next], orderedIds[index]];
    await mutate('order', () =>
      fetch('/api/admin/products', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ category: slug, orderedIds }),
      }),
    );
  }

  async function uploadImage(product: AdminProduct, file: File) {
    const form = new FormData();
    form.append('id', product.id);
    form.append('category', slug);
    form.append('file', file);
    await mutate('img-' + product.id, () =>
      fetch('/api/admin/products/image', { method: 'POST', body: form }),
    );
  }

  const heading =
    editing === 'new'
      ? 'สินค้าใหม่'
      : editing
        ? `แก้ไข: ${products.find((p) => p.id === editing)?.name ?? ''}`
        : '';

  return (
    <section>
      <SectionHeading
        title={title}
        count={`${products.length} รายการ`}
        action={
          <button type="button" onClick={() => openAdd()} disabled={busy} className={btn.primary}>
            <Plus className="size-3.5" />
            เพิ่มสินค้า
          </button>
        }
      />

      <EditorDrawer
        open={editing !== null}
        onOpenChange={(open) => !open && close()}
        heading={heading}
        busy={busy}
        error={error}
        onSave={save}
        onCancel={close}
      >
        <div className="flex flex-col gap-6">
          <ProductForm draft={draft} setDraft={setDraft} />
          {editing && editing !== 'new' && (
            <ImageGallery
              entityType="product"
              entityId={editing}
              images={galleryImages}
              onChange={setGalleryImages}
              disabled={busy}
            />
          )}
        </div>
      </EditorDrawer>

      <ul className="mt-6 space-y-3">
        {products.map((product, index) => (
          <li key={product.id}>
            <ProductRow
              product={product}
              first={index === 0}
              last={index === products.length - 1}
              busy={busy}
              busyId={busyId}
              onEdit={() => startEdit(product)}
              onDelete={() => remove(product)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onUpload={(file) => uploadImage(product, file)}
            />
          </li>
        ))}
        {products.length === 0 && (
          <li className="rounded-2xl border border-dashed border-black/10 px-4 py-8 text-center text-sm text-ink/40">
            ยังไม่มีสินค้าในหมวดนี้
          </li>
        )}
      </ul>

      {hiddenProducts.length > 0 && (
        <div className="mt-8 border-t border-black/[0.07] pt-8">
          <SectionHeading title="สินค้าที่ซ่อนอยู่" count={`${hiddenProducts.length} รายการ`} />
          <ul className="mt-6 space-y-3">
            {hiddenProducts.map((product) => (
              <li key={product.id}>
                <HiddenProductRow
                  product={product}
                  busy={busy}
                  busyId={busyId}
                  onRestore={() => restore(product)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function HiddenProductRow({
  product,
  busy,
  busyId,
  onRestore,
}: {
  product: AdminProduct;
  busy: boolean;
  busyId: string | null;
  onRestore: () => void;
}) {
  const rowBusy = busyId === 'restore-' + product.id;

  return (
    <div className={cn(card, 'flex gap-4 p-4 opacity-75')}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand ring-1 ring-black/[0.05]">
        {product.imagePublicId ? (
          <Image
            src={product.imagePublicId}
            alt=""
            aria-hidden="true"
            fill
            sizes="80px"
            className={cn('object-cover', rowBusy && 'opacity-40')}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center">
            <ImageOff className="size-5 text-ink/25" aria-hidden="true" />
          </span>
        )}
        {rowBusy && (
          <span className="absolute inset-0 grid place-items-center bg-cream/30">
            <Loader2 className="size-5 animate-spin text-forest" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate font-serif text-lg leading-tight text-ink">{product.name}</h4>
            {(product.detail || product.collection) && (
              <p className="mt-0.5 truncate text-xs text-ink/50">
                {[product.collection, product.detail].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-[0.62rem] font-medium text-ink/45">
            ซ่อนอยู่
          </span>
        </div>

        <p className="mt-1 text-sm font-medium text-ink">
          {product.priceFrom !== null ? (
            <>
              {product.priceFrom.toLocaleString('th-TH')}{' '}
              <span className="text-xs font-normal text-ink/45">บาท / {product.unit}</span>
            </>
          ) : (
            <span className="text-xs font-normal text-ink/45">สอบถามราคา</span>
          )}
        </p>

        <div className="mt-auto pt-3">
          <button type="button" disabled={busy} onClick={onRestore} className={btn.secondary}>
            <RotateCcw className="size-3.5" />
            กู้คืน
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductRow({
  product,
  first,
  last,
  busy,
  busyId,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
  onUpload,
}: {
  product: AdminProduct;
  first: boolean;
  last: boolean;
  busy: boolean;
  busyId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onUpload: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rowBusy = busyId === 'img-' + product.id || busyId === 'del-' + product.id;

  const badgeStyle = !product.isDefault
    ? 'bg-clay/15 text-ink/70'
    : product.isEdited
      ? 'bg-forest/10 text-forest'
      : 'bg-black/[0.05] text-ink/45';

  return (
    <div className={cn(card, 'flex gap-4 p-4')}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand ring-1 ring-black/[0.05]">
        {product.imagePublicId ? (
          <Image
            key={product.imagePublicId}
            src={product.imagePublicId}
            alt=""
            aria-hidden="true"
            fill
            sizes="80px"
            className={cn('object-cover', rowBusy && 'opacity-40')}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center">
            <ImageOff className="size-5 text-ink/25" aria-hidden="true" />
          </span>
        )}
        {rowBusy && (
          <span className="absolute inset-0 grid place-items-center bg-cream/30">
            <Loader2 className="size-5 animate-spin text-forest" />
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate font-serif text-lg leading-tight text-ink">{product.name}</h4>
            {(product.detail || product.collection) && (
              <p className="mt-0.5 truncate text-xs text-ink/50">
                {[product.collection, product.detail].filter(Boolean).join(' · ')}
              </p>
            )}
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-medium',
              badgeStyle,
            )}
          >
            {product.isDefault ? (product.isEdited ? 'แก้ไขแล้ว' : 'เริ่มต้น') : 'เพิ่มเอง'}
          </span>
        </div>

        <p className="mt-1 text-sm font-medium text-ink">
          {product.priceFrom !== null ? (
            <>
              {product.priceFrom.toLocaleString('th-TH')}{' '}
              <span className="text-xs font-normal text-ink/45">บาท / {product.unit}</span>
            </>
          ) : (
            <span className="text-xs font-normal text-ink/45">สอบถามราคา</span>
          )}
        </p>

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            aria-label={`อัปรูปสำหรับ ${product.name}`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = '';
            }}
          />
          <button
            type="button"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
            className={btn.secondary}
          >
            <Upload className="size-3.5" />
            {product.imagePublicId ? 'เปลี่ยนรูป' : 'อัปรูป'}
          </button>
          <button type="button" disabled={busy} onClick={onEdit} className={btn.secondary}>
            <Pencil className="size-3.5" />
            แก้ไข
          </button>
          <button type="button" disabled={busy} onClick={onDelete} className={btn.danger}>
            <Trash2 className="size-3.5" />
            ซ่อน
          </button>

          <span className="ml-auto">
            <ReorderButtons disabled={busy} first={first} last={last} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
          </span>
        </div>
      </div>
    </div>
  );
}

function ProductForm({
  draft,
  setDraft,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
}) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="ชื่อสินค้า (ไทย)">
          <input
            className={inputClass}
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="เช่น Neura Deep"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="ชื่อสินค้า (อังกฤษ)">
          <input
            className={inputClass}
            value={draft.nameEn}
            onChange={(e) => set({ nameEn: e.target.value })}
            placeholder="เช่น Neura Deep"
          />
          <EnglishFallbackNote />
        </Field>
      </div>
      <Field label="รายละเอียด (ไทย)" hint="เช่น ปริมาณ/รุ่น">
        <input
          className={inputClass}
          value={draft.detail}
          onChange={(e) => set({ detail: e.target.value })}
          placeholder="เช่น 1 CC"
        />
      </Field>
      <Field label="รายละเอียด (อังกฤษ)">
        <input
          className={inputClass}
          value={draft.detailEn}
          onChange={(e) => set({ detailEn: e.target.value })}
          placeholder="เช่น 1 cc"
        />
        <EnglishFallbackNote />
      </Field>
      <Field label="กลุ่มย่อย" hint="ไม่บังคับ">
        <input
          className={inputClass}
          value={draft.collection}
          onChange={(e) => set({ collection: e.target.value })}
          placeholder="เช่น Essential Glow Collection"
        />
      </Field>
      <Field label="ราคา (บาท)" hint="เว้นว่าง = สอบถามราคา">
        <input
          className={inputClass}
          inputMode="numeric"
          value={draft.price}
          onChange={(e) => set({ price: e.target.value })}
          placeholder="เช่น 3990"
        />
      </Field>
      <Field label="หน่วย">
        <input
          className={inputClass}
          value={draft.unit}
          onChange={(e) => set({ unit: e.target.value })}
          placeholder="ครั้ง"
        />
      </Field>
      <div className="sm:col-span-2">
        <Field label="คำโปรย (ไทย)" hint="ไม่บังคับ">
          <input
            className={inputClass}
            value={draft.tagline}
            onChange={(e) => set({ tagline: e.target.value })}
            placeholder="เช่น Rh Collagen"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="คำโปรย (อังกฤษ)">
          <input
            className={inputClass}
            value={draft.taglineEn}
            onChange={(e) => set({ taglineEn: e.target.value })}
            placeholder="เช่น Rh Collagen"
          />
          <EnglishFallbackNote />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="จุดเด่น (ไทย)" hint="บรรทัดละ 1 ข้อ · ไม่บังคับ">
          <textarea
            className={cn(inputClass, 'min-h-24 resize-y')}
            value={draft.benefits}
            onChange={(e) => set({ benefits: e.target.value })}
            placeholder={'ข้อดีข้อที่ 1\nข้อดีข้อที่ 2'}
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="จุดเด่น (อังกฤษ)" hint="บรรทัดละ 1 ข้อ">
          <textarea
            className={cn(inputClass, 'min-h-24 resize-y')}
            value={draft.benefitsEn}
            onChange={(e) => set({ benefitsEn: e.target.value })}
            placeholder={'First benefit\nSecond benefit'}
          />
          <EnglishFallbackNote />
        </Field>
      </div>
    </div>
  );
}
