import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { siteImageKeys, type SiteImageKey } from '@/lib/site-images';
import { setImage, resetImage } from '@/lib/site-images-store';
import { uploadToCloudinary } from '@/lib/cloudinary-upload';

// middleware.ts already rejected anything without a verified Access JWT, but the identity is
// read here rather than assumed — if the matcher ever stops covering this path, this throws a
// 401 instead of silently letting an anonymous request write to the clinic's website.
function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const MAX_BYTES = 10 * 1024 * 1024;
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

const uploadSchema = z.object({
  key: z.enum(siteImageKeys as [SiteImageKey, ...SiteImageKey[]]),
  file: z
    .instanceof(File)
    .refine((f) => f.size > 0, 'ไฟล์ว่าง')
    .refine((f) => f.size <= MAX_BYTES, 'ไฟล์ใหญ่เกิน 10MB')
    .refine((f) => ALLOWED.includes(f.type), 'รองรับเฉพาะ JPG / PNG / WebP / AVIF'),
});

const resetSchema = z.object({ key: z.enum(siteImageKeys as [SiteImageKey, ...SiteImageKey[]]) });

/** Pages that render a given slot, so a save refreshes exactly what changed and nothing else. */
function pathsFor(key: SiteImageKey): string[] {
  // The brand mark is in the header and footer of every page; the full logo only feeds JSON-LD.
  if (key === 'brand-mark')
    return ['/', '/about', '/services', '/promotions', '/reviews', '/contact'];
  if (key === 'brand-logo') return ['/'];
  if (key === 'hero-home' || key === 'hero-iv-drip-2') return ['/'];
  if (key === 'doctor-pratch') return ['/', '/about'];
  if (key === 'og-about') return ['/about'];
  if (key.startsWith('promo-')) return ['/', '/promotions'];
  if (key === 'hero-filler') return ['/', '/filler'];
  if (key === 'hero-iv-drip-1') return ['/', '/iv-drip'];
  if (key === 'hero-skin-booster') return ['/', '/skin-booster'];
  return ['/'];
}

export async function POST(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const form = await request.formData();
  const parsed = uploadSchema.safeParse({ key: form.get('key'), file: form.get('file') });
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const { key, file } = parsed.data;
  try {
    // Unsigned uploads can't overwrite, so the ID carries a timestamp and D1 decides which one
    // is live. Old versions stay in Cloudinary — cheap, and it means a bad upload is undoable.
    const upload = await uploadToCloudinary(file, `${key}-${Date.now()}`);
    await setImage(key, upload.publicId, email);
    for (const path of pathsFor(key)) revalidatePath(path);
    return NextResponse.json({ ok: true, ...upload });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'อัปโหลดไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = resetSchema.safeParse(await request.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: 'key ไม่ถูกต้อง' }, { status: 400 });

  try {
    await resetImage(parsed.data.key);
    for (const path of pathsFor(parsed.data.key)) revalidatePath(path);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'คืนค่าเริ่มต้นไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
