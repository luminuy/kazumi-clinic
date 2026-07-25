import { memberDb, requireDb } from './db';
import { hashToken, randomToken } from './session';

const PASSWORD_RESET_TTL_MS = 60 * 60 * 1000;
const PASSWORD_RESET_TYPE = 'password_reset';

/**
 * Member-account email provider seams. The clinic will connect its chosen provider here later;
 * this file is the ONLY place that needs to change when delivery is wired.
 *
 * Neither these seams nor their callers may log recipient addresses, tokens, or reset URLs: the
 * URL contains the same single-use credential as the raw token.
 */

export type PasswordResetEmailDelivery =
  | { status: 'sent' }
  | { status: 'not_configured' };

export type PasswordResetEmail = {
  to: string;
  resetUrl: string;
};

export type AccountExistsEmailDelivery =
  | { status: 'sent' }
  | { status: 'not_configured' };

export type AccountExistsEmail = {
  to: string;
};

/** True once the chosen email provider's credentials are present in the environment. */
export function isEmailConfigured(): boolean {
  // Placeholder env name — rename it to match whichever provider the clinic chooses.
  return !!process.env.EMAIL_API_KEY?.trim();
}

export async function sendPasswordResetEmail(
  message: PasswordResetEmail,
): Promise<PasswordResetEmailDelivery> {
  if (!isEmailConfigured()) {
    console.warn('Password-reset email delivery is not configured.');
    return { status: 'not_configured' };
  }

  // TODO(email-provider): send `message.resetUrl` to `message.to` with the provider SDK/REST API,
  // then return { status: 'sent' }. Until that integration exists, never claim delivery happened.
  void message;
  return { status: 'not_configured' };
}

export async function sendAccountExistsEmail(
  message: AccountExistsEmail,
): Promise<AccountExistsEmailDelivery> {
  if (!isEmailConfigured()) {
    console.warn('Account-exists email delivery is not configured.');
    return { status: 'not_configured' };
  }

  // TODO(email-provider): send the localized Account.accountExists email copy to `message.to`,
  // then return { status: 'sent' }. Never log the recipient address or provider payload.
  void message;
  return { status: 'not_configured' };
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
