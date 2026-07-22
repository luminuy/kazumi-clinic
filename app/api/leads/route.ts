import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createLead } from '@/lib/leads-store';

// PUBLIC endpoint — the one unauthenticated write in the app (middleware only gates /api/admin/*).
// Defence in depth: a strict Zod schema, a honeypot field, and a body-size guard. No secret is
// exposed; the worst a bad actor can do is insert a junk lead, which the admin can delete.

const MAX_BODY = 8 * 1024;

const schema = z.object({
  name: z.string().trim().min(1, 'กรุณากรอกชื่อ').max(80),
  // Thai phone numbers, loosely: digits plus the usual separators, with enough real digits to dial.
  phone: z
    .string()
    .trim()
    .min(6, 'กรุณากรอกเบอร์โทร')
    .max(20)
    .regex(/^[0-9+\-\s()]+$/, 'เบอร์โทรไม่ถูกต้อง')
    .refine((v) => (v.match(/\d/g)?.length ?? 0) >= 8, 'เบอร์โทรไม่ถูกต้อง'),
  interest: z.string().trim().max(120).nullish(),
  preferredTime: z.string().trim().max(120).nullish(),
  message: z.string().trim().max(1000).nullish(),
  // Honeypot: a hidden field real users never fill. Any value = bot; we 200 to not tip it off.
  website: z.string().max(0).optional().or(z.literal('')),
});

/** Fire-and-forget notification to an optional webhook (LINE Notify is retired; use any webhook). */
async function notify(payload: Record<string, unknown>) {
  const url = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // A failed notification must never fail the submission — the lead is already saved.
  }
}

export async function POST(request: NextRequest) {
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

  // Honeypot tripped — pretend success so a bot doesn't learn the field exists, but save nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const { name, phone, interest, preferredTime, message } = parsed.data;
  try {
    const id = await createLead({
      name,
      phone,
      interest: interest ?? null,
      preferredTime: preferredTime ?? null,
      message: message ?? null,
      source: 'booking-form',
    });
    await notify({ id, name, phone, interest, preferredTime, message });
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ส่งไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
