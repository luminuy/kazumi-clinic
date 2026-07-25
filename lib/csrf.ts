/**
 * Double-submit-cookie CSRF protection for /api/checkout — the one endpoint that both writes
 * customer PII and settles money, so it's worth a token on top of the SameSite=Lax cookie
 * baseline every member/cart route already relies on.
 *
 * The cookie is deliberately NOT httpOnly: the security property here isn't secrecy of the token,
 * it's that only same-origin JS can read `document.cookie` for this site (Same-Origin Policy) —
 * a cross-site attacker can trigger a request that carries the ambient cookie, but can't read its
 * value to also set a matching header, so a forged cross-site POST fails the comparison below.
 */

export const CSRF_COOKIE_NAME = 'csrf_token';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/** Timing-safe-ish equality for two short random tokens (constant-time isn't critical here — the
 *  token isn't a secret an attacker is guessing character-by-character, it's a presence/origin
 *  check — but comparing full-length avoids leaking anything via early-exit timing regardless). */
export function csrfTokensMatch(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}
