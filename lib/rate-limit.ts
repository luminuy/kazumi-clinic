import { memberDb } from '@/lib/members/db';
import type { NextRequest } from 'next/server';

/**
 * Fixed-window rate limiting on D1 (the same binding the rest of the app uses). Each (bucket,
 * identifier, window) is one row whose count is bumped atomically; over the limit → denied.
 *
 * FAIL OPEN: when D1 is unavailable (local `next dev`, CI) the limiter allows the request rather
 * than locking everyone out — the DB-absent case is a dev/test artifact, not an attack. In
 * production the binding is always present, so the limit is enforced where it matters.
 *
 * Fixed-window is approximate (a burst straddling a window boundary can briefly exceed the limit),
 * which is fine for the goal here: blunting brute-force / spam, not metering. Cloudflare already
 * absorbs volumetric abuse upstream.
 */

export type RateRule = { limit: number; windowSec: number };

/** The client IP as Cloudflare sees it; `unknown` groups the rare header-less request together. */
export function clientIp(request: NextRequest): string {
  return request.headers.get('cf-connecting-ip')?.trim() || 'unknown';
}

/** Returns true when the request is ALLOWED, false when it is over the limit. */
export async function rateLimit(
  bucket: string,
  identifier: string,
  rule: RateRule,
): Promise<boolean> {
  const db = await memberDb();
  if (!db) return true; // fail open — see file header

  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - (now % rule.windowSec);
  const key = `${bucket}:${identifier}:${windowStart}`;
  const expiresAt = windowStart + rule.windowSec;

  try {
    const row = await db
      .prepare(
        `INSERT INTO rate_limits (key, count, expires_at) VALUES (?1, 1, ?2)
         ON CONFLICT(key) DO UPDATE SET count = count + 1
         RETURNING count`,
      )
      .bind(key, expiresAt)
      .first<{ count: number }>();

    // Best-effort GC of expired rows so the table can't grow unbounded; ~1% of calls, non-blocking.
    if (Math.random() < 0.01) {
      db.prepare('DELETE FROM rate_limits WHERE expires_at < ?1').bind(now).run().catch(() => {});
    }

    return (row?.count ?? 1) <= rule.limit;
  } catch {
    return true; // a limiter fault must never take down the endpoint it protects
  }
}
