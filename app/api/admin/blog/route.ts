import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { upsertPost, deletePost, slugTaken, type PostInput } from '@/lib/blog-store';
import { serviceCategories } from '@/lib/services';
import { rateLimit, clientIp } from '@/lib/rate-limit';

const categorySlugs = serviceCategories.map((c) => c.slug) as [string, ...string[]];

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

/** URL-safe slug. Latin text slugifies; Thai-only titles fall back to a timestamp id upstream. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9ก-๙]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
}

const upsertSchema = z.object({
  id: z.string().min(1).max(80).optional(),
  title: z.string().trim().min(1, 'ต้องมีหัวข้อบทความ').max(160),
  // Optional explicit slug; when present it must already be URL-safe.
  slug: z
    .string()
    .trim()
    .max(60)
    .regex(/^[a-z0-9ก-๙-]+$/, 'slug ใช้ได้เฉพาะ a-z 0-9 ไทย และ -')
    .optional(),
  excerpt: z.string().trim().max(300).nullish(),
  body: z.string().trim().min(1, 'ต้องมีเนื้อหาบทความ').max(50_000),
  author: z.string().trim().max(80).nullish(),
  published: z.boolean(),
  // A serviceCategories slug for the /blog filter, or null/absent for uncategorised.
  category: z.enum(categorySlugs).nullish(),
});

const deleteSchema = z.object({ id: z.string().min(1).max(80) });

export async function POST(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (!(await rateLimit('admin-write', clientIp(request), { limit: 60, windowSec: 300 }))) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const parsed = upsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const id = data.id ?? `post-${Date.now().toString(36)}`;
  // Prefer an explicit slug, else derive one from the title; a Thai-only title that slugifies to
  // nothing gets a stable id-based slug so the URL is always valid.
  const slug = data.slug || slugify(data.title) || id;

  if (await slugTaken(slug, id)) {
    return NextResponse.json({ error: 'slug นี้ถูกใช้แล้ว — เปลี่ยนหัวข้อหรือกำหนด slug เอง' }, { status: 409 });
  }

  const input: PostInput = {
    id,
    slug,
    title: data.title,
    excerpt: data.excerpt ?? null,
    body: data.body,
    author: data.author ?? null,
    published: data.published,
    category: data.category ?? null,
  };

  try {
    await upsertPost(input, email);
    // Listing, the post itself, and the sitemap all reflect the change — both locales
    // (Thai at the bare path, English under /en; localePrefix 'as-needed').
    revalidatePath('/blog');
    revalidatePath('/en/blog');
    revalidatePath(`/blog/${slug}`);
    revalidatePath(`/en/blog/${slug}`);
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ ok: true, id, slug });
  } catch (error) {
    if (error instanceof Error && error.message === 'SLUG_TAKEN') {
      return NextResponse.json({ error: 'slug นี้ถูกใช้แล้ว — เปลี่ยนหัวข้อหรือกำหนด slug เอง' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json(
      { error: 'บันทึกไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (!(await rateLimit('admin-write', clientIp(request), { limit: 60, windowSec: 300 }))) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    const slug = await deletePost(parsed.data.id);
    // Same four paths the publish branch refreshes — a delete that only purged the Thai listing
    // left the English listing and the article's own URL serving the post for up to an hour.
    revalidatePath('/blog');
    revalidatePath('/en/blog');
    if (slug) {
      revalidatePath(`/blog/${slug}`);
      revalidatePath(`/en/blog/${slug}`);
    }
    revalidatePath('/sitemap.xml');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'ลบไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
