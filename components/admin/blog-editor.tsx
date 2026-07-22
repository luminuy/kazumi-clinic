'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  Check,
  ExternalLink,
  ImageOff,
  Loader2,
  Pencil,
  Plus,
  Trash2,
  TriangleAlert,
  Upload,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card, inputClass, SectionHeading } from './ui';

export type AdminPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body: string;
  author: string;
  coverImagePublicId: string | null;
  published: boolean;
  publishedAt: number | null;
};

type Draft = {
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  author: string;
  published: boolean;
};

const emptyDraft: Draft = {
  title: '',
  slug: '',
  excerpt: '',
  body: '',
  author: '',
  published: false,
};

function draftFrom(post: AdminPost): Draft {
  return {
    title: post.title,
    slug: post.slug,
    excerpt: post.excerpt,
    body: post.body,
    author: post.author,
    published: post.published,
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

function formatThaiDate(ms: number | null) {
  if (ms === null) return null;
  return new Date(ms).toLocaleDateString('th-TH', { day: 'numeric', month: 'short', year: 'numeric' });
}

export function BlogEditor({ posts }: { posts: AdminPost[] }) {
  const router = useRouter();
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

  function openEdit(post: AdminPost) {
    setError(null);
    setDraft(draftFrom(post));
    setEditing(post.id);
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
    const title = draft.title.trim();
    if (!title) return setError('ต้องมีหัวข้อบทความ');
    if (!draft.body.trim()) return setError('ต้องมีเนื้อหาบทความ');

    const body = {
      ...(editing && editing !== 'new' ? { id: editing } : {}),
      title,
      slug: draft.slug.trim() || undefined,
      excerpt: draft.excerpt.trim() || null,
      body: draft.body,
      author: draft.author.trim() || null,
      published: draft.published,
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

  return (
    <section className="mt-10">
      <SectionHeading
        title="บทความ"
        count={`${posts.length} รายการ`}
        action={
          <button type="button" onClick={openAdd} disabled={busy} className={btn.primary}>
            <Plus className="size-3.5" />
            เขียนบทความ
          </button>
        }
      />

      {error && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          <TriangleAlert className="size-3.5" /> {error}
        </p>
      )}

      {editing === 'new' && (
        <PostForm draft={draft} setDraft={setDraft} onSave={save} onCancel={close} busy={busy} heading="บทความใหม่" />
      )}

      <ul className="mt-6 space-y-3">
        {posts.map((post) => (
          <li key={post.id}>
            {editing === post.id ? (
              <PostForm
                draft={draft}
                setDraft={setDraft}
                onSave={save}
                onCancel={close}
                busy={busy}
                heading={`แก้ไข: ${post.title}`}
              />
            ) : (
              <PostRow
                post={post}
                busy={busy}
                busyId={busyId}
                onEdit={() => openEdit(post)}
                onDelete={() => remove(post)}
                onUpload={(file) => uploadImage(post, file)}
              />
            )}
          </li>
        ))}
        {posts.length === 0 && editing !== 'new' && (
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
  busy,
  busyId,
  onEdit,
  onDelete,
  onUpload,
}: {
  post: AdminPost;
  busy: boolean;
  busyId: string | null;
  onEdit: () => void;
  onDelete: () => void;
  onUpload: (file: File) => void;
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
          <button type="button" disabled={busy} onClick={onDelete} className={cn(btn.danger, 'ml-auto')}>
            <Trash2 className="size-3.5" />
            ลบ
          </button>
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

function PostForm({
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
        <button type="button" onClick={onCancel} disabled={busy} aria-label="ปิด" className={cn(btn.icon, 'size-8')}>
          <X className="size-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        <Field label="หัวข้อบทความ">
          <input
            className={inputClass}
            value={draft.title}
            onChange={(e) => set({ title: e.target.value })}
            placeholder="เช่น ฟิลเลอร์ใต้ตาดูแลตัวเองอย่างไร"
          />
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
        <Field label="คำโปรย" hint="สรุปสั้น ๆ · แสดงในหน้ารายการและ SEO">
          <textarea
            className={cn(inputClass, 'min-h-16 resize-y')}
            value={draft.excerpt}
            onChange={(e) => set({ excerpt: e.target.value })}
            placeholder="สรุปเนื้อหาบทความใน 1-2 ประโยค"
          />
        </Field>
        <Field
          label="เนื้อหา"
          hint="รองรับ ## หัวข้อ, - รายการ, **ตัวหนา**, [ลิงก์](https://…), > อ้างอิง"
        >
          <textarea
            className={cn(inputClass, 'min-h-64 resize-y font-mono text-[0.8rem] leading-relaxed')}
            value={draft.body}
            onChange={(e) => set({ body: e.target.value })}
            placeholder={'## หัวข้อย่อย\n\nย่อหน้าเนื้อหา...\n\n- ข้อที่หนึ่ง\n- ข้อที่สอง'}
          />
        </Field>
      </div>

      <label className="mt-4 flex items-center gap-2.5 rounded-xl bg-sand/60 p-4 text-sm text-ink/75">
        <input
          type="checkbox"
          checked={draft.published}
          onChange={(e) => set({ published: e.target.checked })}
          className="size-4 shrink-0 accent-forest"
        />
        เผยแพร่บนหน้าเว็บ (ถ้าไม่ติ๊ก จะบันทึกเป็นฉบับร่าง)
      </label>

      <p className="mt-3 text-[0.7rem] text-ink/40">
        เนื้อหาทางการแพทย์ควรผ่านการตรวจโดยแพทย์ก่อนเผยแพร่ (CLAUDE.md §0.2) · อัปรูปปกได้ที่การ์ดบทความหลังบันทึก
      </p>

      <div className="mt-5 flex items-center gap-2">
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
