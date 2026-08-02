import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import {
  addEntityImage,
  removeEntityImage,
  reorderEntityImages,
  type EntityType,
} from '@/lib/entity-images-store';

/**
 * One shared endpoint for the products/promotions/blog "additional photos" gallery — see
 * migrations/0019_entity_images.sql. Parameterized by `entityType`/`entityId` rather than three
 * near-identical routes.
 */

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const ENTITY_TYPES = ['product', 'promotion', 'post'] as const;
const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const uploadSchema = z.object({
  entityType: z.enum(ENTITY_TYPES),
  entityId: z.string().min(1).max(80),
  file: z
    .custom<File>((f) => f && typeof (f as File).size === 'number' && typeof (f as File).name === 'string', 'กรุณาอัปโหลดไฟล์')
    .refine((f) => f.size > 0, 'ไฟล์ว่าง')
    .refine((f) => f.size <= MAX_BYTES, 'ไฟล์ใหญ่เกิน 10MB')
    .refine((f) => ALLOWED_MIME.includes(f.type), 'รองรับเฉพาะ JPG / PNG / WebP / AVIF'),
});

const removeSchema = z.object({ id: z.string().min(1).max(80) });

const reorderSchema = z.object({
  entityType: z.enum(ENTITY_TYPES),
  entityId: z.string().min(1).max(80),
  orderedIds: z.array(z.string().min(1).max(80)).min(1).max(20),
});

/** Uploads one photo and appends it to the entity's gallery (max MAX_IMAGES_PER_ENTITY). */
export async function POST(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (!(await rateLimit('admin-upload', clientIp(request), { limit: 20, windowSec: 300 }))) {
    return NextResponse.json({ error: 'อัปโหลดบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const form = await request.formData();
  const parsed = uploadSchema.safeParse({
    entityType: form.get('entityType'),
    entityId: form.get('entityId'),
    file: form.get('file'),
  });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { entityType, entityId, file } = parsed.data;
  try {
    const upload = await uploadToCloudinary(file, `gallery-${entityType}-${entityId}-${Date.now()}`);
    const row = await addEntityImage(entityType as EntityType, entityId, upload.publicId);
    return NextResponse.json({ ok: true, id: row.id, publicId: row.public_id });
  } catch (error) {
    if (error instanceof Error && error.message === 'GALLERY_FULL') {
      return NextResponse.json(
        { error: 'รูปเต็มแล้ว — ลบรูปเก่าก่อนเพิ่มรูปใหม่' },
        { status: 409 },
      );
    }
    console.error(error);
    return NextResponse.json({ error: 'อัปโหลดไม่สำเร็จ' }, { status: 502 });
  }
}

/** Removes one photo from a gallery. */
export async function DELETE(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (!(await rateLimit('admin-write', clientIp(request), { limit: 60, windowSec: 300 }))) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const parsed = removeSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    await removeEntityImage(parsed.data.id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ลบรูปไม่สำเร็จ' }, { status: 502 });
  }
}

/** Persists a new photo order within one entity's gallery. */
export async function PATCH(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (!(await rateLimit('admin-write', clientIp(request), { limit: 60, windowSec: 300 }))) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const parsed = reorderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    await reorderEntityImages(parsed.data.entityType, parsed.data.entityId, parsed.data.orderedIds);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'จัดลำดับไม่สำเร็จ' }, { status: 502 });
  }
}
