import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';

type TokenRow = {
  id: string;
  member_id: string;
  type: string;
  expires_at: number;
  created_at: number;
};

const { memberDbMock, tokenRows } = vi.hoisted(() => ({
  memberDbMock: vi.fn(),
  tokenRows: new Map<string, TokenRow>(),
}));

vi.mock('@/lib/members/db', () => ({
  memberDb: memberDbMock,
  requireDb(db: unknown) {
    if (!db) throw new Error('D1 unavailable');
  },
}));

const mockDb = {
  prepare: vi.fn((sql: string) => {
    let values: unknown[] = [];
    const statement = {
      bind: vi.fn((...bound: unknown[]) => {
        values = bound;
        return statement;
      }),
      run: vi.fn(async () => {
        if (sql.startsWith('DELETE FROM member_tokens WHERE member_id')) {
          const [memberId, type] = values as [string, string];
          for (const [id, row] of tokenRows) {
            if (row.member_id === memberId && row.type === type) tokenRows.delete(id);
          }
          return {};
        }
        if (sql.includes('INSERT INTO member_tokens')) {
          const [id, memberId, type, expiresAt, createdAt] = values as [
            string,
            string,
            string,
            number,
            number,
          ];
          tokenRows.set(id, {
            id,
            member_id: memberId,
            type,
            expires_at: expiresAt,
            created_at: createdAt,
          });
          return {};
        }
        throw new Error(`Unexpected run query: ${sql}`);
      }),
      first: vi.fn(async () => {
        if (!sql.includes('DELETE FROM member_tokens') || !sql.includes('RETURNING member_id')) {
          throw new Error(`Unexpected first query: ${sql}`);
        }
        const [id, type] = values as [string, string];
        const row = tokenRows.get(id);
        if (!row || row.type !== type) return null;
        tokenRows.delete(id);
        return { member_id: row.member_id, expires_at: row.expires_at };
      }),
    };
    return statement;
  }),
} as unknown as D1Database;

const { memberDb } = await import('@/lib/members/db');
const { createPasswordResetToken, consumePasswordResetToken } = await import(
  '@/lib/members/password-reset'
);
const mockedMemberDb = vi.mocked(memberDb);

beforeEach(() => {
  tokenRows.clear();
  vi.clearAllMocks();
  mockedMemberDb.mockResolvedValue(mockDb);
});

describe('password-reset tokens', () => {
  it('creates and consumes a token for the right member', async () => {
    const token = await createPasswordResetToken('mbr_roundtrip');
    const [storedId] = tokenRows.keys();
    expect(storedId).toMatch(/^[a-f0-9]{64}$/);
    expect(storedId).not.toBe(token);

    await expect(consumePasswordResetToken(token)).resolves.toBe('mbr_roundtrip');
  });

  it('rejects an expired token', async () => {
    const token = await createPasswordResetToken('mbr_expired');
    const row = tokenRows.values().next().value;
    if (!row) throw new Error('Expected the created token row');
    row.expires_at = Date.now() - 1;

    await expect(consumePasswordResetToken(token)).resolves.toBeNull();
  });

  it('allows a token to be consumed only once', async () => {
    const token = await createPasswordResetToken('mbr_single_use');

    await expect(consumePasswordResetToken(token)).resolves.toBe('mbr_single_use');
    await expect(consumePasswordResetToken(token)).resolves.toBeNull();
  });

  it('returns null for an unknown token instead of throwing', async () => {
    await expect(consumePasswordResetToken('not-a-real-token')).resolves.toBeNull();
  });
});
