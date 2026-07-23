import { cookies } from 'next/headers';
import { memberDb, requireDb } from './db';
import { findMemberById, toPublicMember, type MemberRow, type PublicMember } from './store';

export const SESSION_COOKIE = 'kz_member_session';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

/** sha256 hex of the raw token — only this derived value is stored, never the token itself. */
async function hashToken(token: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

function randomToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

/**
 * Creates a session for a member, writes the row, and sets the HttpOnly cookie. Returns the raw
 * token (the caller usually ignores it — the cookie is what matters).
 */
export async function createSession(memberId: string, userAgent?: string | null): Promise<void> {
  const db = await memberDb();
  requireDb(db);
  const token = randomToken();
  const id = await hashToken(token);
  const now = Date.now();
  const expiresAt = now + SESSION_TTL_MS;

  await db
    .prepare(
      `INSERT INTO member_sessions (id, member_id, expires_at, created_at, user_agent)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(id, memberId, expiresAt, now, userAgent?.slice(0, 255) ?? null)
    .run();

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: Math.floor(SESSION_TTL_MS / 1000),
  });
}

/** Resolves the current member from the session cookie, or null. Expired sessions read as null. */
export async function getCurrentMember(): Promise<PublicMember | null> {
  const row = await getCurrentMemberRow();
  return row ? toPublicMember(row) : null;
}

export async function getCurrentMemberRow(): Promise<MemberRow | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await memberDb();
  if (!db) return null;
  const id = await hashToken(token);
  const session = await db
    .prepare('SELECT member_id, expires_at FROM member_sessions WHERE id = ?')
    .bind(id)
    .first<{ member_id: string; expires_at: number }>();

  if (!session) return null;
  if (session.expires_at < Date.now()) {
    await db.prepare('DELETE FROM member_sessions WHERE id = ?').bind(id).run();
    return null;
  }
  return findMemberById(session.member_id);
}

/** Clears the current session: deletes the row and expires the cookie. Safe to call when logged out. */
export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await memberDb();
    if (db) {
      const id = await hashToken(token);
      await db.prepare('DELETE FROM member_sessions WHERE id = ?').bind(id).run();
    }
  }
  jar.set(SESSION_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0,
  });
}
