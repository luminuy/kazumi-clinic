import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { findMemberByEmail, toPublicMember } from '@/lib/members/store';
import { verifyPassword } from '@/lib/members/password';
import { createSession } from '@/lib/members/session';
import { mergeGuestCartIntoMember } from '@/lib/members/cart';

// PUBLIC endpoint — verifies an email/password pair and starts a session. A wrong email and a wrong
// password return the SAME 401 message so the response can't be used to enumerate accounts.

const MAX_BODY = 4 * 1024;
const INVALID = 'อีเมลหรือรหัสผ่านไม่ถูกต้อง';

const schema = z.object({
  email: z.string().trim().email(INVALID).max(160),
  password: z.string().min(1, INVALID).max(200),
});

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
    return NextResponse.json({ error: INVALID }, { status: 401 });
  }

  try {
    const member = await findMemberByEmail(parsed.data.email);
    // Verify even when the member is missing / has no password, to keep the timing uniform-ish and
    // the branch simple. A dummy hash prevents an early-return timing signal.
    const stored =
      member?.password_hash ??
      'pbkdf2$100000$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=';
    const ok = await verifyPassword(parsed.data.password, stored);
    if (!member || !member.password_hash || !ok) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }
    await createSession(member.id, request.headers.get('user-agent'));
    await mergeGuestCartIntoMember(member.id);
    return NextResponse.json({ ok: true, member: toPublicMember(member) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'เข้าสู่ระบบไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
