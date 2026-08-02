'use client';

import { useRef } from 'react';
import Image from 'next/image';
import {
  ExternalLink,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  Upload,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card, inputClass, SectionHeading, Field, EnglishFallbackNote } from './ui';
import { useEntityEditor } from './use-entity-editor';
import { EditorDrawer } from './editor-drawer';
import { ReorderButtons } from './reorder-buttons';

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  titleEn: string;
  excerpt: string;
  excerptEn: string;
  body: string;
  bodyEn: string;
  author: string;
  coverImagePublicId: string | null;
  published: boolean;
  publishedAt: number | null;
  category: string | null;
};

/** Options for the category select — the site's service categories. */
export type CategoryOption = { slug: string; title: string };

type Draft = {
  title: string;
  titleEn: string;
  slug: string;
  excerpt: string;
  excerptEn: string;
  body: string;
  bodyEn: string;
  author: string;
  published: boolean;
  category: string;
};

const emptyDraft: Draft = {
  title: '',
  titleEn: '',
  slug: '',
  excerpt: '',
  excerptEn: '',
  body: '',
  bodyEn: '',
  author: '',
  published: false,
  category: '',
};

function draftFrom(post: AdminPost): Draft {
  return {
    title: post.title,
    titleEn: post.titleEn,
    slug: post.slug,
    excerpt: post.excerpt,
    excerptEn: post.excerptEn,
    body: post.body,
    bodyEn: post.bodyEn,
    author: post.author,
    published: post.published,
    category: post.category ?? '',
  };
}

function formatThaiDate(ms: number | null) {
  if (ms === null) return null;
  return new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BlogEditor({
  posts,
  categories,
}: {
  posts: AdminPost[];
  categories: CategoryOption[];
}) {
  const { editing, draft, setDraft, busyId, busy, error, setError, openAdd, openEdit, close, mutate } =
    useEntityEditor<AdminPost, Draft>({ emptyDraft, draftFrom });

  async function save() {
    const title = draft.title.trim();
    if (!title) return setError('ต้องมีหัวข้อบทความ');
    if (!draft.body.trim()) return setError('ต้องมีเนื้อหาบทความ');

    const body = {
      ...(editing && editing !== 'new' ? { id: editing } : {}),
      title,
      titleEn: draft.titleEn.trim() || null,
      slug: draft.slug.trim() || undefined,
      excerpt: draft.excerpt.trim() || null,
      excerptEn: draft.excerptEn.trim() || null,
      body: draft.body,
      bodyEn: draft.bodyEn.trim() || null,
      author: draft.author.trim() || null,
      published: draft.published,
      category: draft.category || null,
    };

    await mutate(
      editing ?? 'new',
      () =>
        fetch('/api/admin/blog', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(body),
        }),
      () => close(),
    );
  }

  async function remove(post: AdminPost) {
    if (!window.confirm(`ลบบทความนี้?\n\n${post.title}`)) return;
    await mutate('del-' + post.id, () =>
      fetch('/api/admin/blog', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: post.id }),
      }),
    );
  }

  async function uploadImage(post: AdminPost, file: File) {
    const form = new FormData();
    form.append('id', post.id);
    form.append('slug', post.slug);
    form.append('file', file);
    await mutate('img-' + post.id, () =>
      fetch('/api/admin/blog/image', { method: 'POST', body: form }),
    );
  }

  async function move(index: number, direction: -1 | 1) {
    const next = index + direction;
    if (next < 0 || next >= posts.length) return;
    const orderedIds = posts.map((p) => p.id);
    [orderedIds[index], orderedIds[next]] = [orderedIds[next], orderedIds[index]];
    await mutate('order', () =>
      fetch('/api/admin/blog', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ orderedIds }),
      }),
    );
  }

  const heading =
    editing === 'new'
      ? 'บทความใหม่'
      : editing
        ? `แก้ไข: ${posts.find((p) => p.id === editing)?.title ?? ''}`
        : '';

  return (
    <section className="mt-10">
      <SectionHeading
        title="บทความ"
        count={`${posts.length} รายการ`}
        action={
          <button type="button" onClick={() => openAdd()} disabled={busy} className={btn.primary}>
            <Plus className="size-3.5" />
            เขียนบทความ
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
        <PostForm draft={draft} setDraft={setDraft} categories={categories} isNew={editing === 'new'} />
      </EditorDrawer>

      <ul className="mt-6 space-y-3">
        {posts.map((post, index) => (
          <li key={post.id}>
            <PostRow
              post={post}
              first={index === 0}
              last={index === posts.length - 1}
              busy={busy}
              busyId={busyId}
              onEdit={() => openEdit(post)}
              onDelete={() => remove(post)}
              onUpload={(file) => uploadImage(post, file)}
              onMoveUp={() => move(index, -1)}
              onMoveDown={() => move(index, 1)}
            />
          </li>
        ))}
        {posts.length === 0 && (
          <li className="rounded-2xl border border-dashed border-black/10 px-4 py-10 text-center text-sm text-ink/40">
            ยังไม่มีบทความ — กด “เขียนบทความ” เพื่อเริ่ม
          </li>
        )}
      </ul>
    </section>
  );
}

function PostRow({
  post,
  first,
  last,
  busy,
  busyId,
  onEdit,
  onDelete,
  onUpload,
  onMoveUp,
  onMoveDown,
}: {
  post: AdminPost;
  first: boolean;
  last: boolean;
  busy: boolean;
  busyId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: (file: File) => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const rowBusy = busyId === 'img-' + post.id || busyId === 'del-' + post.id;
  const date = formatThaiDate(post.publishedAt);

  return (
    <div className={cn(card, 'flex gap-4 p-4')}>
      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-sand ring-1 ring-black/[0.05]">
        {post.coverImagePublicId ? (
          <Image
            key={post.coverImagePublicId}
            src={post.coverImagePublicId}
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
            <h4 className="truncate font-serif text-lg leading-tight text-ink">{post.title}</h4>
            <p className="mt-0.5 truncate text-xs text-ink/45">
              /blog/{post.slug}
              {date && ` · ${date}`}
            </p>
          </div>
          <span
            className={cn(
              'shrink-0 rounded-full px-2 py-0.5 text-[0.62rem] font-medium',
              post.published ? 'bg-forest/10 text-forest' : 'bg-black/[0.05] text-ink/45',
            )}
          >
            {post.published ? 'เผยแพร่' : 'ฉบับร่าง'}
          </span>
        </div>

        {post.excerpt && <p className="mt-1 line-clamp-2 text-xs text-ink/55">{post.excerpt}</p>}

        <div className="mt-auto flex flex-wrap items-center gap-1.5 pt-3">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="sr-only"
            aria-label={`อัปรูปปกสำหรับ ${post.title}`}
            onChange={(event) => {
              const file = event.target.files?.[0];
              if (file) onUpload(file);
              event.target.value = '';
            }}
          />
          <button type="button" disabled={busy} onClick={() => inputRef.current?.click()} className={btn.secondary}>
            <Upload className="size-3.5" />
            {post.coverImagePublicId ? 'เปลี่ยนรูปปก' : 'อัปรูปปก'}
          </button>
          <button type="button" disabled={busy} onClick={onEdit} className={btn.secondary}>
            <Pencil className="size-3.5" />
            แก้ไข
          </button>
          {post.published && (
            <a
              href={`/blog/${post.slug}`}
              target="_blank"
              rel="noopener"
              className={btn.secondary}
            >
              <ExternalLink className="size-3.5" />
              ดู
            </a>
          )}
          <button type="button" disabled={busy} onClick={onDelete} className={btn.danger}>
            {busyId === 'del-' + post.id ? <Loader2 className="size-3.5 animate-spin" /> : <Trash2 className="size-3.5" />}
            ลบ
          </button>
          <span className="ml-auto">
            <ReorderButtons disabled={busy} first={first} last={last} onMoveUp={onMoveUp} onMoveDown={onMoveDown} />
          </span>
        </div>
      </div>
    </div>
  );
}

function PostForm({
  draft,
  setDraft,
  categories,
  isNew,
}: {
  draft: Draft;
  setDraft: (draft: Draft) => void;
  categories: CategoryOption[];
  isNew: boolean;
}) {
  const set = (patch: Partial<Draft>) => setDraft({ ...draft, ...patch });

  return (
    <div className="flex flex-col gap-4">
      <Field label="หัวข้อบทความ (ไทย)">
        <input
          className={inputClass}
          value={draft.title}
          onChange={(e) => set({ title: e.target.value })}
          placeholder="เช่น ฟิลเลอร์ใต้ตาดูแลตัวเองอย่างไร"
        />
      </Field>
      <Field label="หัวข้อบทความ (อังกฤษ)">
        <input
          className={inputClass}
          value={draft.titleEn}
          onChange={(e) => set({ titleEn: e.target.value })}
          placeholder="เช่น How to care for under-eye filler"
        />
        <EnglishFallbackNote />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="slug (URL)" hint="เว้นว่าง = สร้างจากหัวข้อ">
          <input
            className={inputClass}
            value={draft.slug}
            onChange={(e) => set({ slug: e.target.value })}
            placeholder="filler-under-eye-aftercare"
          />
        </Field>
        <Field label="ผู้เขียน" hint="ไม่บังคับ">
          <input
            className={inputClass}
            value={draft.author}
            onChange={(e) => set({ author: e.target.value })}
            placeholder="เช่น พญ. ..."
          />
        </Field>
      </div>
      <Field label="หมวดหมู่" hint="ใช้เป็นตัวกรองในหน้า /blog · เว้นว่างได้">
        <select
          className={inputClass}
          value={draft.category}
          onChange={(e) => set({ category: e.target.value })}
        >
          <option value="">ไม่ระบุหมวด</option>
          {categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.title}
            </option>
          ))}
        </select>
      </Field>
      <Field label="คำโปรย (ไทย)" hint="สรุปสั้น ๆ · แสดงในหน้ารายการและ SEO">
        <textarea
          className={cn(inputClass, 'min-h-16 resize-y')}
          value={draft.excerpt}
          onChange={(e) => set({ excerpt: e.target.value })}
          placeholder="สรุปเนื้อหาบทความใน 1-2 ประโยค"
        />
      </Field>
      <Field label="คำโปรย (อังกฤษ)">
        <textarea
          className={cn(inputClass, 'min-h-16 resize-y')}
          value={draft.excerptEn}
          onChange={(e) => set({ excerptEn: e.target.value })}
          placeholder="สรุปเนื้อหาบทความภาษาอังกฤษใน 1-2 ประโยค"
        />
        <EnglishFallbackNote />
      </Field>
      <Field
        label="เนื้อหา (ไทย)"
        hint="รองรับ ## หัวข้อ, - รายการ, **ตัวหนา**, [ลิงก์](https://…), > อ้างอิง"
      >
        <textarea
          className={cn(inputClass, 'min-h-64 resize-y font-mono text-[0.8rem] leading-relaxed')}
          value={draft.body}
          onChange={(e) => set({ body: e.target.value })}
          placeholder={'## หัวข้อย่อย\n\nย่อหน้าเนื้อหา...\n\n- ข้อที่หนึ่ง\n- ข้อที่สอง'}
        />
      </Field>
      <Field
        label="เนื้อหา (อังกฤษ)"
        hint="รองรับรูปแบบเดียวกับเนื้อหาภาษาไทย"
      >
        <textarea
          className={cn(inputClass, 'min-h-64 resize-y font-mono text-[0.8rem] leading-relaxed')}
          value={draft.bodyEn}
          onChange={(e) => set({ bodyEn: e.target.value })}
          placeholder={'## English heading\n\nArticle content...\n\n- First item\n- Second item'}
        />
        <EnglishFallbackNote />
      </Field>

      <label className="flex items-center gap-2.5 rounded-xl bg-sand/60 p-4 text-sm text-ink/75">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(e) => set({ published: e.target.checked })}
          className="size-4 shrink-0 accent-forest"
        />
        เผยแพร่บนหน้าเว็บ (ถ้าไม่ติ๊ก จะบันทึกเป็นฉบับร่าง)
      </label>

      <p className="text-[0.7rem] text-ink/40">
        เนื้อหาทางการแพทย์ควรผ่านการตรวจโดยแพทย์ก่อนเผยแพร่ (CLAUDE.md §0.2)
        {isNew && ' · อัปรูปปกได้ที่การ์ดบทความหลังบันทึก'}
      </p>
    </div>
  );
}
