import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { serviceCategories } from '@/lib/services';
import {
  upsertReview,
  deleteReview,
  reorderReviews,
  nextSortOrder,
  type ReviewInput,
} from '@/lib/reviews-store';

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const categorySlugs = serviceCategories.map((c) => c.slug) as [string, ...string[]];

const upsertSchema = z
  .object({
    // Absent for a new review (server mints an id); present when editing an existing one.
    id: z.string().min(1).max(80).optional(),
    name: z.string().trim().min(1, 'ต้องมีชื่อผู้รีวิว').max(80),
    rating: z.number().int().min(1).max(5).nullish(),
    quote: z.string().trim().max(600).nullish(),
    procedure: z.string().trim().max(120).nullish(),
    categorySlug: z.enum(categorySlugs).nullish(),
    consent: z.boolean(),
    published: z.boolean(),
    sortOrder: z.number().int().min(0).max(9999).optional(),
  })
  // A review can't go live without consent — the compliance gate lives at the write boundary too,
  // not only in the read path, so a bad client can't publish a non-consented review.
  .refine((data) => !data.published || data.consent, {
    message: 'ต้องยืนยันว่าได้รับความยินยอมจากลูกค้าก่อนเผยแพร่',
    path: ['consent'],
  });

const deleteSchema = z.object({ id: z.string().min(1).max(80) });

const reorderSchema = z.object({
  orderedIds: z.array(z.string().min(1).max(80)).min(1).max(400),
});

export async function POST(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = upsertSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const data = parsed.data;
  const id = data.id ?? `review-${Date.now().toString(36)}-${Math.round(data.name.length)}`;
  const input: ReviewInput = {
    id,
    name: data.name,
    rating: data.rating ?? null,
    quote: data.quote ?? null,
    procedure: data.procedure ?? null,
    categorySlug: data.categorySlug ?? null,
    consent: data.consent,
    published: data.published,
    sortOrder: data.sortOrder ?? (data.id ? 0 : await nextSortOrder()),
  };

  try {
    await upsertReview(input, email);
    revalidatePath('/reviews');
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
    await deleteReview(parsed.data.id);
    revalidatePath('/reviews');
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
    await reorderReviews(parsed.data.orderedIds, email);
    revalidatePath('/reviews');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'จัดลำดับไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
