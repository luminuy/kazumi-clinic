import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { addItem, setItemQty, removeItem } from '@/lib/members/cart';

// Cart mutations for the current visitor. POST adds (or increments), PATCH sets an absolute
// quantity, DELETE removes a line. Each returns the updated cart so the client can re-render
// without a second round-trip. Zod-validated; a body-size guard caps abuse.

const MAX_BODY = 2 * 1024;

const addSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(1).max(99).optional(),
});
const setSchema = z.object({
  productId: z.string().trim().min(1).max(120),
  quantity: z.number().int().min(0).max(99),
});
const removeSchema = z.object({ productId: z.string().trim().min(1).max(120) });

async function readBody(request: NextRequest): Promise<unknown | { __error: NextResponse }> {
  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return { __error: NextResponse.json({ error: 'ข้อมูลยาวเกินไป' }, { status: 413 }) };
  }
  try {
    return JSON.parse(raw || '{}');
  } catch {
    return { __error: NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 }) };
  }
}

function isErr(v: unknown): v is { __error: NextResponse } {
  return typeof v === 'object' && v !== null && '__error' in v;
}

export async function POST(request: NextRequest) {
  const body = await readBody(request);
  if (isErr(body)) return body.__error;
  const parsed = addSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    const cart = await addItem(parsed.data.productId, parsed.data.quantity ?? 1);
    return NextResponse.json({ ok: true, cart });
  } catch (error) {
    if (error instanceof Error && error.message === 'NOT_PURCHASABLE') {
      return NextResponse.json({ error: 'รายการนี้ไม่สามารถสั่งซื้อออนไลน์ได้' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เพิ่มลงตะกร้าไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function PATCH(request: NextRequest) {
  const body = await readBody(request);
  if (isErr(body)) return body.__error;
  const parsed = setSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    const cart = await setItemQty(parsed.data.productId, parsed.data.quantity);
    return NextResponse.json({ ok: true, cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'แก้ไขตะกร้าไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const body = await readBody(request);
  if (isErr(body)) return body.__error;
  const parsed = removeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }
  try {
    const cart = await removeItem(parsed.data.productId);
    return NextResponse.json({ ok: true, cart });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ลบรายการไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
