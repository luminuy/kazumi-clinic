import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from '@/lib/members/password';

describe('hashPassword / verifyPassword', () => {
  it('produces a self-describing pbkdf2$<iterations>$<salt>$<hash> string', async () => {
    const stored = await hashPassword('correct horse battery staple');
    const parts = stored.split('$');
    expect(parts).toHaveLength(4);
    expect(parts[0]).toBe('pbkdf2');
    expect(Number(parts[1])).toBeGreaterThan(0);
  });

  it('verifies the correct password against its own hash', async () => {
    const stored = await hashPassword('a real password');
    await expect(verifyPassword('a real password', stored)).resolves.toBe(true);
  });

  it('rejects a wrong password against a real hash', async () => {
    const stored = await hashPassword('a real password');
    await expect(verifyPassword('not the password', stored)).resolves.toBe(false);
  });

  it('salts each hash independently, so the same password hashes differently each time', async () => {
    const a = await hashPassword('same password');
    const b = await hashPassword('same password');
    expect(a).not.toBe(b);
    await expect(verifyPassword('same password', a)).resolves.toBe(true);
    await expect(verifyPassword('same password', b)).resolves.toBe(true);
  });

  it('rejects malformed stored values instead of throwing', async () => {
    await expect(verifyPassword('anything', 'not-a-real-hash')).resolves.toBe(false);
    await expect(verifyPassword('anything', 'pbkdf2$notanumber$salt$hash')).resolves.toBe(false);
    await expect(verifyPassword('anything', 'bcrypt$10$legacy$hash')).resolves.toBe(false);
  });

  it('rejects a stored value with invalid base64 salt/hash instead of throwing', async () => {
    await expect(verifyPassword('anything', 'pbkdf2$600000$not-base64!$also-not-base64!')).resolves.toBe(false);
  });
});
