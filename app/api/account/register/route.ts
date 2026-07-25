import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createMember,
  normalizeEmail,
  toPublicMember,
  type PublicMember,
} from '@/lib/members/store';
import { newId } from '@/lib/members/db';
import { createSession } from '@/lib/members/session';
import { mergeGuestCartIntoMember } from '@/lib/members/cart';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import {
  isEmailConfigured,
  sendAccountExistsEmail,
} from '@/lib/members/password-reset';

// PUBLIC endpoint — creates an email/password member account and starts a session. Validation
// mirrors app/api/leads: strict Zod, a body-size guard, and generic error text.

const MAX_BODY = 4 * 1024;

const schema = z.object({
  email: z.string().trim().email('อีเมลไม่ถูกต้อง').max(160),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(200),
  name: z.string().trim().max(80).nullish(),
});

function registrationDecoy(input: z.infer<typeof schema>): PublicMember {
  return {
    id: newId('mbr'),
    email: normalizeEmail(input.email),
    name: input.name?.trim() || null,
    avatarUrl: null,
    phone: null,
    emailVerified: false,
  };
}

export async function POST(request: NextRequest) {
  // Signup-spam guard: 5 new accounts per IP per 15 minutes.
  if (!(await rateLimit('register', clientIp(request), { limit: 5, windowSec: 900 }))) {
    return NextResponse.json({ error: 'สมัครบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
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

  try {
    const member = await createMember({
      email: parsed.data.email,
      password: parsed.data.password,
      name: parsed.data.name ?? null,
    });
    await createSession(member.id, request.headers.get('user-agent'));
    await mergeGuestCartIntoMember(member.id);
    return NextResponse.json({ ok: true, member: toPublicMember(member) });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
      if (isEmailConfigured()) {
        try {
          await sendAccountExistsEmail({ to: parsed.data.email });
        } catch {
          // Delivery faults must not turn the duplicate-only path into an account oracle.
          console.error('Account-exists email delivery failed.');
        }

        // A real signup also sets a session cookie while this path cannot. That residual signal is
        // accepted: removing it would require issuing a session for an account we did not create.
        return NextResponse.json({
          ok: true,
          member: registrationDecoy(parsed.data),
        });
      }
      return NextResponse.json({ error: 'อีเมลนี้มีบัญชีอยู่แล้ว' }, { status: 409 });
    }
    console.error(error);
    return NextResponse.json(
      { error: 'สมัครไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
