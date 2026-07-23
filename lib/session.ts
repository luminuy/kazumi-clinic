import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

// The signing key for member session cookies. A hardcoded fallback used to stand in when
// SESSION_SECRET was missing, which meant production silently signed sessions with a string
// committed to git — anyone able to read the repo could mint a session for any member. Production
// now refuses to sign at all rather than sign with a known key.
//
// Resolved per call, not at module load: a throw at import time would take down `next build` and CI,
// where SESSION_SECRET legitimately does not exist.
const DEV_FALLBACK_SECRET = 'insecure-dev-only-secret-never-used-in-production';

function sessionKey() {
  const secret = process.env.SESSION_SECRET?.trim();
  if (secret) return new TextEncoder().encode(secret);

  if (process.env.NODE_ENV === 'production') {
    throw new Error(
      'SESSION_SECRET is not set. Refusing to sign or verify session tokens with a known key — ' +
        'set it with `npx wrangler secret put SESSION_SECRET` and redeploy.',
    );
  }
  return new TextEncoder().encode(DEV_FALLBACK_SECRET);
}

export type UserSessionPayload = {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
};

export async function encrypt(payload: UserSessionPayload) {
  return await new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(sessionKey());
}

export async function decrypt(input: string): Promise<UserSessionPayload | null> {
  const key = sessionKey(); // outside the try: a missing SESSION_SECRET is a config fault, not a
  // bad cookie, and must not be swallowed into a silent "logged out"
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserSessionPayload;
  } catch {
    return null;
  }
}

export async function getSession() {
  const cookieStore = await cookies();
  const session = cookieStore.get('user_session')?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function setSession(payload: UserSessionPayload) {
  const session = await encrypt(payload);
  const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
  const cookieStore = await cookies();
  cookieStore.set('user_session', session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
  });
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete('user_session');
}
