import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { D1Database } from '@cloudflare/workers-types';
import type { NextRequest } from 'next/server';

type FakeStatement = {
  bind: ReturnType<typeof vi.fn>;
  run: ReturnType<typeof vi.fn>;
};

type PreparedCall = {
  sql: string;
  values: unknown[];
  statement: FakeStatement;
};

const {
  batchMock,
  clientIpMock,
  consumePasswordResetTokenMock,
  hashPasswordMock,
  memberDbMock,
  preparedCalls,
  rateLimitMock,
  statementRunMock,
} = vi.hoisted(() => ({
  batchMock: vi.fn(),
  clientIpMock: vi.fn(),
  consumePasswordResetTokenMock: vi.fn(),
  hashPasswordMock: vi.fn(),
  memberDbMock: vi.fn(),
  preparedCalls: [] as PreparedCall[],
  rateLimitMock: vi.fn(),
  statementRunMock: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  clientIp: clientIpMock,
  rateLimit: rateLimitMock,
}));

vi.mock('@/lib/members/password', () => ({
  hashPassword: hashPasswordMock,
}));

vi.mock('@/lib/members/password-reset', () => ({
  consumePasswordResetToken: consumePasswordResetTokenMock,
}));

vi.mock('@/lib/members/db', () => ({
  memberDb: memberDbMock,
  requireDb(db: unknown) {
    if (!db) throw new Error('D1 unavailable');
  },
}));

const prepareMock = vi.fn((sql: string) => {
  const values: unknown[] = [];
  const statement: FakeStatement = {
    bind: vi.fn((...bound: unknown[]) => {
      values.push(...bound);
      return statement;
    }),
    run: statementRunMock,
  };
  preparedCalls.push({ sql, values, statement });
  return statement;
});

const mockDb = {
  prepare: prepareMock,
  batch: batchMock,
} as unknown as D1Database;

const { POST } = await import('@/app/api/account/reset-password/route');

function resetRequest(token: string): NextRequest {
  return new Request('https://example.test/api/account/reset-password', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ token, password: 'new-password-123' }),
  }) as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  preparedCalls.length = 0;
  clientIpMock.mockReturnValue('203.0.113.1');
  rateLimitMock.mockResolvedValue(true);
  memberDbMock.mockResolvedValue(mockDb);
  batchMock.mockResolvedValue([]);
});

describe('POST /api/account/reset-password', () => {
  it('updates the password and revokes every session in one atomic batch', async () => {
    consumePasswordResetTokenMock.mockResolvedValue('mbr_target');
    hashPasswordMock.mockResolvedValue('hashed-new-password');

    const response = await POST(resetRequest('valid-token'));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
    expect(preparedCalls).toHaveLength(2);

    const [passwordUpdate, sessionDelete] = preparedCalls;
    expect(passwordUpdate.sql).toBe(
      'UPDATE members SET password_hash = ?, updated_at = ? WHERE id = ?',
    );
    expect(passwordUpdate.values).toEqual([
      'hashed-new-password',
      expect.any(Number),
      'mbr_target',
    ]);
    expect(sessionDelete.sql).toBe('DELETE FROM member_sessions WHERE member_id = ?');
    expect(sessionDelete.values).toEqual(['mbr_target']);

    expect(batchMock).toHaveBeenCalledTimes(1);
    expect(batchMock).toHaveBeenCalledWith([
      passwordUpdate.statement,
      sessionDelete.statement,
    ]);
    expect(statementRunMock).not.toHaveBeenCalled();
  });

  it('performs no writes for an invalid or expired token', async () => {
    consumePasswordResetTokenMock.mockResolvedValue(null);

    const response = await POST(resetRequest('expired-token'));

    expect(response.status).toBe(400);
    await expect(response.json()).resolves.toEqual({
      error: 'ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว',
      code: 'invalid_token',
    });
    expect(hashPasswordMock).not.toHaveBeenCalled();
    expect(memberDbMock).not.toHaveBeenCalled();
    expect(prepareMock).not.toHaveBeenCalled();
    expect(batchMock).not.toHaveBeenCalled();
    expect(statementRunMock).not.toHaveBeenCalled();
  });
});
