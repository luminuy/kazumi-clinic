import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';

const secretKey = process.env.SESSION_SECRET || 'default-secret-key-for-development-please-change';
const key = new TextEncoder().encode(secretKey);

export type UserSessionPayload = {
  userId: string;
  email: string;
  name: string;
  avatarUrl: string;
};

export async function encrypt(payload: UserSessionPayload) {
  return await new SignJWT(payload as any)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('30d')
    .sign(key);
}

export async function decrypt(input: string): Promise<UserSessionPayload | null> {
  try {
    const { payload } = await jwtVerify(input, key, {
      algorithms: ['HS256'],
    });
    return payload as unknown as UserSessionPayload;
  } catch (error) {
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
