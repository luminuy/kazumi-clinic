import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  createMember,
  normalizeEmail,
  toPublicMember,
  type PublicMember,
} from '@/lib/members/store';
import { newId } from '@/lib/members/db';
import { hashPassword } from '@/lib/members/password';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import {
  isEmailConfigured,
  sendAccountExistsEmail,
} from '@/lib/members/password-reset';

// PUBLIC endpoint — creates an email/password member account. Validation mirrors app/api/leads:
// strict Zod, a body-size guard, and generic error text.
//
// It deliberately does NOT start a session, and answers a duplicate email with the same 200 body as
// a fresh signup. Both facts serve one goal: the response must not reveal whether an address
// already belongs to a member. For an aesthetic clinic that is health-adjacent personal data
// (PDPA), so "does this person have an account here" is not ours to hand out. Issuing a session
// only on the real-signup branch would leak exactly that through the Set-Cookie header, which is
// why the caller is sent to /account/login instead of being logged straight in.
//
// Residual, and honest about it: an attacker who registers an address and then succeeds at logging
// in with the password they just chose learns the address was previously unused. Closing that needs
// verify-before-create over email — see lib/members/password-reset.ts once a provider is wired.

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
    return NextResponse.json({ ok: true, member: toPublicMember(member) });
  } catch (error) {
    if (error instanceof Error && error.message === 'EMAIL_TAKEN') {
      // createMember rejects a duplicate BEFORE it hashes anything, so returning here directly
      // would answer roughly a PBKDF2 run sooner than a real signup — a timing oracle in place of
      // the message we just removed. Burn the same work, and discard it.
      await hashPassword(parsed.data.password);

      if (isEmailConfigured()) {
        try {
          await sendAccountExistsEmail({ to: parsed.data.email });
        } catch {
          // Delivery faults must not turn the duplicate-only path into an account oracle.
          console.error('Account-exists email delivery failed.');
        }
      }

      return NextResponse.json({
        ok: true,
        member: registrationDecoy(parsed.data),
      });
    }
    console.error(error);
    return NextResponse.json(
      { error: 'สมัครไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
