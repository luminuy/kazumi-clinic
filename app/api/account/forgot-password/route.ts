import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { findMemberByEmail } from '@/lib/members/store';
import {
  createPasswordResetToken,
  isEmailConfigured,
  sendPasswordResetEmail,
} from '@/lib/members/password-reset';
import { site } from '@/lib/site';

const MAX_BODY = 4 * 1024;
const SUCCESS = { ok: true };

const schema = z.object({
  email: z.string().trim().email('อีเมลไม่ถูกต้อง').max(160),
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
    return NextResponse.json({ error: parsed.error.issues[0].message }, { status: 400 });
  }

  // This endpoint both probes accounts and can trigger email, so keep its window stricter than
  // login. The response below remains identical for known and unknown addresses.
  if (!(await rateLimit('forgot-password', clientIp(request), { limit: 5, windowSec: 900 }))) {
    return NextResponse.json(
      { error: 'ขอรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่ภายหลัง' },
      { status: 429 },
    );
  }

  try {
    const member = await findMemberByEmail(parsed.data.email);
    if (member && isEmailConfigured()) {
      const token = await createPasswordResetToken(member.id);
      const resetUrl = `${site.url}/account/reset-password?token=${encodeURIComponent(token)}`;
      await sendPasswordResetEmail({ to: parsed.data.email, resetUrl });
    }
    return NextResponse.json(SUCCESS);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'ไม่สามารถดำเนินการขอรีเซ็ตรหัสผ่านได้' },
      { status: 502 },
    );
  }
}
