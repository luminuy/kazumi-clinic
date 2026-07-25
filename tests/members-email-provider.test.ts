import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

/**
 * lib/members/password-reset.ts talks to Resend over plain `fetch` — no SDK, matching the house
 * style of lib/cloudinary-upload.ts. These tests mock `fetch` and check the request Resend actually
 * receives, plus that every failure mode maps to a delivery status instead of throwing: both
 * callers (app/api/account/{forgot-password,register}/route.ts) rely on a delivery fault never
 * changing their response shape, since that response doubles as an account-existence signal.
 *
 * What this file cannot prove: whether Resend actually delivers a real email. That needs a real
 * API key and a verified sending domain, neither of which exists yet — see docs/member-system.md.
 */

const fetchMock = vi.fn();

beforeEach(() => {
  vi.stubGlobal('fetch', fetchMock);
  fetchMock.mockReset();
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.unstubAllEnvs();
});

async function freshModule() {
  vi.resetModules();
  return import('@/lib/members/password-reset');
}

describe('isEmailConfigured', () => {
  it('is false with neither env var set', async () => {
    const { isEmailConfigured } = await freshModule();
    expect(isEmailConfigured()).toBe(false);
  });

  it('is false with only the API key set', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    const { isEmailConfigured } = await freshModule();
    expect(isEmailConfigured()).toBe(false);
  });

  it('is false with only the from address set', async () => {
    vi.stubEnv('RESEND_FROM_EMAIL', 'Kazumi Clinic <noreply@kazumiclinic.com>');
    const { isEmailConfigured } = await freshModule();
    expect(isEmailConfigured()).toBe(false);
  });

  it('is true once both are set', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'Kazumi Clinic <noreply@kazumiclinic.com>');
    const { isEmailConfigured } = await freshModule();
    expect(isEmailConfigured()).toBe(true);
  });
});

describe('sendPasswordResetEmail — not configured', () => {
  it('returns not_configured and never calls fetch', async () => {
    const { sendPasswordResetEmail } = await freshModule();

    const result = await sendPasswordResetEmail({
      to: 'patient@example.com',
      resetUrl: 'https://kazumi-clinic.bankjack10452.workers.dev/account/reset-password?token=abc',
      locale: 'th',
    });

    expect(result).toEqual({ status: 'not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('sendPasswordResetEmail — configured', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'Kazumi Clinic <noreply@kazumiclinic.com>');
  });

  it('POSTs to Resend with the bearer key, from address, recipient and reset URL', async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ id: 'email_1' }), { status: 200 }));
    const { sendPasswordResetEmail } = await freshModule();

    const resetUrl =
      'https://kazumi-clinic.bankjack10452.workers.dev/account/reset-password?token=abc';
    const result = await sendPasswordResetEmail({ to: 'patient@example.com', resetUrl, locale: 'th' });

    expect(result).toEqual({ status: 'sent' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('https://api.resend.com/emails');
    expect(init.method).toBe('POST');
    expect(init.headers).toMatchObject({
      Authorization: 'Bearer re_test_key',
      'content-type': 'application/json',
    });
    const body = JSON.parse(init.body as string);
    expect(body.from).toBe('Kazumi Clinic <noreply@kazumiclinic.com>');
    expect(body.to).toBe('patient@example.com');
    expect(body.text).toContain(resetUrl);
  });

  it('sends Thai copy by default and English copy for locale "en"', async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const { sendPasswordResetEmail } = await freshModule();

    await sendPasswordResetEmail({ to: 'a@example.com', resetUrl: 'https://x/reset', locale: 'th' });
    const thBody = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(thBody.subject).toBe('ตั้งรหัสผ่านใหม่สำหรับบัญชี Kazumi Clinic');

    await sendPasswordResetEmail({ to: 'a@example.com', resetUrl: 'https://x/reset', locale: 'en' });
    const enBody = JSON.parse((fetchMock.mock.calls[1][1] as RequestInit).body as string);
    expect(enBody.subject).toBe('Reset your Kazumi Clinic password');
  });

  it('resolves to failed — never throws — on a non-2xx response, without logging the body', async () => {
    const errorText = vi.fn(async () => JSON.stringify({ message: 'patient@example.com bounced' }));
    fetchMock.mockResolvedValue({ ok: false, status: 422, text: errorText } as unknown as Response);
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
    const { sendPasswordResetEmail } = await freshModule();

    const result = await sendPasswordResetEmail({
      to: 'patient@example.com',
      resetUrl: 'https://x/reset',
      locale: 'th',
    });

    expect(result).toEqual({ status: 'failed' });
    // The error body would echo the recipient address back — it must never be read or logged.
    expect(errorText).not.toHaveBeenCalled();
    for (const call of errorSpy.mock.calls) {
      expect(call.join(' ')).not.toContain('patient@example.com');
    }
    errorSpy.mockRestore();
  });

  it('resolves to failed — never throws — when fetch itself rejects', async () => {
    fetchMock.mockRejectedValue(new TypeError('network unreachable'));
    vi.spyOn(console, 'error').mockImplementation(() => {});
    const { sendPasswordResetEmail } = await freshModule();

    await expect(
      sendPasswordResetEmail({ to: 'a@example.com', resetUrl: 'https://x/reset', locale: 'th' }),
    ).resolves.toEqual({ status: 'failed' });
  });
});

describe('sendAccountExistsEmail', () => {
  it('returns not_configured without calling fetch when unconfigured', async () => {
    const { sendAccountExistsEmail } = await freshModule();

    await expect(
      sendAccountExistsEmail({ to: 'patient@example.com', locale: 'th' }),
    ).resolves.toEqual({ status: 'not_configured' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('sends the localized accountExists subject/body Resend', async () => {
    vi.stubEnv('RESEND_API_KEY', 're_test_key');
    vi.stubEnv('RESEND_FROM_EMAIL', 'Kazumi Clinic <noreply@kazumiclinic.com>');
    fetchMock.mockResolvedValue(new Response(null, { status: 200 }));
    const { sendAccountExistsEmail } = await freshModule();

    const result = await sendAccountExistsEmail({ to: 'patient@example.com', locale: 'en' });

    expect(result).toEqual({ status: 'sent' });
    const body = JSON.parse((fetchMock.mock.calls[0][1] as RequestInit).body as string);
    expect(body.subject).toBe('Someone tried to register with your email');
    expect(body.to).toBe('patient@example.com');
  });
});
