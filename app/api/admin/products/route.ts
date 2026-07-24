import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { serviceCategories } from '@/lib/services';
import {
  upsertProduct,
  deleteProduct,
  reorderProducts,
  type ProductInput,
} from '@/lib/service-products-store';

// middleware.ts is the auth gate; the identity it forwards is read here rather than assumed, the
// same belt-and-braces the images route uses.
function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const categorySlugs = serviceCategories.map((c) => c.slug) as [string, ...string[]];

/** Turns a product name into an id-safe slug; Thai names fall back to a timestamp-only id. */
function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 40);
}

const upsertSchema = z.object({
  // Absent for a new product (the server mints a stable id); present when editing an existing one.
  id: z.string().min(1).max(80).optional(),
  category: z.enum(categorySlugs),
  name: z.string().trim().min(1, 'ต้องมีชื่อสินค้า').max(120),
  detail: z.string().trim().max(200).nullish(),
  tagline: z.string().trim().max(120).nullish(),
  benefits: z.array(z.string().trim().min(1).max(300)).max(12).nullish(),
  collection: z.string().trim().max(120).nullish(),
  // A price is optional (renders "สอบถามราคา"); when present it must be a sane positive integer.
  priceFrom: z.number().int().positive().max(100_000_000).nullish(),
  unit: z.string().trim().min(1).max(24).nullish(),
  sortOrder: z.number().int().min(0).max(9999).optional(),
});

const deleteSchema = z.object({
  id: z.string().min(1).max(80),
  category: z.enum(categorySlugs),
});

const reorderSchema = z.object({
  category: z.enum(categorySlugs),
  orderedIds: z.array(z.string().min(1).max(80)).min(1).max(200),
});

function revalidateCategory(category: string) {
  // The category page, home carousel, and /services all read the merged product list.
  // Thai (default) lives at the bare path, English under /en (localePrefix 'as-needed') — mirror
  // both so an /admin edit refreshes the English page immediately, not just after the hourly ISR.
  revalidatePath(`/${category}`);
  revalidatePath('/');
  revalidatePath('/services');
  revalidatePath(`/en/${category}`);
  revalidatePath('/en');
  revalidatePath('/en/services');
}

export async function POST(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = upsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const id = data.id ?? `${data.category}-${slugify(data.name) || 'item'}-${Date.now().toString(36)}`;
  const input: ProductInput = {
    id,
    category: data.category,
    name: data.name,
    detail: data.detail ?? null,
    tagline: data.tagline ?? null,
    benefits: data.benefits ?? null,
    collection: data.collection ?? null,
    priceFrom: data.priceFrom ?? null,
    unit: data.unit ?? 'ครั้ง',
    // Only used on a fresh INSERT (upsert keeps an existing row's order): a hardcoded product's
    // first edit seeds at its code position, a brand-new product lands at the end.
    sortOrder: data.sortOrder ?? defaultSortOrder(data.category, id),
  };

  try {
    await upsertProduct(input, email);
    revalidateCategory(data.category);
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
    await deleteProduct(parsed.data.id, parsed.data.category, email);
    revalidateCategory(parsed.data.category);
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
    await reorderProducts(parsed.data.category, parsed.data.orderedIds, email);
    revalidateCategory(parsed.data.category);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'จัดลำดับไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

/**
 * Seed order for a fresh row: a hardcoded product keeps its position in the code; anything else
 * (a brand-new product) lands one past the end of the shipped list.
 */
function defaultSortOrder(category: string, id: string): number {
  const items = serviceCategories.find((c) => c.slug === category)?.items ?? [];
  const index = items.findIndex((item) => item.id === id);
  return index >= 0 ? index : items.length;
}
