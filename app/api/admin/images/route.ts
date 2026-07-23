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
    .custom<File>((f) => f && typeof (f as File).size === 'number' && typeof (f as File).name === 'string', 'กรุณาอัปโหลดไฟล์')
    .refine((f) => f.size > 0, 'ไฟล์ว่าง')
    .refine((f) => f.size <= MAX_BYTES, 'ไฟล์ใหญ่เกิน 10MB')
    .refine((f) => ALLOWED.includes(f.type), 'รองรับเฉพาะ JPG / PNG / WebP / AVIF'),
});

const resetSchema = z.object({ key: z.enum(siteImageKeys as [SiteImageKey, ...SiteImageKey[]]) });

type RevalidationTarget = { path: string; type?: 'layout' | 'page' };

/**
 * Every route that consumes each slot. The `Record` annotation deliberately makes this exhaustive:
 * adding an admin image without defining its invalidation targets is now a type error instead of
 * a stale production page waiting for somebody to notice it.
 */
const REVALIDATION_TARGETS: Record<SiteImageKey, readonly RevalidationTarget[]> = {
  'brand-mark': [{ path: '/', type: 'layout' }],
  'brand-logo': [{ path: '/', type: 'layout' }],
  'hero-home': [{ path: '/', type: 'layout' }],
  'hero-filler': [{ path: '/' }, { path: '/filler' }, { path: '/services' }],
  // The home service stream and the /services index both resolve their card images through
  // categoryImageKey, so every category slot has to revalidate those two alongside its own page.
  'hero-botox': [{ path: '/' }, { path: '/botox' }, { path: '/services' }],
  'hero-iv-drip-1': [{ path: '/' }, { path: '/iv-drip' }, { path: '/reviews' }],
  // Also the OG/Twitter image for /blog (siteSocialImage('hero-iv-drip-2')) — revalidate it too so
  // an edit refreshes the blog share card, not only the /services hero it renders inline.
  'hero-iv-drip-2': [{ path: '/' }, { path: '/services' }, { path: '/blog' }],
  'hero-iv-drip-3': [],
  'hero-skin-booster': [
    { path: '/' },
    { path: '/skin-booster' },
    { path: '/services' },
    { path: '/promotions' },
  ],
  'hero-collagen-booster': [{ path: '/' }, { path: '/collagen-booster' }, { path: '/services' }],
  'hero-thread-lift': [{ path: '/' }, { path: '/thread-lift' }, { path: '/services' }],
  'hero-mesotherapy': [{ path: '/' }, { path: '/mesotherapy' }, { path: '/services' }],
  'hero-acne-care': [{ path: '/' }, { path: '/acne-care' }, { path: '/services' }],
  'hero-laser-hifu': [{ path: '/' }, { path: '/laser-hifu' }, { path: '/services' }],
  'thread-lift-product': [{ path: '/thread-lift' }],
  'mesotherapy-treatment': [{ path: '/mesotherapy' }],
  'iv-drip-booking': [{ path: '/iv-drip' }],
  'laser-hifu-editorial': [{ path: '/laser-hifu' }],
  'laser-hifu-interior': [{ path: '/laser-hifu' }],
  'acne-care-interstitial': [{ path: '/acne-care' }],
  'skin-booster-discipline': [{ path: '/skin-booster' }],
  'collagen-booster-editorial': [{ path: '/collagen-booster' }],
  'doctor-pratch': [{ path: '/' }, { path: '/about' }, { path: '/services' }],
  'doctor-eesha': [{ path: '/' }, { path: '/about' }],
  'about-hero': [{ path: '/about' }],
  'about-interior': [{ path: '/about' }],
  'og-about': [{ path: '/about' }],
  'home-visit': [{ path: '/' }],
  'promo-active-refresh': [{ path: '/' }, { path: '/promotions' }, { path: '/services' }],
  'promo-filler-neura': [{ path: '/' }, { path: '/promotions' }, { path: '/services' }],
  'promo-karisma-collagen': [{ path: '/' }, { path: '/promotions' }, { path: '/services' }],
  'promo-oxelle-skin-booster': [{ path: '/' }, { path: '/promotions' }, { path: '/services' }],
  'promo-radiant-bright': [{ path: '/' }, { path: '/promotions' }, { path: '/services' }],
  'promo-signature-flawless': [{ path: '/' }, { path: '/promotions' }, { path: '/services' }],
  'promo-velvet-glow': [{ path: '/' }, { path: '/promotions' }, { path: '/services' }],
  'hero-contact': [{ path: '/contact' }],
};

function revalidateImage(key: SiteImageKey) {
  for (const target of REVALIDATION_TARGETS[key]) {
    revalidatePath(target.path, target.type);
    // The site is bilingual with localePrefix 'as-needed' (i18n/routing.ts): Thai (default) lives
    // at the bare path, English at the same path under /en. The targets above are the Thai paths;
    // without this the English page keeps the old image until the hourly ISR revalidate. Mirror
    // every target onto its /en twin so an /admin edit refreshes BOTH languages immediately.
    const enPath = target.path === '/' ? '/en' : `/en${target.path}`;
    revalidatePath(enPath, target.type);
  }
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
    revalidateImage(key);
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
    revalidateImage(parsed.data.key);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'คืนค่าเริ่มต้นไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
