import { createRemoteJWKSet, jwtVerify } from 'jose';

/**
 * Cloudflare Access guards /admin. Access authenticates the user at Cloudflare's edge and
 * forwards a signed JWT in `Cf-Access-Jwt-Assertion`; we verify that signature ourselves rather
 * than trusting the header, because a request that reaches the Worker without going through
 * Access (e.g. straight to the *.workers.dev hostname) can set any header it likes.
 *
 * FAIL CLOSED: if the Access env vars are missing the verification throws, and the caller turns
 * that into a 404. An unconfigured deploy therefore has no admin at all, rather than an open one
 * — the opposite failure mode is a stranger editing a medical clinic's website.
 */

export type AdminIdentity = { email: string };

/** Set both via `wrangler secret put` (or vars) before /admin will answer at all. */
type AccessConfig = { teamDomain: string; aud: string };

function readConfig(): AccessConfig | null {
  const teamDomain = process.env.CF_ACCESS_TEAM_DOMAIN?.trim();
  const aud = process.env.CF_ACCESS_AUD?.trim();
  if (!teamDomain || !aud) return null;
  return { teamDomain: teamDomain.replace(/\/+$/, ''), aud };
}

// jose caches the fetched keys internally, so this is created once per isolate rather than
// per request — Cloudflare rotates Access signing keys and the set refreshes on its own.
let jwks: ReturnType<typeof createRemoteJWKSet> | null = null;
let jwksTeamDomain: string | null = null;

function keySet(teamDomain: string) {
  if (!jwks || jwksTeamDomain !== teamDomain) {
    jwks = createRemoteJWKSet(new URL(`${teamDomain}/cdn-cgi/access/certs`));
    jwksTeamDomain = teamDomain;
  }
  return jwks;
}

/**
 * Returns the signed-in admin, or null when the request isn't a valid Access session —
 * including when Access simply isn't configured yet. Never throws: callers treat null as "no
 * admin here" so a misconfiguration can't surface as a 500 that leaks the route's existence.
 */
export async function verifyAdmin(jwt: string | null | undefined): Promise<AdminIdentity | null> {
  const config = readConfig();
  if (!config || !jwt) return null;

  try {
    const { payload } = await jwtVerify(jwt, keySet(config.teamDomain), {
      issuer: config.teamDomain,
      audience: config.aud,
    });
    const email = typeof payload.email === 'string' ? payload.email : null;
    return email ? { email } : null;
  } catch {
    return null;
  }
}

/** Header Cloudflare Access puts the signed identity in. */
export const ACCESS_JWT_HEADER = 'cf-access-jwt-assertion';

/**
 * Cookie Access also stores the same signed JWT in, scoped to the whole hostname (Path=/).
 * Access only injects ACCESS_JWT_HEADER on requests it actually proxies, so a browser fetch to a
 * path the Access application doesn't cover (e.g. /api/admin/* when the app is scoped to /admin)
 * arrives without the header — but still carries this cookie. Verifying it is just as safe: the
 * signature is checked against Cloudflare's JWKS either way, so a forged cookie can't pass.
 */
export const ACCESS_COOKIE_NAME = 'CF_Authorization';

/** True when the deploy has Access wired up at all — used to explain the 404 in logs/UI. */
export function isAccessConfigured() {
  return readConfig() !== null;
}
