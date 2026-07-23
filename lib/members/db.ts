import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';

/**
 * The member system reuses the app's single D1 database — the same binding every other store uses
 * (see lib/leads-store.ts). It is deliberately NOT the tag cache's *purpose*, but Cloudflare gives
 * the account one D1 and OpenNext already binds it as NEXT_TAG_CACHE_D1, so all app tables live
 * there together (leads, site_images, members, carts, orders…).
 *
 * Returns null when the binding is unavailable — which is the case under `next dev` on a machine
 * that can't run workerd. Callers must handle null (throw a clear error on writes, fall back to an
 * empty result on reads) so a local dev session degrades instead of crashing.
 */
export async function memberDb(): Promise<D1Database | null> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

/** Narrows a nullable binding to a live one, throwing a clear error for write paths. */
export function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) {
    throw new Error(
      'D1 is not available (NEXT_TAG_CACHE_D1). The member system needs a deployed Cloudflare ' +
        'environment; it cannot persist under local `next dev` on this machine.',
    );
  }
}

/** Short, URL-safe random id with a human-readable prefix, e.g. `mbr_l3k9f2a1b`. */
export function newId(prefix: string): string {
  const bytes = crypto.getRandomValues(new Uint8Array(9));
  let s = '';
  for (const b of bytes) s += b.toString(36).padStart(2, '0');
  return `${prefix}_${s.slice(0, 12)}`;
}
