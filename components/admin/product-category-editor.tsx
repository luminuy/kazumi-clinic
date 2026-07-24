'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronDown,
  ChevronUp,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card, inputClass, SectionHeading } from './ui';

export type AdminProduct = {
  id: string;
  name: string;
  detail: string;
  tagline: string;
  benefits: string[];
  collection: string;
  priceFrom: number | null;
  unit: string;
  imagePublicId: string | null;
  /** In the shipped catalogue (lib/services.ts) — can be reset, not truly deleted. */
  isDefault: boolean;
  /** Has a saved override row in D1. */
  isEdited: boolean;
};

type Draft = {
  name: string;
  detail: string;
  collection: string;
  tagline: string;
  price: string;
  unit: string;
  benefits: string;
};

const emptyDraft: Draft = {
  name: '',
  detail: '',
  collection: '',
  tagline: '',
  price: '',
  unit: 'ครั้ง',
  benefits: '',
};

function draftFrom(product: AdminProduct): Draft {
  return {
    name: product.name,
    detail: product.detail,
    collection: product.collection,
    tagline: product.tagline,
    price: product.priceFrom === null ? '' : String(product.priceFrom),
    unit: product.unit || 'ครั้ง',
    benefits: product.benefits.join('\n'),
  };
}

/** Reads a failed response without throwing "Unexpected end of JSON input" on an empty body. */
async function errorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '');
  if (text) {
    try {
      const data = JSON.parse(text) as { error?: string };
      if (data.error) return data.error;
    } catch {
      /* non-JSON body */
    }
  }
  if (res.status === 401 || res.status === 404)
    return 'เซสชันหมดอายุ — โหลดหน้านี้ใหม่แล้วลองอีกครั้ง';
  return `${fallback} (${res.status})`;
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
  const router = useRouter();
  // 'new' opens a blank add form; a product id opens that product's edit form.
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = busyId !== null;

  function openAdd() {
    setError(null);
    setDraft(emptyDraft);
    setEditing('new');
  }

  function openEdit(product: AdminProduct) {
    setError(null);
    setDraft(draftFrom(product));
    setEditing(product.id);
  }

  function close() {
    setEditing(null);
    setError(null);
  }

  async function mutate(
    key: string,
    run: () => Promise<Response>,
    onOk?: () => void,
  ): Promise<boolean> {
    setBusyId(key);
    setError(null);
    try {
      const res = await run();
      if (!res.ok) throw new Error(await errorMessage(res, 'บันทึกไม่สำเร็จ'));
      onOk?.();
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
      return false;
    } finally {
      setBusyId(null);
    }
  }

  async function save() {
    const name = draft.name.trim();
    if (!name) {
      setError('ต้องมีชื่อสินค้า');
      return;
    }
    const priceValue = draft.price.trim();
    const priceFrom = priceValue === '' ? null : Number(priceValue);
    if (priceFrom !== null && (!Number.isInteger(priceFrom) || priceFrom <= 0)) {
      setError('ราคาต้องเป็นจำนวนเต็มบวก หรือเว้นว่างไว้');
      return;
    }
    const benefits = draft.benefits
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    const body = {
      ...(editing && editing !== 'new' ? { id: editing } : {}),
      category: slug,
      name,
      detail: draft.detail.trim() || null,
      collection: draft.collection.trim() || null,
      tagline: draft.tagline.trim() || null,
      benefits: benefits.length > 0 ? benefits : null,
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
    const label = product.isDefault ? 'ซ่อนสินค้าเริ่มต้นนี้จากเว็บ?' : 'ลบสินค้านี้?';
    if (!window.confirm(`${label}\n\n${product.name}`)) return;
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

  return (
    <section id={`products-${slug}`} className="scroll-mt-36">
      <SectionHeading
        title={title}
        count={`${products.length} รายการ`}
        action={
          <button type="button" onClick={openAdd} disabled={busy} className={btn.primary}>
            <Plus className="size-3.5" />
            เพิ่มสินค้า
          </button>
        }
      />

      {error && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          <TriangleAlert className="size-3.5" /> {error}
        </p>
      )}

      {editing === 'new' && (
        <ProductForm
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={close}
          busy={busy}
          heading="สินค้าใหม่"
        />
      )}

      <ul className="mt-6 space-y-3">
        {products.map((product, index) => (
          <li key={product.id}>
            {editing === product.id ? (
              <ProductForm
                draft={draft}
                setDraft={setDraft}
                onSave={save}
                onCancel={close}
                busy={busy}
                heading={`แก้ไข: ${product.name}`}
              />
            ) : (
              <ProductRow
                product={product}
                first={index === 0}
                last={index === products.length - 1}
                busy={busy}
                busyId={busyId}
                onEdit={() => openEdit(product)}
                onDelete={() => remove(product)}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
                onUpload={(file) => uploadImage(product, file)}
              />
            )}
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
            {product.isDefault ? 'ซ่อน' : 'ลบ'}
          </button>

          <span className="ml-auto flex items-center gap-1">
            <button
              type="button"
              disabled={busy || first}
              onClick={onMoveUp}
              aria-label="เลื่อนขึ้น"
              className={cn(btn.icon, 'size-7')}
            >
              <ChevronUp className="size-4" />
            </button>
            <button
              type="button"
              disabled={busy || last}
              onClick={onMoveDown}
              aria-label="เลื่อนลง"
              className={cn(btn.icon, 'size-7')}
            >
              <ChevronDown className="size-4" />
            </button>
          </span>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink/65">{label}</span>
      {hint && <span className="ml-2 text-[0.65rem] text-ink/35">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

function ProductForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  busy,
  heading,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
  heading: string;
}) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });

  return (
    <div className="rounded-2xl border border-black/[0.09] bg-cream p-5 shadow-[0_2px_16px_rgba(0,0,0,0.05)] sm:p-6">
      <div className="flex items-center justify-between">
        <h4 className="font-serif text-xl text-ink">{heading}</h4>
        <button
          type="button"
          onClick={onCancel}
          disabled={busy}
          aria-label="ปิด"
          className={cn(btn.icon, 'size-8')}
        >
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Field label="ชื่อสินค้า">
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="เช่น Neura Deep"
            />
          </Field>
        </div>
        <Field label="รายละเอียด" hint="เช่น ปริมาณ/รุ่น">
          <input
            className={inputClass}
            value={draft.detail}
            onChange={(e) => set({ detail: e.target.value })}
            placeholder="เช่น 1 CC"
          />
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
          <Field label="คำโปรยภาษาอังกฤษ" hint="ไม่บังคับ">
            <input
              className={inputClass}
              value={draft.tagline}
              onChange={(e) => set({ tagline: e.target.value })}
              placeholder="เช่น Rh Collagen"
            />
          </Field>
        </div>
        <div className="sm:col-span-2">
          <Field label="จุดเด่น" hint="บรรทัดละ 1 ข้อ · ไม่บังคับ">
            <textarea
              className={cn(inputClass, 'min-h-24 resize-y')}
              value={draft.benefits}
              onChange={(e) => set({ benefits: e.target.value })}
              placeholder={'ข้อดีข้อที่ 1\nข้อดีข้อที่ 2'}
            />
          </Field>
        </div>
      </div>

      <div className="mt-6 flex items-center gap-2">
        <button type="button" onClick={onSave} disabled={busy} className={btn.primary}>
          {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
          บันทึก
        </button>
        <button type="button" onClick={onCancel} disabled={busy} className={btn.secondary}>
          ยกเลิก
        </button>
      </div>
    </div>
  );
}
