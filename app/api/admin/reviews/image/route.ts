import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { setReviewImage } from '@/lib/reviews-store';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const schema = z.object({
  id: z.string().min(1).max(80),
  which: z.enum(['before', 'after']),
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
    which: form.get('which'),
    file: form.get('file'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { id, which, file } = parsed.data;
  try {
    // Same versioned-id scheme as the other uploads: unsigned uploads can't overwrite, so each save
    // is a new Cloudinary object and D1 records which one is live.
    const upload = await uploadToCloudinary(file, `review-${id}-${which}-${Date.now()}`);
    await setReviewImage(id, which, upload.publicId, email);
    revalidatePath('/reviews');
    revalidatePath('/en/reviews');
    return NextResponse.json({ ok: true, ...upload });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
