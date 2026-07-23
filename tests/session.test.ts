import { describe, it, expect, afterEach, vi } from 'vitest';
import { SignJWT } from 'jose';
import { encrypt, decrypt } from '@/lib/session';

// The string that used to sit in lib/session.ts as the `||` fallback. It shipped in git, so once the
// repo goes public anyone can read it — these tests exist to prove it can no longer mint a session.
const LEAKED_SECRET = 'default-secret-key-for-development-please-change';

const member = {
  userId: 'u_1',
  email: 'member@example.com',
  name: 'สมาชิกทดสอบ',
  avatarUrl: 'https://example.com/a.png',
};

async function signWith(secret: string) {
  return await new SignJWT({ ...member })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(new TextEncoder().encode(secret));
}

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('session signing key (lib/session.ts)', () => {
  it('refuses to sign in production when SESSION_SECRET is missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '');
    await expect(encrypt(member)).rejects.toThrow(/SESSION_SECRET is not set/);
  });

  it('surfaces the missing secret on verify instead of reporting "logged out"', async () => {
    const token = await signWith(LEAKED_SECRET);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '');
    // A null here would be indistinguishable from an expired cookie and would hide the misconfig.
    await expect(decrypt(token)).rejects.toThrow(/SESSION_SECRET is not set/);
  });

  it('treats whitespace-only SESSION_SECRET as missing', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', '   ');
    await expect(encrypt(member)).rejects.toThrow(/SESSION_SECRET is not set/);
  });

  it('rejects a token signed with the secret that leaked in git history', async () => {
    const forged = await signWith(LEAKED_SECRET);
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', 'a-real-production-secret');
    expect(await decrypt(forged)).toBeNull();
  });

  it('round-trips a session when SESSION_SECRET is set', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('SESSION_SECRET', 'a-real-production-secret');
    expect(await decrypt(await encrypt(member))).toMatchObject(member);
  });

  it('still works outside production so local dev needs no setup', async () => {
    vi.stubEnv('NODE_ENV', 'development');
    vi.stubEnv('SESSION_SECRET', '');
    expect(await decrypt(await encrypt(member))).toMatchObject(member);
  });
});
