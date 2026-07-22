import { getCloudflareContext } from '@opennextjs/cloudflare';
import type { D1Database } from '@cloudflare/workers-types';
import type { LeadStatus } from './leads';

/**
 * The leads store: appointment/consultation requests from the public booking form. Unlike the
 * other stores there is no code fallback and no `cache` read — leads are always live data, and the
 * only public read is the admin dashboard. The public CREATE path (createLead) is the app's single
 * unauthenticated write, so it lives behind Zod validation + a honeypot in app/api/leads.
 *
 * The status enum lives in lib/leads.ts so client components can import it without this
 * server-only module. See migrations/0006_leads.sql.
 */

export type LeadRow = {
  id: string;
  name: string;
  phone: string;
  interest: string | null;
  preferred_time: string | null;
  message: string | null;
  status: LeadStatus;
  source: string | null;
  created_at: number;
  updated_at: number;
  handled_by: string | null;
};

export type LeadInput = {
  name: string;
  phone: string;
  interest?: string | null;
  preferredTime?: string | null;
  message?: string | null;
  source?: string | null;
};

async function db() {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return (env as unknown as { NEXT_TAG_CACHE_D1?: D1Database }).NEXT_TAG_CACHE_D1 ?? null;
  } catch {
    return null;
  }
}

function requireDb(binding: D1Database | null): asserts binding is D1Database {
  if (!binding) throw new Error('D1 binding NEXT_TAG_CACHE_D1 is not available');
}

/** Record a new lead from the public form. Returns the generated id. */
export async function createLead(input: LeadInput): Promise<string> {
  const binding = await db();
  requireDb(binding);
  const id = `lead-${Date.now().toString(36)}-${idSuffix()}`;
  const now = Date.now();
  await binding
    .prepare(
      `INSERT INTO leads
         (id, name, phone, interest, preferred_time, message, status, source, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, 'new', ?7, ?8, ?8)`,
    )
    .bind(
      id,
      input.name,
      input.phone,
      input.interest ?? null,
      input.preferredTime ?? null,
      input.message ?? null,
      input.source ?? null,
      now,
    )
    .run();
  return id;
}

/** A short non-crypto suffix so two leads in the same millisecond don't collide on id. */
function idSuffix() {
  // Math.random is fine here — this is a uniqueness nudge, not a security token.
  return Math.floor(Math.random() * 1e6).toString(36);
}

/** Every lead, newest first — the admin dashboard. Empty when D1 is unavailable. */
export async function getAllLeads(): Promise<LeadRow[]> {
  const binding = await db();
  if (!binding) return [];
  try {
    const { results } = await binding
      .prepare('SELECT * FROM leads ORDER BY created_at DESC')
      .all<LeadRow>();
    return results;
  } catch {
    return [];
  }
}

/** Move a lead along its pipeline. */
export async function setLeadStatus(id: string, status: LeadStatus, handledBy: string) {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare('UPDATE leads SET status = ?1, updated_at = ?2, handled_by = ?3 WHERE id = ?4')
    .bind(status, Date.now(), handledBy, id)
    .run();
}

/** Remove a lead outright. */
export async function deleteLead(id: string) {
  const binding = await db();
  requireDb(binding);
  await binding.prepare('DELETE FROM leads WHERE id = ?1').bind(id).run();
}
