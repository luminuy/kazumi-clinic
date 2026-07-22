'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card, inputClass, SectionHeading } from './ui';

export type AdminPromotion = {
  id: string;
  name: string;
  detail: string;
  price: number;
  originalPrice: number | null;
  note: string;
  /** Inclusive ISO date (YYYY-MM-DD) the promo is valid through. */
  validUntil: string;
  categorySlug: string;
};

/** Category options for the dropdown — passed from the server so the list stays in one place. */
export type CategoryOption = { slug: string; title: string };

type Draft = {
  name: string;
  detail: string;
  price: string;
  originalPrice: string;
  note: string;
  validUntil: string;
  categorySlug: string;
};

const emptyDraft: Draft = {
  name: '',
  detail: '',
  price: '',
  originalPrice: '',
  note: '',
  validUntil: '',
  categorySlug: '',
};

function draftFrom(promo: AdminPromotion): Draft {
  return {
    name: promo.name,
    detail: promo.detail,
    price: String(promo.price),
    originalPrice: promo.originalPrice === null ? '' : String(promo.originalPrice),
    note: promo.note,
    validUntil: promo.validUntil,
    categorySlug: promo.categorySlug,
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
  categories,
  today,
}: {
  promotions: AdminPromotion[];
  categories: CategoryOption[];
  /** Server-computed YYYY-MM-DD so "expired" is judged against the server clock, not the browser. */
  today: string;
}) {
  const router = useRouter();
  // 'new' opens a blank add form; a promotion id opens that promotion's edit form.
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

  function openEdit(promo: AdminPromotion) {
    setError(null);
    setDraft(draftFrom(promo));
    setEditing(promo.id);
  }

  function close() {
    setEditing(null);
    setError(null);
  }

  async function mutate(key: string, run: () => Promise<Response>, onOk?: () => void) {
    setBusyId(key);
    setError(null);
    try {
      const res = await run();
      if (!res.ok) throw new Error(await errorMessage(res, 'บันทึกไม่สำเร็จ'));
      onOk?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  }

  async function save() {
    const name = draft.name.trim();
    if (!name) return setError('ต้องมีชื่อโปรโมชั่น');

    const price = Number(draft.price.trim());
    if (!Number.isInteger(price) || price <= 0) return setError('ราคาต้องเป็นจำนวนเต็มบวก');

    const originalRaw = draft.originalPrice.trim();
    const originalPrice = originalRaw === '' ? null : Number(originalRaw);
    if (originalPrice !== null && (!Number.isInteger(originalPrice) || originalPrice <= price)) {
      return setError('ราคาเดิมต้องเป็นจำนวนเต็มและมากกว่าราคาโปรโมชั่น');
    }

    if (!/^\d{4}-\d{2}-\d{2}$/.test(draft.validUntil)) return setError('เลือกวันหมดอายุ');

    const body = {
      ...(editing && editing !== 'new' ? { id: editing } : {}),
      name,
      detail: draft.detail.trim() || null,
      price,
      originalPrice,
      note: draft.note.trim() || null,
      validUntil: draft.validUntil,
      categorySlug: draft.categorySlug || null,
    };

    await mutate(
      editing ?? 'new',
      () =>
        fetch('/api/admin/promotions', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      () => close(),
    );
  }

  async function remove(promo: AdminPromotion) {
    if (!window.confirm(`ลบโปรโมชั่นนี้?\n\n${promo.name}`)) return;
    await mutate('del-' + promo.id, () =>
      fetch('/api/admin/promotions', {
        method: 'DELETE',
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

  return (
    <section className="mt-10">
      <SectionHeading
        title="รายการโปรโมชั่น"
        count={`${promotions.length} รายการ`}
        action={
          <button type="button" onClick={openAdd} disabled={busy} className={btn.primary}>
            <Plus className="size-3.5" />
            เพิ่มโปรโมชั่น
          </button>
        }
      />

      {error && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          <TriangleAlert className="size-3.5" /> {error}
        </p>
      )}

      {editing === 'new' && (
        <PromotionForm
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={close}
          busy={busy}
          heading="โปรโมชั่นใหม่"
          categories={categories}
        />
      )}

      <ul className="mt-6 space-y-3">
        {promotions.map((promo, index) => (
          <li key={promo.id}>
            {editing === promo.id ? (
              <PromotionForm
                draft={draft}
                setDraft={setDraft}
                onSave={save}
                onCancel={close}
                busy={busy}
                heading={`แก้ไข: ${promo.name}`}
                categories={categories}
              />
            ) : (
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
              />
            )}
          </li>
        ))}
        {promotions.length === 0 && editing !== 'new' && (
          <li className="rounded-2xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-ink/40">
            ยังไม่มีโปรโมชั่น — กด “เพิ่มโปรโมชั่น” เพื่อเริ่ม
          </li>
        )}
      </ul>
    </section>
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
}) {
  const rowBusy = busyId === 'del-' + promo.id;

  return (
    <div className={cn(card, 'flex flex-col gap-3 p-4', expired && 'opacity-70')}>
      <div className="flex items-start justify-between gap-3">
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
            {promo.price.toLocaleString('th-TH')}{' '}
            <span className="text-xs font-normal text-ink/45">บาท</span>
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

      <div className="flex flex-wrap items-center gap-1.5 border-t border-black/[0.05] pt-3">
        <button type="button" disabled={busy} onClick={onEdit} className={btn.secondary}>
          <Pencil className="size-3.5" />
          แก้ไข
        </button>
        <button type="button" disabled={busy} onClick={onDelete} className={btn.danger}>
          {rowBusy ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
          ลบ
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

function PromotionForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  busy,
  heading,
  categories,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  busy: boolean;
  heading: string;
  categories: CategoryOption[];
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
          <Field label="ชื่อโปรโมชั่น">
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="เช่น Filler Neura Deep"
            />
          </Field>
        </div>
        <Field label="รายละเอียด" hint="เช่น ปริมาณ · ไม่บังคับ">
          <input
            className={inputClass}
            value={draft.detail}
            onChange={(e) => set({ detail: e.target.value })}
            placeholder="เช่น 1 CC"
          />
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
        <Field label="ราคาโปรโมชั่น (บาท)">
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
        <Field label="หมายเหตุ" hint="เช่น เงื่อนไข · ไม่บังคับ">
          <input
            className={inputClass}
            value={draft.note}
            onChange={(e) => set({ note: e.target.value })}
            placeholder="เช่น ซื้อ 1 แถม 1"
          />
        </Field>
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
