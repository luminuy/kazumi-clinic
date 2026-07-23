import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { serviceCategories } from '@/lib/services';
import {
  upsertPromotion,
  deletePromotion,
  reorderPromotions,
  nextSortOrder,
  type PromotionInput,
} from '@/lib/promotions-store';

// middleware.ts is the auth gate; the identity it forwards is read here rather than assumed, the
// same belt-and-braces the images and products routes use.
function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const categorySlugs = serviceCategories.map((c) => c.slug) as [string, ...string[]];

/** Turns a name into an id-safe slug; Thai names fall back to a timestamp-only id. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

const upsertSchema = z
  .object({
    // Absent for a new promotion (the server mints an id); present when editing an existing one.
    id: z.string().min(1).max(80).optional(),
    name: z.string().trim().min(1, 'ต้องมีชื่อโปรโมชั่น').max(120),
    detail: z.string().trim().max(120).nullish(),
    price: z.number().int().positive('ราคาต้องเป็นจำนวนเต็มบวก').max(100_000_000).nullish(),
    originalPrice: z.number().int().positive().max(100_000_000).nullish(),
    note: z.string().trim().max(160).nullish(),
    // A calendar date the promo is valid through. YYYY-MM-DD so string compare == date compare.
    validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'วันหมดอายุไม่ถูกต้อง'),
    categorySlug: z.enum(categorySlugs).nullish(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
    imagePublicId: z.string().nullish(),
  })
  // A struck-through original price only makes sense when it's above the promo price.
  .refine((data) => data.originalPrice == null || (data.price != null && data.originalPrice > data.price), {
    message: 'ราคาเดิมต้องมากกว่าราคาโปรโมชั่น',
    path: ['originalPrice'],
  });

const deleteSchema = z.object({ id: z.string().min(1).max(80) });

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1).max(80)).min(1).max(200),
});

export async function POST(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = upsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const id = data.id ?? `promo-${slugify(data.name) || 'item'}-${Date.now().toString(36)}`;
  const input: PromotionInput = {
    id,
    name: data.name,
    detail: data.detail ?? null,
    price: data.price ?? null,
    originalPrice: data.originalPrice ?? null,
    note: data.note ?? null,
    validUntil: data.validUntil,
    categorySlug: data.categorySlug ?? null,
    imagePublicId: data.imagePublicId ?? null,
    // Only used on a fresh INSERT (upsert keeps an existing row's order): a new promo lands last.
    sortOrder: data.sortOrder ?? (data.id ? 0 : await nextSortOrder()),
  };

  try {
    await upsertPromotion(input, email);
    revalidatePath('/promotions');
    return NextResponse.json({ ok: true, id });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'บันทึกไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    await deletePromotion(parsed.data.id);
    revalidatePath('/promotions');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ลบไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = reorderSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    await reorderPromotions(parsed.data.orderedIds, email);
    revalidatePath('/promotions');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'จัดลำดับไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
