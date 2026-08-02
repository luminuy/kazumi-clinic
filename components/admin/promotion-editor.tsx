'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  Clock,
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

export type AdminPromotion = {
  id: string;
  name: string;
  nameEn: string;
  detail: string;
  detailEn: string;
  price: number | null;
  originalPrice: number | null;
  note: string;
  noteEn: string;
  /** Inclusive ISO date (YYYY-MM-DD) the promo is valid through. */
  validUntil: string;
  categorySlug: string;
  imagePublicId: string | null;
};

/** Category options for the dropdown — passed from the server so the list stays in one place. */
export type CategoryOption = { slug: string; title: string };

type Draft = {
  name: string;
  nameEn: string;
  detail: string;
  detailEn: string;
  price: string;
  originalPrice: string;
  note: string;
  noteEn: string;
  validUntil: string;
  categorySlug: string;
  imagePublicId: string | null;
  imageFile?: File | null;
};

const emptyDraft: Draft = {
  name: '',
  nameEn: '',
  detail: '',
  detailEn: '',
  price: '',
  originalPrice: '',
  note: '',
  noteEn: '',
  validUntil: '',
  categorySlug: '',
  imagePublicId: null,
};

function draftFrom(promo: AdminPromotion): Draft {
  return {
    name: promo.name,
    nameEn: promo.nameEn,
    detail: promo.detail,
    detailEn: promo.detailEn,
    price: String(promo.price),
    originalPrice: promo.originalPrice === null ? '' : String(promo.originalPrice),
    note: promo.note,
    noteEn: promo.noteEn,
    validUntil: promo.validUntil,
    categorySlug: promo.categorySlug,
    imagePublicId: promo.imagePublicId,
  };
}

function isExpired(validUntil: string, today: string) {
  return validUntil < today;
}

function formatThaiDate(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function PromotionEditor({
  promotions,
  hiddenPromotions,
  categories,
  today,
}: {
  promotions: AdminPromotion[];
  hiddenPromotions: AdminPromotion[];
  categories: CategoryOption[];
  /** Server-computed YYYY-MM-DD so "expired" is judged against the server clock, not the browser. */
  today: string;
}) {
  const { editing, draft, setDraft, busyId, busy, error, setError, openAdd, openEdit, close, mutate } =
    useEntityEditor<AdminPromotion, Draft>({ emptyDraft, draftFrom });

  async function save() {
    const name = draft.name.trim();
    if (!name) return setError('ต้องมีชื่อโปรโมชั่น');

    const priceRaw = draft.price.trim();
    const price = priceRaw === '' ? null : Number(priceRaw);
    if (price !== null && (!Number.isInteger(price) || price <= 0)) {
      return setError('ราคาต้องเป็นจำนวนเต็มบวก');
    }

    const originalRaw = draft.originalPrice.trim();
    const originalPrice = originalRaw === '' ? null : Number(originalRaw);
    if (originalPrice !== null && (price === null || originalPrice <= price)) {
      return setError('ราคาเดิมต้องเป็นจำนวนเต็มและมากกว่าราคาโปรโมชั่น');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.validUntil)) return setError('เลือกวันหมดอายุ');

    const body = {
      ...(editing && editing !== 'new' ? { id: editing } : {}),
      name,
      nameEn: draft.nameEn.trim() || null,
      detail: draft.detail.trim() || null,
      detailEn: draft.detailEn.trim() || null,
      price,
      originalPrice,
      note: draft.note.trim() || null,
      noteEn: draft.noteEn.trim() || null,
      validUntil: draft.validUntil,
      categorySlug: draft.categorySlug || null,
      imagePublicId: draft.imagePublicId,
    };

    await mutate(
      editing ?? 'new',
      async () => {
        const res = await fetch('/api/admin/promotions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        });
        if (!res.ok) return res;

        if (draft.imageFile) {
          const result = await res.clone().json();
          const form = new FormData();
          form.append('id', result.id);
          form.append('file', draft.imageFile);
          const imgRes = await fetch('/api/admin/promotions/image', {
            method: 'POST',
            body: form,
          });
          if (!imgRes.ok) return imgRes;
        }

        return res;
      },
      () => close(),
    );
  }

  async function remove(promo: AdminPromotion) {
    if (!window.confirm(`ซ่อนโปรโมชั่นนี้จากเว็บ?\n\n${promo.name}`)) return;
    await mutate('del-' + promo.id, () =>
      fetch('/api/admin/promotions', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: promo.id }),
      }),
    );
  }

  async function restore(promo: AdminPromotion) {
    await mutate('restore-' + promo.id, () =>
      fetch('/api/admin/promotions', {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: promo.id }),
      }),
    );
  }

  async function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= promotions.length) return;
    const orderedIds = promotions.map((p) => p.id);
    [orderedIds[index], orderedIds[next]] = [orderedIds[next], orderedIds[index]];
    await mutate('order', () =>
      fetch('/api/admin/promotions', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      }),
    );
  }

  async function uploadImage(promo: AdminPromotion, file: File) {
    const form = new FormData();
    form.append('id', promo.id);
    form.append('file', file);
    await mutate('img-' + promo.id, () =>
      fetch('/api/admin/promotions/image', { method: 'POST', body: form }),
    );
  }

  const heading =
    editing === 'new'
      ? 'โปรโมชั่นใหม่'
      : editing
        ? `แก้ไข: ${promotions.find((p) => p.id === editing)?.name ?? ''}`
        : '';

  return (
    <section className="mt-10">
      <SectionHeading
        title="รายการโปรโมชั่น"
        count={`${promotions.length} รายการ`}
        action={
          <button type="button" onClick={() => openAdd()} disabled={busy} className={btn.primary}>
            <Plus className="size-3.5" />
            เพิ่มโปรโมชั่น
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
        <PromotionForm draft={draft} setDraft={setDraft} categories={categories} />
      </EditorDrawer>

      <ul className="mt-6 space-y-3">
        {promotions.map((promo, index) => (
          <li key={promo.id}>
            <PromotionRow
              promo={promo}
              expired={isExpired(promo.validUntil, today)}
              first={index === 0}
              last={index === promotions.length - 1}
              busy={busy}
              busyId={busyId}
              onEdit={() => openEdit(promo)}
              onDelete={() => remove(promo)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
              onUpload={(file) => uploadImage(promo, file)}
            />
          </li>
        ))}
        {promotions.length === 0 && (
          <li className="rounded-2xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-ink/40">
            ยังไม่มีโปรโมชั่น — กด “เพิ่มโปรโมชั่น” เพื่อเริ่ม
          </li>
        )}
      </ul>

      {hiddenPromotions.length > 0 && (
        <div className="mt-8 border-t border-black/[0.07] pt-8">
          <SectionHeading title="โปรโมชั่นที่ซ่อนอยู่" count={`${hiddenPromotions.length} รายการ`} />
          <ul className="mt-6 space-y-3">
            {hiddenPromotions.map((promo) => (
              <li key={promo.id}>
                <HiddenPromotionRow
                  promo={promo}
                  busy={busy}
                  busyId={busyId}
                  onRestore={() => restore(promo)}
                />
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function HiddenPromotionRow({
  promo,
  busy,
  busyId,
  onRestore,
}: {
  promo: AdminPromotion;
  busy: boolean;
  busyId: string | null;
  onRestore: () => void;
}) {
  const rowBusy = busyId === 'restore-' + promo.id;

  return (
    <div className={cn(card, 'flex gap-4 p-4 opacity-75')}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand ring-1 ring-black/[0.05]">
        {promo.imagePublicId ? (
          <Image
            src={promo.imagePublicId}
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
          <h4 className="truncate font-serif text-lg leading-tight text-ink">{promo.name}</h4>
          <span className="shrink-0 rounded-full bg-black/[0.05] px-2 py-0.5 text-[0.62rem] font-medium text-ink/45">
            ซ่อนอยู่
          </span>
        </div>
        <p className="mt-1 text-sm font-medium text-ink">
          {promo.price !== null ? (
            <>
              {promo.price.toLocaleString('th-TH')} <span className="text-xs font-normal text-ink/45">บาท</span>
            </>
          ) : (
            <span className="text-xs font-normal text-ink/45">ไม่ระบุราคา</span>
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

function PromotionRow({
  promo,
  expired,
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
  promo: AdminPromotion;
  expired: boolean;
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
  const rowBusy = busyId === 'del-' + promo.id || busyId === 'img-' + promo.id;

  return (
    <div className={cn(card, 'flex gap-4 p-4', expired && 'opacity-70')}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand ring-1 ring-black/[0.05]">
        {promo.imagePublicId ? (
          <Image
            key={promo.imagePublicId}
            src={promo.imagePublicId}
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
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="truncate font-serif text-lg leading-tight text-ink">{promo.name}</h4>
            {promo.detail && (
              <span className="rounded-full bg-black/[0.05] px-2 py-0.5 text-[0.62rem] text-ink/55">
                {promo.detail}
              </span>
            )}
          </div>
          <p className="mt-1 text-sm font-medium text-ink">
            {promo.price !== null ? (
              <>
                {promo.price.toLocaleString('th-TH')}{' '}
                <span className="text-xs font-normal text-ink/45">บาท</span>
              </>
            ) : (
              <span className="text-xs font-normal text-ink/45">ไม่ระบุราคา</span>
            )}
            {promo.originalPrice !== null && (
              <span className="ml-2 text-xs font-normal text-ink/40 line-through">
                {promo.originalPrice.toLocaleString('th-TH')}
              </span>
            )}
          </p>
          {promo.note && <p className="mt-0.5 text-xs text-forest">{promo.note}</p>}
        </div>
        <span
          className={cn(
            'inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.62rem] font-medium',
            expired ? 'bg-red-50 text-red-600' : 'bg-forest/10 text-forest',
          )}
        >
          <Clock className="size-3" />
          {expired ? 'หมดอายุแล้ว' : 'ใช้ได้'} · {formatThaiDate(promo.validUntil)}
        </span>
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-1.5 border-t border-black/[0.05] pt-3">
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          aria-label={`อัปรูปสำหรับ ${promo.name}`}
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
          {promo.imagePublicId ? 'เปลี่ยนรูป' : 'อัปรูป'}
        </button>
        <button type="button" disabled={busy} onClick={onEdit} className={btn.secondary}>
          <Pencil className="size-3.5" />
          แก้ไข
        </button>
        <button type="button" disabled={busy} onClick={onDelete} className={btn.danger}>
          {busyId === 'del-' + promo.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
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

function PromotionForm({
  draft,
  setDraft,
  categories,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  categories: CategoryOption[];
}) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div className="sm:col-span-2">
        <Field label="ชื่อโปรโมชั่น (ไทย)">
          <input
            className={inputClass}
            value={draft.name}
            onChange={(e) => set({ name: e.target.value })}
            placeholder="เช่น Filler Neura Deep"
          />
        </Field>
      </div>
      <div className="sm:col-span-2">
        <Field label="ชื่อโปรโมชั่น (อังกฤษ)">
          <input
            className={inputClass}
            value={draft.nameEn}
            onChange={(e) => set({ nameEn: e.target.value })}
            placeholder="เช่น Neura Deep Filler"
          />
          <EnglishFallbackNote />
        </Field>
      </div>
      <Field label="รายละเอียด (ไทย)" hint="เช่น ปริมาณ · ไม่บังคับ">
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
      <Field label="หมวดบริการ" hint="ไม่บังคับ">
        <select
          className={inputClass}
          value={draft.categorySlug}
          onChange={(e) => set({ categorySlug: e.target.value })}
        >
          <option value="">— ไม่ระบุ —</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="ราคาโปรโมชั่น (บาท)" hint="เว้นว่าง = ไม่ระบุราคา">
        <input
          className={inputClass}
          inputMode="numeric"
          value={draft.price}
          onChange={(e) => set({ price: e.target.value })}
          placeholder="เช่น 3990"
        />
      </Field>
      <Field label="ราคาเดิม (บาท)" hint="ขีดฆ่า · ไม่บังคับ">
        <input
          className={inputClass}
          inputMode="numeric"
          value={draft.originalPrice}
          onChange={(e) => set({ originalPrice: e.target.value })}
          placeholder="เช่น 5990"
        />
      </Field>
      <Field label="วันหมดอายุ" hint="โปรฯ จะซ่อนเองเมื่อเลยวันนี้">
        <input
          type="date"
          className={inputClass}
          value={draft.validUntil}
          onChange={(e) => set({ validUntil: e.target.value })}
        />
      </Field>
      <Field label="หมายเหตุ (ไทย)" hint="เช่น เงื่อนไข · ไม่บังคับ">
        <input
          className={inputClass}
          value={draft.note}
          onChange={(e) => set({ note: e.target.value })}
          placeholder="เช่น ซื้อ 1 แถม 1"
        />
      </Field>
      <Field label="หมายเหตุ (อังกฤษ)">
        <input
          className={inputClass}
          value={draft.noteEn}
          onChange={(e) => set({ noteEn: e.target.value })}
          placeholder="เช่น Buy 1 get 1 free"
        />
        <EnglishFallbackNote />
      </Field>
      <Field label="รูปภาพโปรโมชั่น" hint="JPG/PNG/WebP/AVIF · ไม่บังคับ">
        <div className="flex items-center gap-2">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className={cn(inputClass, 'p-1 text-sm file:mr-2 file:cursor-pointer file:rounded-md file:border-0 file:bg-forest/10 file:px-3 file:py-1 file:text-xs file:font-medium file:text-forest')}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) set({ imageFile: file });
            }}
          />
        </div>
      </Field>
    </div>
  );
}
