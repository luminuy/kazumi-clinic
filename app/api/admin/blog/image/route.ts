import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { setPostImage } from '@/lib/blog-store';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const schema = z.object({
  id: z.string().min(1).max(80),
  slug: z.string().trim().max(60).optional(),
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, 'ไฟล์ว่าง')
    .refine((f) => f.size <= MAX_BYTES, 'ไฟล์ใหญ่เกิน 10MB')
    .refine((f) => ALLOWED.includes(f.type), 'รองรับเฉพาะ JPG / PNG / WebP / AVIF'),
});

export async function POST(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const form = await request.formData();
  const parsed = schema.safeParse({
    id: form.get('id'),
    slug: form.get('slug') ?? undefined,
    file: form.get('file'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { id, slug, file } = parsed.data;
  try {
    const upload = await uploadToCloudinary(file, `post-${id}-${Date.now()}`);
    await setPostImage(id, upload.publicId, email);
    revalidatePath('/blog');
    if (slug) revalidatePath(`/blog/${slug}`);
    return NextResponse.json({ ok: true, ...upload });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
