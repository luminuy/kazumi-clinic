import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { MemberRow, PublicMember } from '@/lib/members/store';

const {
  clientIpMock,
  createMemberMock,
  hashPasswordMock,
  isEmailConfiguredMock,
  rateLimitMock,
  sendAccountExistsEmailMock,
} = vi.hoisted(() => ({
  clientIpMock: vi.fn(),
  createMemberMock: vi.fn(),
  hashPasswordMock: vi.fn(),
  isEmailConfiguredMock: vi.fn(),
  rateLimitMock: vi.fn(),
  sendAccountExistsEmailMock: vi.fn(),
}));

vi.mock('@/lib/rate-limit', () => ({
  clientIp: clientIpMock,
  rateLimit: rateLimitMock,
}));

vi.mock('@/lib/members/store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/lib/members/store')>()),
  createMember: createMemberMock,
}));

vi.mock('@/lib/members/password', () => ({
  hashPassword: hashPasswordMock,
}));

vi.mock('@/lib/members/password-reset', () => ({
  isEmailConfigured: isEmailConfiguredMock,
  sendAccountExistsEmail: sendAccountExistsEmailMock,
}));

const { POST } = await import('@/app/api/account/register/route');

const newMember: MemberRow = {
  id: 'mbr_new',
  email: 'patient@example.com',
  email_verified: 0,
  name: 'Patient',
  password_hash: 'hashed-password',
  avatar_url: null,
  phone: null,
  created_at: 1,
  updated_at: 1,
};

function registerRequest(): NextRequest {
  return new Request('https://example.test/api/account/register', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'user-agent': 'route-test',
    },
    body: JSON.stringify({
      email: 'patient@example.com',
      password: 'password-123',
      name: 'Patient',
    }),
  }) as NextRequest;
}

beforeEach(() => {
  vi.clearAllMocks();
  clientIpMock.mockReturnValue('203.0.113.2');
  rateLimitMock.mockResolvedValue(true);
  hashPasswordMock.mockResolvedValue('hashed-password');
  isEmailConfiguredMock.mockReturnValue(false);
  sendAccountExistsEmailMock.mockResolvedValue({ status: 'sent' });
});

describe('POST /api/account/register duplicate-email gate', () => {
  // A clinic account tells you the person is a customer of an aesthetic clinic — health-adjacent
  // personal data under PDPA. These lock in that the endpoint cannot be asked "who has an account".
  it('answers a duplicate exactly like a genuine signup, even with no email provider', async () => {
    createMemberMock
      .mockResolvedValueOnce(newMember)
      .mockRejectedValueOnce(new Error('EMAIL_TAKEN'));

    const genuine = await POST(registerRequest());
    const duplicate = await POST(registerRequest());
    const genuineBody = (await genuine.json()) as { ok: boolean; member: PublicMember };
    const duplicateBody = (await duplicate.json()) as { ok: boolean; member: PublicMember };

    expect(duplicate.status).toBe(genuine.status);
    expect(duplicate.status).toBe(200);
    expect(Object.keys(duplicateBody).sort()).toEqual(Object.keys(genuineBody).sort());
    expect(Object.keys(duplicateBody.member).sort()).toEqual(Object.keys(genuineBody.member).sort());
    expect(duplicateBody).toMatchObject({
      ok: true,
      member: {
        email: 'patient@example.com',
        name: 'Patient',
        avatarUrl: null,
        phone: null,
        emailVerified: false,
      },
    });
    expect(duplicateBody.member.id).toMatch(/^mbr_[a-z0-9]{12}$/);
    expect(duplicateBody.member.id).not.toBe(newMember.id);
    // No provider configured: the duplicate branch must stay silent rather than fall back to
    // telling the caller the address is taken.
    expect(sendAccountExistsEmailMock).not.toHaveBeenCalled();
  });

  it('burns the same password hashing on the duplicate path so timing does not answer instead', async () => {
    createMemberMock.mockRejectedValue(new Error('EMAIL_TAKEN'));

    await POST(registerRequest());

    // createMember rejects a duplicate before hashing anything; without this the duplicate reply
    // would come back a full PBKDF2 run early.
    expect(hashPasswordMock).toHaveBeenCalledTimes(1);
    expect(hashPasswordMock).toHaveBeenCalledWith('password-123');
  });

  it('sends the account-exists email only once a provider is configured', async () => {
    isEmailConfiguredMock.mockReturnValue(true);
    createMemberMock.mockRejectedValue(new Error('EMAIL_TAKEN'));

    const response = await POST(registerRequest());

    expect(response.status).toBe(200);
    expect(sendAccountExistsEmailMock).toHaveBeenCalledTimes(1);
    expect(sendAccountExistsEmailMock).toHaveBeenCalledWith({
      to: 'patient@example.com',
      locale: 'th',
    });
  });

  it('keeps answering 200 when the account-exists email fails to send', async () => {
    isEmailConfiguredMock.mockReturnValue(true);
    createMemberMock.mockRejectedValue(new Error('EMAIL_TAKEN'));
    sendAccountExistsEmailMock.mockRejectedValue(new Error('provider down'));

    const response = await POST(registerRequest());

    // A delivery fault must not surface as a different status — that would be the oracle again.
    expect(response.status).toBe(200);
    await expect(response.json()).resolves.toMatchObject({ ok: true });
  });
});

describe('POST /api/account/register session policy', () => {
  it('never returns a session cookie, so Set-Cookie cannot reveal which branch ran', async () => {
    createMemberMock
      .mockResolvedValueOnce(newMember)
      .mockRejectedValueOnce(new Error('EMAIL_TAKEN'));

    const genuine = await POST(registerRequest());
    const duplicate = await POST(registerRequest());

    expect(genuine.headers.get('set-cookie')).toBeNull();
    expect(duplicate.headers.get('set-cookie')).toBeNull();
  });
});
