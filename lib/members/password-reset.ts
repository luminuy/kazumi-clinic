import 'server-only';
import th from '@/messages/th.json';
import en from '@/messages/en.json';
import type { Locale } from '@/lib/site';
import { memberDb, requireDb } from './db';
import { hashToken, randomToken } from './session';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const PASSWORD_RESET_TYPE = 'password_reset';
const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/**
 * Member-account email delivery, via Resend (https://resend.com) — chosen for its free tier
 * (3,000 emails/month, 100/day) against this clinic's actual volume: password resets and
 * duplicate-signup notices only, likely single digits a day. `import 'server-only'` keeps the
 * API key out of any client bundle the same way lib/cloudinary-upload.ts does.
 *
 * Two env vars gate delivery — both set (2026-07-27):
 *   RESEND_API_KEY    — from the Resend dashboard after signup
 *   RESEND_FROM_EMAIL — "Kazumi Clinic <noreply@kazumiclinic.skin>"; the domain is verified with
 *                        Resend via DNS records on the kazumiclinic.skin zone. See
 *                        docs/member-system.md for the walkthrough.
 *
 * Neither these functions nor their callers may log recipient addresses, tokens, reset URLs, or
 * Resend response bodies: the URL carries the same single-use credential as the raw token, and a
 * Resend error body echoes the recipient address back.
 */

type DeliveryStatus = 'sent' | 'not_configured' | 'failed';

export type PasswordResetEmailDelivery = { status: DeliveryStatus };
export type PasswordResetEmail = { to: string; resetUrl: string; locale: Locale };

export type AccountExistsEmailDelivery = { status: DeliveryStatus };
export type AccountExistsEmail = { to: string; locale: Locale };

const messagesFor = (locale: Locale) => (locale === 'en' ? en : th).Account;

/** True once both Resend env vars are present. */
export function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim() && !!process.env.RESEND_FROM_EMAIL?.trim();
}

/**
 * POSTs one email through Resend. Returns 'failed' rather than throwing on any non-2xx response
 * or network error — a delivery fault must never propagate as an unhandled rejection into a route
 * handler whose response shape doubles as an account-existence signal (see the callers in
 * app/api/account/{forgot-password,register}/route.ts).
 */
async function sendViaResend(payload: {
  to: string;
  subject: string;
  text: string;
}): Promise<Extract<DeliveryStatus, 'sent' | 'failed'>> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return 'failed'; // isEmailConfigured() should have gated this already.

  try {
    const res = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({ from, to: payload.to, subject: payload.subject, text: payload.text }),
    });
    if (!res.ok) {
      // Not res.text(): Resend's error body includes the `to` address we're trying not to log.
      console.error(`Resend delivery failed with status ${res.status}`);
      return 'failed';
    }
    return 'sent';
  } catch (error) {
    console.error('Resend request failed:', error instanceof Error ? error.message : 'unknown error');
    return 'failed';
  }
}

export async function sendPasswordResetEmail(
  message: PasswordResetEmail,
): Promise<PasswordResetEmailDelivery> {
  if (!isEmailConfigured()) {
    console.warn('Password-reset email delivery is not configured.');
    return { status: 'not_configured' };
  }

  const copy = messagesFor(message.locale).passwordResetEmail;
  const status = await sendViaResend({
    to: message.to,
    subject: copy.subject,
    text: copy.body.replace('{url}', message.resetUrl),
  });
  return { status };
}

export async function sendAccountExistsEmail(
  message: AccountExistsEmail,
): Promise<AccountExistsEmailDelivery> {
  if (!isEmailConfigured()) {
    console.warn('Account-exists email delivery is not configured.');
    return { status: 'not_configured' };
  }

  const copy = messagesFor(message.locale).accountExists;
  const status = await sendViaResend({ to: message.to, subject: copy.subject, text: copy.body });
  return { status };
}

/** Creates a one-hour, single-use reset token and supersedes older reset links for this member. */
export async function createPasswordResetToken(memberId: string): Promise<string> {
  const db = await memberDb();
  requireDb(db);
  const token = randomToken();
  const id = await hashToken(token);
  const now = Date.now();

  await db
    .prepare('DELETE FROM member_tokens WHERE member_id = ? AND type = ?')
    .bind(memberId, PASSWORD_RESET_TYPE)
    .run();
  await db
    .prepare(
      `INSERT INTO member_tokens (id, member_id, type, expires_at, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, memberId, PASSWORD_RESET_TYPE, now + PASSWORD_RESET_TTL_MS, now)
    .run();

  return token;
}

/**
 * Atomically removes and resolves a reset token. DELETE ... RETURNING prevents two concurrent
 * requests from both consuming the same credential.
 */
export async function consumePasswordResetToken(rawToken: string): Promise<string | null> {
  const db = await memberDb();
  requireDb(db);
  const id = await hashToken(rawToken);
  const row = await db
    .prepare(
      `DELETE FROM member_tokens
       WHERE id = ? AND type = ?
       RETURNING member_id, expires_at`,
    )
    .bind(id, PASSWORD_RESET_TYPE)
    .first<{ member_id: string; expires_at: number }>();

  if (!row || row.expires_at < Date.now()) return null;
  return row.member_id;
}
