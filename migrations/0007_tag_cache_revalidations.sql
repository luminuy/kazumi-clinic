-- OpenNext (d1NextTagCache) revalidation store. WITHOUT this table, on-demand ISR
-- revalidation silently does nothing: revalidatePath()/revalidateTag() in a route handler
-- (e.g. /admin เปลี่ยนรูป → app/api/admin/images/route.ts) has nowhere to record the
-- revalidation, so pages keep serving the old KV copy until the time-based `revalidate`
-- window elapses. That is exactly the "เปลี่ยนรูปแล้วหน้าเว็บไม่อัปเดต" bug (2026-07-22).
--
-- The schema MUST match what `@opennextjs/cloudflare`'s d1-next-tag-cache override queries:
-- `SELECT/INSERT tag, revalidatedAt, stale, expire`. The OLD `d1TagCache` used a different
-- 2-column shape (+ a `tags` table) — do NOT use that here; `open-next.config.ts` binds
-- `d1NextTagCache`. This is normally created by `opennextjs-cloudflare populateCache`, which
-- our `cf:deploy` skips (it deploys via `wrangler deploy` directly to avoid workerd on this
-- dev machine), so we own the table here instead. Idempotent — safe to re-run every deploy.
CREATE TABLE IF NOT EXISTS revalidations (
  tag TEXT NOT NULL,
  revalidatedAt INTEGER NOT NULL,
  stale INTEGER,
  expire INTEGER DEFAULT NULL,
  UNIQUE(tag) ON CONFLICT REPLACE
);
