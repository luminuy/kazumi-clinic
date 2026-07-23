import type { D1Database } from '@cloudflare/workers-types';
import { memberDb, requireDb, newId } from './db';
import { hashPassword } from './password';

/** Raw `members` row. `password_hash` is null for OAuth-only accounts. */
export type MemberRow = {
  id: string;
  email: string | null;
  email_verified: number;
  name: string | null;
  password_hash: string | null;
  avatar_url: string | null;
  phone: string | null;
  created_at: number;
  updated_at: number;
};

/** Safe shape for client/UI — never carries the password hash. */
export type PublicMember = {
  id: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
  phone: string | null;
  emailVerified: boolean;
};

export function toPublicMember(row: MemberRow): PublicMember {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    avatarUrl: row.avatar_url,
    phone: row.phone,
    emailVerified: row.email_verified === 1,
  };
}

/** Emails are matched case-insensitively; store the normalized form. */
export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export async function findMemberByEmail(email: string): Promise<MemberRow | null> {
  const db = await memberDb();
  if (!db) return null;
  return db
    .prepare('SELECT * FROM members WHERE email = ?')
    .bind(normalizeEmail(email))
    .first<MemberRow>();
}

export async function findMemberById(id: string): Promise<MemberRow | null> {
  const db = await memberDb();
  if (!db) return null;
  return db.prepare('SELECT * FROM members WHERE id = ?').bind(id).first<MemberRow>();
}

export type CreateMemberInput = {
  email: string;
  password: string;
  name?: string | null;
};

/**
 * Creates an email/password member. Throws `EMAIL_TAKEN` if the email already exists — the caller
 * maps that to a 409 without revealing anything more.
 */
export async function createMember(input: CreateMemberInput): Promise<MemberRow> {
  const db = await memberDb();
  requireDb(db);
  const email = normalizeEmail(input.email);

  const existing = await db.prepare('SELECT id FROM members WHERE email = ?').bind(email).first();
  if (existing) throw new Error('EMAIL_TAKEN');

  const id = newId('mbr');
  const now = Date.now();
  const passwordHash = await hashPassword(input.password);
  await db
    .prepare(
      `INSERT INTO members (id, email, email_verified, name, password_hash, created_at, updated_at)
       VALUES (?, ?, 0, ?, ?, ?, ?)`,
    )
    .bind(id, email, input.name?.trim() || null, passwordHash, now, now)
    .run();

  return {
    id,
    email,
    email_verified: 0,
    name: input.name?.trim() || null,
    password_hash: passwordHash,
    avatar_url: null,
    phone: null,
    created_at: now,
    updated_at: now,
  };
}

/**
 * Finds an existing member by (provider, providerAccountId), else by email, else creates one.
 * Used by the OAuth callbacks (Phase 4). Kept here so account creation logic lives in one place.
 */
export async function upsertOAuthMember(params: {
  provider: string;
  providerAccountId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
}): Promise<MemberRow> {
  const db = await memberDb();
  requireDb(db);
  const now = Date.now();

  const linked = await db
    .prepare(
      `SELECT m.* FROM members m
       JOIN member_oauth_accounts a ON a.member_id = m.id
       WHERE a.provider = ? AND a.provider_account_id = ?`,
    )
    .bind(params.provider, params.providerAccountId)
    .first<MemberRow>();
  if (linked) return linked;

  const email = params.email ? normalizeEmail(params.email) : null;
  let member = email ? await findMemberByEmail(email) : null;

  if (!member) {
    const id = newId('mbr');
    await db
      .prepare(
        `INSERT INTO members (id, email, email_verified, name, avatar_url, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(id, email, email ? 1 : 0, params.name, params.avatarUrl, now, now)
      .run();
    member = {
      id,
      email,
      email_verified: email ? 1 : 0,
      name: params.name,
      password_hash: null,
      avatar_url: params.avatarUrl,
      phone: null,
      created_at: now,
      updated_at: now,
    };
  }

  await linkOAuthAccount(db, member.id, params.provider, params.providerAccountId, now);
  return member;
}

async function linkOAuthAccount(
  db: D1Database,
  memberId: string,
  provider: string,
  providerAccountId: string,
  now: number,
): Promise<void> {
  await db
    .prepare(
      `INSERT OR IGNORE INTO member_oauth_accounts
         (id, member_id, provider, provider_account_id, created_at)
       VALUES (?, ?, ?, ?, ?)`,
    )
    .bind(newId('oauth'), memberId, provider, providerAccountId, now)
    .run();
}
