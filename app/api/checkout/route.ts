import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createOrder } from '@/lib/members/orders';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Creates an order from the current cart. Zod-validated; the cart itself is read server-side (never
// trusted from the client), so the body carries only contact details + the chosen fulfillment.

const MAX_BODY = 4 * 1024;

const schema = z.object({
  contactName: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(80),
  contactPhone: z
    .string()
    .trim()
    .min(6, 'กรุณากรอกเบอร์โทร')
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, 'เบอร์โทรไม่ถูกต้อง')
    .refine((v) => (v.match(/\d/g)?.length ?? 0) >= 8, 'เบอร์โทรไม่ถูกต้อง'),
  contactEmail: z.string().trim().email('อีเมลไม่ถูกต้อง').max(160).nullish().or(z.literal('')),
  preferredTime: z.string().trim().max(120).nullish(),
  note: z.string().trim().max(1000).nullish(),
  fulfillment: z.enum(['booking_request', 'deposit', 'full_payment']),
  paymentMethod: z.enum(['pay_at_clinic', 'gateway']).nullish(),
});

export async function POST(request: NextRequest) {
  // Order-spam guard: 15 checkouts per IP per 5 minutes.
  if (!(await rateLimit('checkout', clientIp(request), { limit: 15, windowSec: 300 }))) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const raw = await request.text();
  if (raw.length > MAX_BODY) {
    return NextResponse.json({ error: 'ข้อมูลยาวเกินไป' }, { status: 413 });
  }

  let json: unknown;
  try {
    json = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  const d = parsed.data;
  try {
    const result = await createOrder({
      contactName: d.contactName,
      contactPhone: d.contactPhone,
      contactEmail: d.contactEmail || null,
      preferredTime: d.preferredTime ?? null,
      note: d.note ?? null,
      fulfillment: d.fulfillment,
      paymentMethod: d.paymentMethod ?? null,
    });
    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    if (error instanceof Error && error.message === 'CART_EMPTY') {
      return NextResponse.json({ error: 'ตะกร้าว่าง' }, { status: 400 });
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'สั่งจองไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
