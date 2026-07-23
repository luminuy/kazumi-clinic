import { NextResponse, type NextRequest } from 'next/server';
import {
  isOAuthProvider,
  getOAuthConfig,
  redirectUriFor,
  exchangeAndFetchProfile,
} from '@/lib/members/oauth';
import { upsertOAuthMember } from '@/lib/members/store';
import { createSession } from '@/lib/members/session';
import { mergeGuestCartIntoMember } from '@/lib/members/cart';

// OAuth callback: verify the CSRF state against the cookie, exchange the code, upsert the member,
// start a session, merge any guest cart, then land on the post-login `next` path. Every failure
// funnels back to /account/login with an error code rather than exposing a stack.

const OAUTH_COOKIE = 'kz_oauth';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const origin = new URL(request.url).origin;
  const loginError = (code: string) =>
    NextResponse.redirect(`${origin}/account/login?error=${code}`);

  if (!isOAuthProvider(provider)) return loginError('oauth_unknown');

  const cookieRaw = request.cookies.get(OAUTH_COOKIE)?.value;
  let stored: { provider?: string; state?: string; nonce?: string; next?: string } | null = null;
  try {
    stored = cookieRaw ? JSON.parse(cookieRaw) : null;
  } catch {
    stored = null;
  }

  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  // CSRF: the returned state must match the one we set, for this same provider.
  if (
    !stored ||
    stored.provider !== provider ||
    !stored.state ||
    !state ||
    state !== stored.state ||
    !code
  ) {
    return loginError('oauth_state');
  }

  const config = getOAuthConfig(provider);
  if (!config) return loginError('oauth_not_configured');

  try {
    const profile = await exchangeAndFetchProfile(provider, {
      config,
      code,
      redirectUri: redirectUriFor(origin, provider),
      nonce: stored.nonce ?? '',
    });
    const member = await upsertOAuthMember({
      provider,
      providerAccountId: profile.providerAccountId,
      email: profile.email,
      name: profile.name,
      avatarUrl: profile.avatarUrl,
    });
    await createSession(member.id, request.headers.get('user-agent'));
    await mergeGuestCartIntoMember(member.id);

    const next = stored.next && stored.next.startsWith('/') ? stored.next : '/account';
    const res = NextResponse.redirect(`${origin}${next}`);
    res.cookies.set(OAUTH_COOKIE, '', { path: '/', maxAge: 0 });
    return res;
  } catch {
    return loginError('oauth_failed');
  }
}
