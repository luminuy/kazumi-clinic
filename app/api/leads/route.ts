import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { createLead, ensureCancelToken } from '@/lib/leads-store';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { getCurrentMember } from '@/lib/members/session';
import { isValidRequestedSlot } from '@/lib/appointments/schedule';
import { notifyStaffWebhook } from '@/lib/appointments/notify';

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
  email: z
    .string()
    .trim()
    .toLowerCase()
    .max(254)
    .email('อีเมลไม่ถูกต้อง')
    .optional()
    .or(z.literal('')),
  requestedDate: z
    .string()
    .trim()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'วันที่ไม่ถูกต้อง')
    .optional(),
  requestedTime: z
    .string()
    .trim()
    .regex(/^\d{2}:\d{2}$/, 'เวลาไม่ถูกต้อง')
    .optional(),
  locale: z.enum(['th', 'en']),
  message: z.string().trim().max(1000).nullish(),
  // Honeypot: a hidden field real users never fill. Accept any string so validation passes, then
  // the handler silently drops a filled one with a 200 — never a 400, which would tip off a bot.
  website: z.string().max(200).optional(),
});

export async function POST(request: NextRequest) {
  // Lead-spam guard: 6 submissions per IP per 10 minutes (on top of the honeypot below).
  if (!(await rateLimit('leads', clientIp(request), { limit: 6, windowSec: 600 }))) {
    return NextResponse.json({ error: 'ส่งข้อมูลบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
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

  // Honeypot tripped — pretend success so a bot doesn't learn the field exists, but save nothing.
  if (parsed.data.website) return NextResponse.json({ ok: true });

  const {
    name,
    phone,
    interest,
    preferredTime,
    email,
    requestedDate,
    requestedTime,
    locale,
    message,
  } = parsed.data;
  if (requestedDate && requestedTime) {
    const validity = isValidRequestedSlot({ dateIso: requestedDate, time: requestedTime });
    if (!validity.ok) {
      return NextResponse.json({ error: validity.reason }, { status: 400 });
    }
  }

  try {
    const member = await getCurrentMember();
    const contactEmail = email || member?.email || null;
    const id = await createLead({
      name,
      phone,
      email: contactEmail,
      memberId: member?.id ?? null,
      locale,
      interest: interest ?? null,
      preferredTime: preferredTime ?? null,
      requestedDate: requestedDate ?? null,
      requestedTime: requestedTime ?? null,
      message: message ?? null,
      source: 'booking-form',
    });
    await ensureCancelToken(id);
    await notifyStaffWebhook({
      id,
      name,
      phone,
      email: contactEmail,
      interest,
      preferredTime,
      requestedDate,
      requestedTime,
      message,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'ส่งไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
