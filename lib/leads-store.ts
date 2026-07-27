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
  email: string | null;
  member_id: string | null;
  locale: 'th' | 'en';
  interest: string | null;
  preferred_time: string | null;
  requested_date: string | null;
  requested_time: string | null;
  scheduled_at: number | null;
  duration_minutes: number | null;
  confirmation_sent_at: number | null;
  reminder_sent_at: number | null;
  cancel_token: string | null;
  cancelled_at: number | null;
  cancel_reason: string | null;
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
  locale: 'th' | 'en';
  email?: string | null;
  memberId?: string | null;
  interest?: string | null;
  preferredTime?: string | null;
  requestedDate?: string | null;
  requestedTime?: string | null;
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
         (id, name, phone, email, member_id, locale, interest, preferred_time, requested_date,
          requested_time, message, status, source, created_at, updated_at)
       VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, 'new', ?12, ?13, ?13)`,
    )
    .bind(
      id,
      input.name,
      input.phone,
      input.email ?? null,
      input.memberId ?? null,
      input.locale,
      input.interest ?? null,
      input.preferredTime ?? null,
      input.requestedDate ?? null,
      input.requestedTime ?? null,
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

/**
 * The most recent leads, newest first — the admin dashboard. Empty when D1 is unavailable.
 *
 * Capped rather than truly paginated: LeadsDashboard (components/admin/leads-dashboard.tsx) does
 * client-side status filtering over the full array it's given, with per-status tab counts computed
 * from that same array — real pagination would mean fetching status counts separately from the
 * page of rows, which is a bigger change than this needed. A cap at least keeps the query and the
 * page payload from growing without bound as leads accumulate; older leads stay in D1, just not
 * reachable from this dashboard once past the cap. Revisit with real pagination if that matters.
 */
const LEADS_QUERY_LIMIT = 500;

export async function getAllLeads(): Promise<LeadRow[]> {
  const binding = await db();
  if (!binding) return [];
  try {
    const { results } = await binding
      .prepare('SELECT * FROM leads ORDER BY created_at DESC LIMIT ?1')
      .bind(LEADS_QUERY_LIMIT)
      .all<LeadRow>();
    return results;
  } catch {
    return [];
  }
}

/** How many leads are still in the `new` state — the sidebar/dashboard "needs attention" badge. */
export async function countNewLeads(): Promise<number> {
  const binding = await db();
  if (!binding) return 0;
  try {
    const row = await binding
      .prepare("SELECT COUNT(*) AS n FROM leads WHERE status = 'new'")
      .first<{ n: number }>();
    return row?.n ?? 0;
  } catch {
    return 0;
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

/** Returns one row so cancellation routes can enforce ownership before mutating it. */
export async function findLeadById(id: string): Promise<LeadRow | null> {
  const binding = await db();
  if (!binding) return null;
  return binding.prepare('SELECT * FROM leads WHERE id = ?1').bind(id).first<LeadRow>();
}

/** Keeps confirmation state and its staff audit identity in the same update. */
export async function scheduleLead(params: {
  id: string;
  scheduledAt: number;
  durationMinutes: number;
  handledBy: string;
}): Promise<LeadRow | null> {
  const binding = await db();
  requireDb(binding);
  return binding
    .prepare(
      `UPDATE leads
       SET status = 'booked', scheduled_at = ?1, duration_minutes = ?2, updated_at = ?3,
           handled_by = ?4
       WHERE id = ?5
       RETURNING *`,
    )
    .bind(
      params.scheduledAt,
      params.durationMinutes,
      Date.now(),
      params.handledBy,
      params.id,
    )
    .first<LeadRow>();
}

/** Surfaces possible double-bookings for staff review without blocking multi-room scheduling. */
export async function findConflictingLeads(params: {
  scheduledAt: number;
  durationMinutes: number;
  excludeId?: string;
}): Promise<LeadRow[]> {
  const binding = await db();
  requireDb(binding);
  const end = params.scheduledAt + params.durationMinutes * 60_000;
  const { results } = await binding
    .prepare(
      `SELECT * FROM leads
       WHERE status = 'booked'
         AND scheduled_at IS NOT NULL
         AND scheduled_at < ?1
         AND scheduled_at + (COALESCE(duration_minutes, 60) * 60000) > ?2
         AND (?3 IS NULL OR id <> ?3)
       ORDER BY scheduled_at ASC`,
    )
    .bind(end, params.scheduledAt, params.excludeId ?? null)
    .all<LeadRow>();
  return results;
}

/** Preserves a cancellation audit trail instead of deleting an appointment customers may reference. */
export async function cancelLeadById(params: {
  id: string;
  reason?: string | null;
  cancelledBy: string;
}): Promise<LeadRow | null> {
  const binding = await db();
  requireDb(binding);
  const now = Date.now();
  return binding
    .prepare(
      `UPDATE leads
       SET status = 'cancelled', cancelled_at = ?1, cancel_reason = ?2, updated_at = ?1,
           handled_by = ?3
       WHERE id = ?4
       RETURNING *`,
    )
    .bind(now, params.reason ?? null, params.cancelledBy, params.id)
    .first<LeadRow>();
}

/** Resolves opaque guest links without exposing sequential lead identifiers. */
export async function findLeadByCancelToken(token: string): Promise<LeadRow | null> {
  const binding = await db();
  if (!binding) return null;
  return binding
    .prepare('SELECT * FROM leads WHERE cancel_token = ?1')
    .bind(token)
    .first<LeadRow>();
}

function randomCancelToken(): string {
  const bytes = crypto.getRandomValues(new Uint8Array(32));
  let token = '';
  for (const byte of bytes) token += byte.toString(16).padStart(2, '0');
  return token;
}

/** Creates a stable guest credential once so later confirmation emails can safely reuse it. */
export async function ensureCancelToken(id: string): Promise<string> {
  const binding = await db();
  requireDb(binding);
  const existing = await binding
    .prepare('SELECT cancel_token FROM leads WHERE id = ?1')
    .bind(id)
    .first<{ cancel_token: string | null }>();
  if (!existing) throw new Error('Lead not found');
  if (existing.cancel_token) return existing.cancel_token;

  const token = randomCancelToken();
  await binding
    .prepare('UPDATE leads SET cancel_token = ?1, updated_at = ?2 WHERE id = ?3 AND cancel_token IS NULL')
    .bind(token, Date.now(), id)
    .run();
  const row = await binding
    .prepare('SELECT cancel_token FROM leads WHERE id = ?1')
    .bind(id)
    .first<{ cancel_token: string | null }>();
  if (!row?.cancel_token) throw new Error('Unable to create cancellation token');
  return row.cancel_token;
}

/** Prioritizes upcoming confirmed visits while retaining unscheduled requests in recent-first order. */
export async function getLeadsForMember(memberId: string): Promise<LeadRow[]> {
  const binding = await db();
  if (!binding) return [];
  const now = Date.now();
  const { results } = await binding
    .prepare(
      `SELECT * FROM leads
       WHERE member_id = ?1
       ORDER BY
         CASE
           WHEN scheduled_at >= ?2 THEN 0
           WHEN scheduled_at IS NULL THEN 1
           ELSE 2
         END,
         CASE WHEN scheduled_at >= ?2 THEN scheduled_at END ASC,
         created_at DESC`,
    )
    .bind(memberId, now)
    .all<LeadRow>();
  return results;
}

/** Selects each due reminder once so an hourly worker can retry safely without duplicate mail. */
export async function getLeadsNeedingReminder(
  windowStart: number,
  windowEnd: number,
): Promise<LeadRow[]> {
  const binding = await db();
  requireDb(binding);
  const { results } = await binding
    .prepare(
      `SELECT * FROM leads
       WHERE status = 'booked'
         AND scheduled_at >= ?1
         AND scheduled_at < ?2
         AND reminder_sent_at IS NULL
       ORDER BY scheduled_at ASC`,
    )
    .bind(windowStart, windowEnd)
    .all<LeadRow>();
  return results;
}

/** Records reminder completion so later cron windows cannot send the same notice again. */
export async function markReminderSent(id: string): Promise<void> {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare('UPDATE leads SET reminder_sent_at = ?1, updated_at = ?1 WHERE id = ?2')
    .bind(Date.now(), id)
    .run();
}

/** Records successful confirmation handling separately from appointment scheduling. */
export async function markConfirmationSent(id: string): Promise<void> {
  const binding = await db();
  requireDb(binding);
  await binding
    .prepare('UPDATE leads SET confirmation_sent_at = ?1, updated_at = ?1 WHERE id = ?2')
    .bind(Date.now(), id)
    .run();
}

/** Remove a lead outright. */
export async function deleteLead(id: string) {
  const binding = await db();
  requireDb(binding);
  await binding.prepare('DELETE FROM leads WHERE id = ?1').bind(id).run();
}
