import { jwtVerify } from 'jose';

/**
 * Hand-rolled OAuth for Google (OIDC) and LINE Login. No library — the flow is small and this keeps
 * full control on the Cloudflare Workers runtime. Credentials come ONLY from env (set via
 * `wrangler secret put`); nothing is hardcoded. Each provider is optional: until its keys are
 * present, isConfigured() is false and the start route sends the user back with a clear message.
 *
 * Redirect URIs must be registered with the provider EXACTLY as `${origin}/api/account/oauth/
 * <provider>/callback`, where origin is whatever host served the request (workers.dev today, the
 * real domain later) — so both must be added in the Google/LINE console.
 */

export type OAuthProvider = 'google' | 'line';

export function isOAuthProvider(v: string): v is OAuthProvider {
  return v === 'google' || v === 'line';
}

type OAuthConfig = { clientId: string; clientSecret: string };

/** Reads a provider's credentials from env, or null when either half is missing. */
export function getOAuthConfig(provider: OAuthProvider): OAuthConfig | null {
  const pick = (id?: string, secret?: string): OAuthConfig | null => {
    const clientId = id?.trim();
    const clientSecret = secret?.trim();
    return clientId && clientSecret ? { clientId, clientSecret } : null;
  };
  if (provider === 'google') {
    return pick(process.env.GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);
  }
  return pick(process.env.LINE_CHANNEL_ID, process.env.LINE_CHANNEL_SECRET);
}

export function isConfigured(provider: OAuthProvider): boolean {
  return getOAuthConfig(provider) !== null;
}

/** Which providers are usable right now — for the login/register UI. */
export function configuredProviders(): OAuthProvider[] {
  return (['google', 'line'] as OAuthProvider[]).filter(isConfigured);
}

export function redirectUriFor(origin: string, provider: OAuthProvider): string {
  return `${origin}/api/account/oauth/${provider}/callback`;
}

export function buildAuthUrl(
  provider: OAuthProvider,
  opts: { clientId: string; redirectUri: string; state: string; nonce: string },
): string {
  if (provider === 'google') {
    const p = new URLSearchParams({
      client_id: opts.clientId,
      redirect_uri: opts.redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      state: opts.state,
      nonce: opts.nonce,
      access_type: 'online',
      prompt: 'select_account',
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${p}`;
  }
  const p = new URLSearchParams({
    response_type: 'code',
    client_id: opts.clientId,
    redirect_uri: opts.redirectUri,
    state: opts.state,
    scope: 'profile openid email',
    nonce: opts.nonce,
  });
  return `https://access.line.me/oauth2/v2.1/authorize?${p}`;
}

export type OAuthProfile = {
  providerAccountId: string;
  email: string | null;
  name: string | null;
  avatarUrl: string | null;
};

/**
 * Exchanges the authorization code for tokens and returns the user's profile. Throws on any failure
 * (bad code, provider error, nonce mismatch) — the callback route turns that into an error redirect.
 */
export async function exchangeAndFetchProfile(
  provider: OAuthProvider,
  opts: { config: OAuthConfig; code: string; redirectUri: string; nonce: string },
): Promise<OAuthProfile> {
  return provider === 'google' ? googleProfile(opts) : lineProfile(opts);
}

async function googleProfile(opts: {
  config: OAuthConfig;
  code: string;
  redirectUri: string;
}): Promise<OAuthProfile> {
  const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      code: opts.code,
      client_id: opts.config.clientId,
      client_secret: opts.config.clientSecret,
      redirect_uri: opts.redirectUri,
      grant_type: 'authorization_code',
    }),
  });
  if (!tokenRes.ok) throw new Error('google_token');
  const token = (await tokenRes.json()) as { access_token?: string };
  if (!token.access_token) throw new Error('google_token');

  const infoRes = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { authorization: `Bearer ${token.access_token}` },
  });
  if (!infoRes.ok) throw new Error('google_userinfo');
  const info = (await infoRes.json()) as {
    sub: string;
    email?: string;
    email_verified?: boolean;
    name?: string;
    picture?: string;
  };
  return {
    providerAccountId: info.sub,
    email: info.email && info.email_verified ? info.email : null,
    name: info.name ?? null,
    avatarUrl: info.picture ?? null,
  };
}

async function lineProfile(opts: {
  config: OAuthConfig;
  code: string;
  redirectUri: string;
  nonce: string;
}): Promise<OAuthProfile> {
  const tokenRes = await fetch('https://api.line.me/oauth2/v2.1/token', {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: opts.code,
      redirect_uri: opts.redirectUri,
      client_id: opts.config.clientId,
      client_secret: opts.config.clientSecret,
    }),
  });
  if (!tokenRes.ok) throw new Error('line_token');
  const token = (await tokenRes.json()) as { access_token?: string; id_token?: string };
  if (!token.id_token) throw new Error('line_token');

  // LINE signs the id_token HS256 with the channel secret — verify it (issuer, audience, nonce)
  // rather than trusting the payload, then read the profile straight from the verified claims.
  const { payload } = await jwtVerify(
    token.id_token,
    new TextEncoder().encode(opts.config.clientSecret),
    { issuer: 'https://access.line.me', audience: opts.config.clientId },
  );
  if (payload.nonce !== opts.nonce) throw new Error('line_nonce');

  return {
    providerAccountId: String(payload.sub),
    email: typeof payload.email === 'string' ? payload.email : null,
    name: typeof payload.name === 'string' ? payload.name : null,
    avatarUrl: typeof payload.picture === 'string' ? payload.picture : null,
  };
}
