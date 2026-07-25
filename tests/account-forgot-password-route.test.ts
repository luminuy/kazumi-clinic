import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';

/**
 * Two things this route must get right, both found while wiring Resend:
 *
 * 1. The reset link must point at wherever THIS request was served from (the deployed origin),
 *    not the SEO-facing `site.url` (kazumiclinic.com) — SITE_ENV=preview means the live site is
 *    still the workers.dev host, so a site.url-based link would 404 for every member until the
 *    real domain goes live. Same class of bug the OAuth redirect URI already fixes for.
 * 2. A D1 or Resend failure on the member-exists branch must never surface as a different HTTP
 *    status than the member-doesn't-exist branch — that difference IS an account-existence oracle.
 */

const { clientIpMock, createPasswordResetTokenMock, findMemberByEmailMock, rateLimitMock, sendPasswordResetEmailMock } =
  vi.hoisted(() => ({
    clientIpMock: vi.fn(),
    createPasswordResetTokenMock: vi.fn(),
    findMemberByEmailMock: vi.fn(),
    rateLimitMock: vi.fn(),
    sendPasswordResetEmailMock: vi.fn(),
  }));

vi.mock('@/lib/rate-limit', () => ({ clientIp: clientIpMock, rateLimit: rateLimitMock }));

vi.mock('@/lib/members/store', () => ({ findMemberByEmail: findMemberByEmailMock }));

vi.mock('@/lib/members/password-reset', () => ({
  createPasswordResetToken: createPasswordResetTokenMock,
  isEmailConfigured: () => true,
  sendPasswordResetEmail: sendPasswordResetEmailMock,
}));

const { POST } = await import('@/app/api/account/forgot-password/route');

function forgotRequest(body: Record<string, unknown>, url = 'https://kazumi-clinic.bankjack10452.workers.dev/api/account/forgot-password'): NextRequest {
  return new Request(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  }) as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  clientIpMock.mockReturnValue('203.0.113.4');
  rateLimitMock.mockResolvedValue(true);
  createPasswordResetTokenMock.mockResolvedValue('raw-token-value');
  sendPasswordResetEmailMock.mockResolvedValue({ status: 'sent' });
});

describe('POST /api/account/forgot-password — reset link host', () => {
  it('builds the link from the request origin, not site.url', async () => {
    findMemberByEmailMock.mockResolvedValue({ id: 'mbr_1' });

    await POST(forgotRequest({ email: 'patient@example.com' }));

    expect(sendPasswordResetEmailMock).toHaveBeenCalledTimes(1);
    const [{ resetUrl }] = sendPasswordResetEmailMock.mock.calls[0];
    expect(resetUrl.startsWith('https://kazumi-clinic.bankjack10452.workers.dev/')).toBe(true);
    expect(resetUrl).not.toContain('kazumiclinic.com');
  });

  it('reflects a different origin (e.g. the real domain, once live) unchanged', async () => {
    findMemberByEmailMock.mockResolvedValue({ id: 'mbr_1' });

    await POST(forgotRequest({ email: 'patient@example.com' }, 'https://kazumiclinic.com/api/account/forgot-password'));

    const [{ resetUrl }] = sendPasswordResetEmailMock.mock.calls[0];
    expect(resetUrl.startsWith('https://kazumiclinic.com/')).toBe(true);
  });

  it('prefixes /en for an English request, and leaves Thai unprefixed', async () => {
    findMemberByEmailMock.mockResolvedValue({ id: 'mbr_1' });

    await POST(forgotRequest({ email: 'a@example.com', locale: 'en' }));
    expect(sendPasswordResetEmailMock.mock.calls[0][0].resetUrl).toContain('/en/account/reset-password');

    await POST(forgotRequest({ email: 'a@example.com', locale: 'th' }));
    expect(sendPasswordResetEmailMock.mock.calls[1][0].resetUrl).not.toContain('/en/');
  });
});

describe('POST /api/account/forgot-password — cannot be used to find accounts', () => {
  it('answers 200 identically for an existing and a non-existing email', async () => {
    findMemberByEmailMock.mockResolvedValueOnce({ id: 'mbr_1' });
    const known = await POST(forgotRequest({ email: 'known@example.com' }));

    findMemberByEmailMock.mockResolvedValueOnce(undefined);
    const unknown = await POST(forgotRequest({ email: 'unknown@example.com' }));

    expect(known.status).toBe(unknown.status);
    await expect(known.json()).resolves.toEqual(await unknown.json());
  });

  it('still answers 200 when token creation fails for a real member', async () => {
    findMemberByEmailMock.mockResolvedValue({ id: 'mbr_1' });
    createPasswordResetTokenMock.mockRejectedValue(new Error('D1 unavailable'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(forgotRequest({ email: 'patient@example.com' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('still answers 200 when Resend delivery throws for a real member', async () => {
    findMemberByEmailMock.mockResolvedValue({ id: 'mbr_1' });
    sendPasswordResetEmailMock.mockRejectedValue(new Error('Resend is down'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const response = await POST(forgotRequest({ email: 'patient@example.com' }));

    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toEqual({ ok: true });
  });

  it('does not even attempt delivery for an unknown email', async () => {
    findMemberByEmailMock.mockResolvedValue(undefined);

    await POST(forgotRequest({ email: 'nobody@example.com' }));

    expect(createPasswordResetTokenMock).not.toHaveBeenCalled();
    expect(sendPasswordResetEmailMock).not.toHaveBeenCalled();
  });
});

describe('POST /api/account/forgot-password — rate limit', () => {
  it('429s before touching the member lookup', async () => {
    rateLimitMock.mockResolvedValue(false);

    const response = await POST(forgotRequest({ email: 'patient@example.com' }));

    expect(response.status).toBe(429);
    expect(findMemberByEmailMock).not.toHaveBeenCalled();
  });
});
