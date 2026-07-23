import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { setPromotionImage } from '@/lib/promotions-store';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const schema = z.object({
  id: z.string().min(1).max(80),
  file: z
    .custom<File>((f) => f && typeof (f as File).size === 'number' && typeof (f as File).name === 'string', 'กรุณาอัปโหลดไฟล์')
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
    file: form.get('file'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { id, file } = parsed.data;
  try {
    const upload = await uploadToCloudinary(file, `promo-${id}-${Date.now()}`);
    await setPromotionImage(id, upload.publicId, email);
    // Thai (default) lives at /promotions, English at /en/promotions (localePrefix 'as-needed').
    // Revalidate both so the new poster shows immediately regardless of language.
    revalidatePath('/promotions');
    revalidatePath('/en/promotions');
    return NextResponse.json({ ok: true, ...upload });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
