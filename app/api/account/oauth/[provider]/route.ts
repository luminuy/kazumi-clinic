import { NextResponse, type NextRequest } from 'next/server';
import {
  isOAuthProvider,
  getOAuthConfig,
  buildAuthUrl,
  redirectUriFor,
} from '@/lib/members/oauth';
import { rateLimit, clientIp } from '@/lib/rate-limit';

// Starts an OAuth login: builds the provider's authorization URL, stashes a CSRF `state` + `nonce`
// (and the post-login `next` path) in a short-lived HttpOnly cookie, then redirects to the provider.
// If the provider isn't configured yet, bounce back to /account/login with a clear error code.

const OAUTH_COOKIE = 'kz_oauth';

function randomHex(bytes: number): string {
  const arr = crypto.getRandomValues(new Uint8Array(bytes));
  return [...arr].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ provider: string }> },
) {
  const { provider } = await params;
  const origin = new URL(request.url).origin;
  const loginUrl = `${origin}/account/login`;

  // Abuse guard on the redirect-initiation endpoint: 30 starts per IP per 5 minutes.
  if (!(await rateLimit('oauth', clientIp(request), { limit: 30, windowSec: 300 }))) {
    return NextResponse.redirect(`${loginUrl}?error=rate_limited`);
  }

  if (!isOAuthProvider(provider)) {
    return NextResponse.redirect(`${loginUrl}?error=oauth_unknown`);
  }
  const config = getOAuthConfig(provider);
  if (!config) {
    return NextResponse.redirect(`${loginUrl}?error=oauth_not_configured`);
  }

  const state = randomHex(16);
  const nonce = randomHex(16);
  const nextParam = request.nextUrl.searchParams.get('next');
  const next = nextParam && nextParam.startsWith('/') ? nextParam : '/account';

  const authUrl = buildAuthUrl(provider, {
    clientId: config.clientId,
    redirectUri: redirectUriFor(origin, provider),
    state,
    nonce,
  });

  const res = NextResponse.redirect(authUrl);
  res.cookies.set(OAUTH_COOKIE, JSON.stringify({ provider, state, nonce, next }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600, // 10 minutes to complete the round-trip
  });
  return res;
}
