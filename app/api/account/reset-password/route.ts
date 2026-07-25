import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { memberDb, requireDb } from '@/lib/members/db';
import { hashPassword } from '@/lib/members/password';
import { consumePasswordResetToken } from '@/lib/members/password-reset';

const MAX_BODY = 4 * 1024;

const schema = z.object({
  token: z.string().min(1).max(200),
  password: z.string().min(8, 'รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร').max(200),
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
    return NextResponse.json(
      { error: parsed.error.issues[0].message, code: 'invalid_input' },
      { status: 400 },
    );
  }

  if (!(await rateLimit('reset-password', clientIp(request), { limit: 5, windowSec: 900 }))) {
    return NextResponse.json(
      { error: 'พยายามรีเซ็ตรหัสผ่านบ่อยเกินไป กรุณาลองใหม่ภายหลัง' },
      { status: 429 },
    );
  }

  try {
    const memberId = await consumePasswordResetToken(parsed.data.token);
    if (!memberId) {
      return NextResponse.json(
        { error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว', code: 'invalid_token' },
        { status: 400 },
      );
    }

    const passwordHash = await hashPassword(parsed.data.password);
    const db = await memberDb();
    requireDb(db);
    const now = Date.now();

    // Updating the credential and revoking every old session must succeed together: retaining even
    // one session could leave an attacker signed in after the account owner resets the password.
    await db.batch([
      db
        .prepare('UPDATE members SET password_hash = ?, updated_at = ? WHERE id = ?')
        .bind(passwordHash, now, memberId),
      db.prepare('DELETE FROM member_sessions WHERE member_id = ?').bind(memberId),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'รีเซ็ตรหัสผ่านไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
