import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { findMemberByEmail } from '@/lib/members/store';
import {
  createPasswordResetToken,
  isEmailConfigured,
  sendPasswordResetEmail,
} from '@/lib/members/password-reset';
import { LOCALES, DEFAULT_LOCALE, type Locale } from '@/lib/site';

const MAX_BODY = 4 * 1024;
const SUCCESS = { ok: true };

const schema = z.object({
  email: z.string().trim().email('อีเมลไม่ถูกต้อง').max(160),
  // Which language the visitor was reading in, so the email matches it. Optional/defaulted rather
  // than required: this only ever arrives from our own form (components/account/password-reset-
  // form.tsx), never from a user typing it, so a missing value means an older client, not abuse.
  locale: z.enum(LOCALES).optional(),
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

  const locale: Locale = parsed.data.locale ?? DEFAULT_LOCALE;

  try {
    const member = await findMemberByEmail(parsed.data.email);
    if (member && isEmailConfigured()) {
      // Token creation and delivery are wrapped separately from the outer handler on purpose: only
      // the member-exists branch can throw here (an unknown email never reaches this line), so
      // letting either failure fall through to the catch below would turn a D1 hiccup or a Resend
      // outage into a 502-vs-200 signal for which addresses have accounts — exactly what the
      // identical SUCCESS response further down exists to prevent.
      try {
        const token = await createPasswordResetToken(member.id);
        // Use the request's own origin rather than `site.url` — the same fix already applied to
        // OAuth redirect URIs (lib/members/oauth.ts). `site.url` now matches the live domain
        // (kazumiclinic.skin, since 2026-07-27), but building links from the request's origin is
        // still the more robust choice: it keeps working correctly if the Worker is ever reached
        // through another hostname (e.g. workers.dev directly) rather than 404ing.
        const origin = new URL(request.url).origin;
        const localePrefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
        const resetUrl = `${origin}${localePrefix}/account/reset-password?token=${encodeURIComponent(token)}`;
        await sendPasswordResetEmail({ to: parsed.data.email, resetUrl, locale });
      } catch (error) {
        console.error('Password-reset token/delivery failed:', error);
      }
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
