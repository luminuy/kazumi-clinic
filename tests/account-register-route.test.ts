import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { NextRequest } from 'next/server';
import type { MemberRow, PublicMember } from '@/lib/members/store';

const {
  clientIpMock,
  createMemberMock,
  createSessionMock,
  isEmailConfiguredMock,
  mergeGuestCartIntoMemberMock,
  rateLimitMock,
  sendAccountExistsEmailMock,
} = vi.hoisted(() => ({
  clientIpMock: vi.fn(),
  createMemberMock: vi.fn(),
  createSessionMock: vi.fn(),
  isEmailConfiguredMock: vi.fn(),
  mergeGuestCartIntoMemberMock: vi.fn(),
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

vi.mock('@/lib/members/session', () => ({
  createSession: createSessionMock,
}));

vi.mock('@/lib/members/cart', () => ({
  mergeGuestCartIntoMember: mergeGuestCartIntoMemberMock,
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
  isEmailConfiguredMock.mockReturnValue(false);
  sendAccountExistsEmailMock.mockResolvedValue({ status: 'sent' });
});

describe('POST /api/account/register duplicate-email gate', () => {
  it('keeps the clear 409 response while email delivery is unconfigured', async () => {
    createMemberMock.mockRejectedValue(new Error('EMAIL_TAKEN'));

    const response = await POST(registerRequest());

    expect(response.status).toBe(409);
    await expect(response.json()).resolves.toEqual({
      error: 'อีเมลนี้มีบัญชีอยู่แล้ว',
    });
    expect(sendAccountExistsEmailMock).not.toHaveBeenCalled();
    expect(createSessionMock).not.toHaveBeenCalled();
    expect(mergeGuestCartIntoMemberMock).not.toHaveBeenCalled();
  });

  it('matches a genuine signup response when email delivery is configured without creating a session', async () => {
    isEmailConfiguredMock.mockReturnValue(true);
    createMemberMock
      .mockResolvedValueOnce(newMember)
      .mockRejectedValueOnce(new Error('EMAIL_TAKEN'));

    const genuineResponse = await POST(registerRequest());
    const duplicateResponse = await POST(registerRequest());
    const genuineBody = (await genuineResponse.json()) as {
      ok: boolean;
      member: PublicMember;
    };
    const duplicateBody = (await duplicateResponse.json()) as {
      ok: boolean;
      member: PublicMember;
    };

    expect(duplicateResponse.status).toBe(genuineResponse.status);
    expect(Object.keys(duplicateBody).sort()).toEqual(Object.keys(genuineBody).sort());
    expect(Object.keys(duplicateBody.member).sort()).toEqual(
      Object.keys(genuineBody.member).sort(),
    );
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
    expect(createMemberMock).toHaveBeenCalledTimes(2);
    expect(createSessionMock).toHaveBeenCalledTimes(1);
    expect(createSessionMock).toHaveBeenCalledWith('mbr_new', 'route-test');
    expect(mergeGuestCartIntoMemberMock).toHaveBeenCalledTimes(1);
    expect(mergeGuestCartIntoMemberMock).toHaveBeenCalledWith('mbr_new');
    expect(sendAccountExistsEmailMock).toHaveBeenCalledTimes(1);
    expect(sendAccountExistsEmailMock).toHaveBeenCalledWith({
      to: 'patient@example.com',
    });
  });
});
