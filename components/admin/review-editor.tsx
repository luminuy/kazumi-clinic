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
  ShieldCheck,
  Star,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card, inputClass, SectionHeading } from './ui';

export type AdminReview = {
  id: string;
  name: string;
  rating: number | null;
  quote: string;
  procedure: string;
  categorySlug: string;
  beforeImagePublicId: string | null;
  afterImagePublicId: string | null;
  consent: boolean;
  published: boolean;
};

export type CategoryOption = { slug: string; title: string };

type Draft = {
  id: string;
  name: string;
  rating: string;
  quote: string;
  procedure: string;
  categorySlug: string;
  consent: boolean;
  published: boolean;
  beforeImagePublicId: string | null;
  afterImagePublicId: string | null;
};

const emptyDraft: Draft = {
  id: '',
  name: '',
  rating: '',
  quote: '',
  procedure: '',
  categorySlug: '',
  consent: false,
  published: false,
  beforeImagePublicId: null,
  afterImagePublicId: null,
};

function draftFrom(review: AdminReview): Draft {
  return {
    id: review.id,
    name: review.name,
    rating: review.rating === null ? '' : String(review.rating),
    quote: review.quote,
    procedure: review.procedure,
    categorySlug: review.categorySlug,
    consent: review.consent,
    published: review.published,
    beforeImagePublicId: review.beforeImagePublicId,
    afterImagePublicId: review.afterImagePublicId,
  };
}

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

export function ReviewEditor({
  reviews,
  categories,
}: {
  reviews: AdminReview[];
  categories: CategoryOption[];
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<Draft>(emptyDraft);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = busyId !== null;

  function openAdd() {
    setError(null);
    setDraft({ ...emptyDraft, id: `draft-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}` });
    setEditing('new');
  }

  function openEdit(review: AdminReview) {
    setError(null);
    setDraft(draftFrom(review));
    setEditing(review.id);
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
    if (!name) return setError('ต้องมีชื่อผู้รีวิว');
    if (draft.published && !draft.consent) {
      return setError('ต้องยืนยันความยินยอมจากลูกค้าก่อนเผยแพร่');
    }

    const ratingValue = draft.rating.trim();
    const rating = ratingValue === '' ? null : Number(ratingValue);

    const body = {
      ...(editing && editing !== 'new' ? { id: editing } : {}),
      name,
      rating,
      quote: draft.quote.trim() || null,
      procedure: draft.procedure.trim() || null,
      categorySlug: draft.categorySlug || null,
      consent: draft.consent,
      published: draft.published,
      beforeImagePublicId: draft.beforeImagePublicId,
      afterImagePublicId: draft.afterImagePublicId,
    };

    await mutate(
      editing ?? 'new',
      () =>
        fetch('/api/admin/reviews', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      () => close(),
    );
  }

  async function remove(review: AdminReview) {
    if (!window.confirm(`ลบรีวิวนี้?\n\n${review.name}`)) return;
    await mutate('del-' + review.id, () =>
      fetch('/api/admin/reviews', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: review.id }),
      }),
    );
  }

  async function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= reviews.length) return;
    const orderedIds = reviews.map((r) => r.id);
    [orderedIds[index], orderedIds[next]] = [orderedIds[next], orderedIds[index]];
    await mutate('order', () =>
      fetch('/api/admin/reviews', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      }),
    );
  }

  async function uploadImage(id: string, which: 'before' | 'after', file: File): Promise<string | undefined> {
    const form = new FormData();
    form.append('id', id);
    form.append('which', which);
    form.append('file', file);
    let publicId: string | undefined;
    await mutate('img-' + which + '-' + id, async () => {
      const res = await fetch('/api/admin/reviews/image', { method: 'POST', body: form });
      if (res.ok) {
        const data = await res.json();
        publicId = data.publicId;
      }
      return res;
    });
    return publicId;
  }

  return (
    <section className="mt-10">
      <SectionHeading
        title="รายการรีวิว"
        count={`${reviews.length} รายการ`}
        action={
          <button type="button" onClick={openAdd} disabled={busy} className={btn.primary}>
            <Plus className="size-3.5" />
            เพิ่มรีวิว
          </button>
        }
      />

      <p className="mt-3 inline-flex items-start gap-1.5 rounded-xl bg-forest/[0.06] px-3 py-2 text-xs leading-relaxed text-ink/60">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0 text-forest" />
        เผยแพร่รีวิวและภาพก่อน-หลังได้เฉพาะเมื่อได้รับความยินยอมจากลูกค้าจริงแล้วเท่านั้น (พ.ร.บ.สถานพยาบาล
        / ประกาศโฆษณา อย.)
      </p>

      {error && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          <TriangleAlert className="size-3.5" /> {error}
        </p>
      )}

      {editing === 'new' && (
        <ReviewForm
          draft={draft}
          setDraft={setDraft}
          onSave={save}
          onCancel={close}
          onUploadImage={async (which, file) => {
            const publicId = await uploadImage(draft.id, which, file);
            if (publicId) {
              setDraft((d) => ({
                ...d,
                ...(which === 'before' ? { beforeImagePublicId: publicId } : { afterImagePublicId: publicId }),
              }));
            }
          }}
          busy={busy}
          busyId={busyId}
          heading="รีวิวใหม่"
          categories={categories}
        />
      )}

      <ul className="mt-6 space-y-3">
        {reviews.map((review, index) => (
          <li key={review.id}>
            {editing === review.id ? (
              <ReviewForm
                draft={draft}
                setDraft={setDraft}
                onSave={save}
                onCancel={close}
                onUploadImage={async (which, file) => {
                  const publicId = await uploadImage(draft.id, which, file);
                  if (publicId) {
                    setDraft((d) => ({
                      ...d,
                      ...(which === 'before' ? { beforeImagePublicId: publicId } : { afterImagePublicId: publicId }),
                    }));
                  }
                }}
                busy={busy}
                busyId={busyId}
                heading={`แก้ไข: ${review.name}`}
                categories={categories}
              />
            ) : (
              <ReviewRow
                review={review}
                first={index === 0}
                last={index === reviews.length - 1}
                busy={busy}
                busyId={busyId}
                onEdit={() => openEdit(review)}
                onDelete={() => remove(review)}
                onMoveUp={() => move(index, -1)}
                onMoveDown={() => move(index, 1)}
              />
            )}
          </li>
        ))}
        {reviews.length === 0 && editing !== 'new' && (
          <li className="rounded-2xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-ink/40">
            ยังไม่มีรีวิว — กด “เพิ่มรีวิว” เพื่อเริ่ม
          </li>
        )}
      </ul>
    </section>
  );
}

function BeforeAfter({
  label,
  publicId,
  busy,
  loading,
  onUpload,
}: {
  label: string;
  publicId: string | null;
  busy: boolean;
  loading: boolean;
  onUpload?: (file: File) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const isUploadable = !!onUpload;
  return (
    <div className="flex flex-1 flex-col gap-1.5">
      <span className="text-[0.62rem] font-medium uppercase tracking-wide text-ink/40">{label}</span>
      <button
        type="button"
        disabled={busy || !isUploadable}
        onClick={() => {
          if (isUploadable) inputRef.current?.click();
        }}
        className={cn(
          'relative aspect-[3/4] w-full overflow-hidden rounded-xl bg-sand ring-1 ring-black/[0.06]',
          isUploadable && 'transition-opacity hover:opacity-90 disabled:opacity-60',
        )}
      >
        {publicId ? (
          <Image
            key={publicId}
            src={publicId}
            alt=""
            aria-hidden="true"
            fill
            sizes="120px"
            className={cn('object-cover', loading && 'opacity-40')}
          />
        ) : (
          <span className="absolute inset-0 grid place-items-center gap-1 text-center">
            <ImageOff className="size-4 text-ink/25" aria-hidden="true" />
            <span className="text-[0.58rem] text-ink/35">{isUploadable ? 'แตะเพื่ออัปรูป' : 'ไม่มีรูป'}</span>
          </span>
        )}
        {loading && (
          <span className="absolute inset-0 grid place-items-center bg-cream/40">
            <Loader2 className="size-4 animate-spin text-forest" />
          </span>
        )}
        {isUploadable && (
          <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-ink/60 py-1 text-[0.58rem] text-white">
            <Upload className="size-3" />
            {publicId ? 'เปลี่ยน' : 'อัปรูป'}
          </span>
        )}
      </button>
      {isUploadable && (
        <input
          ref={inputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/avif"
          className="sr-only"
          aria-label={`อัปรูป${label}`}
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) onUpload(file);
            event.target.value = '';
          }}
        />
      )}
    </div>
  );
}

function ReviewRow({
  review,
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
  review: AdminReview;
  first: boolean;
  last: boolean;
  busy: boolean;
  busyId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const live = review.published && review.consent;

  return (
    <div className={cn(card, 'flex flex-col gap-4 p-4 sm:flex-row')}>
      <div className="flex shrink-0 gap-2 sm:w-64">
        <BeforeAfter
          label="ก่อน"
          publicId={review.beforeImagePublicId}
          busy={false}
          loading={false}
        />
        <BeforeAfter
          label="หลัง"
          publicId={review.afterImagePublicId}
          busy={false}
          loading={false}
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <h4 className="truncate font-serif text-lg leading-tight text-ink">{review.name}</h4>
            {(review.procedure || review.rating !== null) && (
              <div className="mt-1 flex items-center gap-2">
                {review.rating !== null && (
                  <span className="flex items-center gap-0.5 text-forest">
                    {Array.from({ length: review.rating }).map((_, i) => (
                      <Star key={i} className="size-3.5 fill-current" />
                    ))}
                  </span>
                )}
                {review.procedure && <span className="text-xs text-ink/50">{review.procedure}</span>}
              </div>
            )}
          </div>
          <div className="flex shrink-0 flex-col items-end gap-1">
            <span
              className={cn(
                'rounded-full px-2 py-0.5 text-[0.62rem] font-medium',
                live ? 'bg-forest/10 text-forest' : 'bg-black/[0.05] text-ink/45',
              )}
            >
              {live ? 'เผยแพร่' : 'ฉบับร่าง'}
            </span>
            <span
              className={cn(
                'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6rem] font-medium',
                review.consent ? 'bg-forest/[0.08] text-forest' : 'bg-amber-50 text-amber-700',
              )}
            >
              <ShieldCheck className="size-3" />
              {review.consent ? 'มีความยินยอม' : 'ยังไม่ยืนยัน'}
            </span>
          </div>
        </div>

        {review.quote && (
          <p className="mt-2 line-clamp-3 text-sm leading-relaxed text-ink/65">“{review.quote}”</p>
        )}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          <button type="button" disabled={busy} onClick={onEdit} className={btn.secondary}>
            <Pencil className="size-3.5" />
            แก้ไข
          </button>
          <button type="button" disabled={busy} onClick={onDelete} className={btn.danger}>
            {busyId === 'del-' + review.id ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <Trash2 className="size-3.5" />
            )}
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

function ReviewForm({
  draft,
  setDraft,
  onSave,
  onCancel,
  onUploadImage,
  busy,
  busyId,
  heading,
  categories,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  onSave: () => void;
  onCancel: () => void;
  onUploadImage: (which: 'before' | 'after', file: File) => void;
  busy: boolean;
  busyId: string | null;
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

      <div className="mt-4 flex flex-col gap-6 sm:flex-row">
        <div className="flex shrink-0 gap-2 sm:w-64">
          <BeforeAfter
            label="ก่อน"
            publicId={draft.beforeImagePublicId}
            busy={busy}
            loading={busyId === 'img-before-' + draft.id}
            onUpload={(file) => onUploadImage('before', file)}
          />
          <BeforeAfter
            label="หลัง"
            publicId={draft.afterImagePublicId}
            busy={busy}
            loading={busyId === 'img-after-' + draft.id}
            onUpload={(file) => onUploadImage('after', file)}
          />
        </div>

        <div className="grid flex-1 content-start gap-4 sm:grid-cols-2">
          <Field label="ชื่อผู้รีวิว" hint="เช่น คุณ A">
            <input
              className={inputClass}
              value={draft.name}
              onChange={(e) => set({ name: e.target.value })}
              placeholder="เช่น คุณเอ"
            />
          </Field>
          <Field label="คะแนน" hint="ไม่บังคับ">
            <select
              className={inputClass}
              value={draft.rating}
              onChange={(e) => set({ rating: e.target.value })}
            >
              <option value="">— ไม่ระบุ —</option>
              {[5, 4, 3, 2, 1].map((n) => (
                <option key={n} value={n}>
                  {n} ดาว
                </option>
              ))}
            </select>
          </Field>
          <Field label="หัตถการ" hint="ไม่บังคับ">
            <input
              className={inputClass}
              value={draft.procedure}
              onChange={(e) => set({ procedure: e.target.value })}
              placeholder="เช่น ฟิลเลอร์ใต้ตา"
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
          <div className="sm:col-span-2">
            <Field label="ข้อความรีวิว" hint="ไม่บังคับ">
              <textarea
                className={cn(inputClass, 'min-h-24 resize-y')}
                value={draft.quote}
                onChange={(e) => set({ quote: e.target.value })}
                placeholder="คำรีวิวจากลูกค้า"
              />
            </Field>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5 rounded-xl bg-sand/60 p-4">
        <label className="flex items-start gap-2.5 text-sm text-ink/75">
          <input
            type="checkbox"
            checked={draft.consent}
            onChange={(e) => set({ consent: e.target.checked, published: e.target.checked ? draft.published : false })}
            className="mt-0.5 size-4 shrink-0 accent-forest"
          />
          <span>
            ยืนยันว่าได้รับความยินยอมจากลูกค้าให้เผยแพร่ข้อความและภาพก่อน-หลังนี้แล้ว
            <span className="mt-0.5 block text-[0.7rem] text-ink/45">
              จำเป็นก่อนเผยแพร่ · ภาพก่อน-หลังจะไม่แสดงบนเว็บหากไม่ติ๊กช่องนี้
            </span>
          </span>
        </label>
        <label className="flex items-start gap-2.5 text-sm text-ink/75">
          <input
            type="checkbox"
            checked={draft.published}
            disabled={!draft.consent}
            onChange={(e) => set({ published: e.target.checked })}
            className="mt-0.5 size-4 shrink-0 accent-forest disabled:opacity-40"
          />
          <span className={cn(!draft.consent && 'text-ink/40')}>
            เผยแพร่บนหน้าเว็บ
            {!draft.consent && (
              <span className="mt-0.5 block text-[0.7rem] text-ink/40">ต้องยืนยันความยินยอมก่อน</span>
            )}
          </span>
        </label>
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
