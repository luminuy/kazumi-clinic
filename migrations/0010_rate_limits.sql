-- Fixed-window rate limiting (see lib/rate-limit.ts). One row per (bucket, identifier, window);
-- count bumped atomically on each request. Idempotent so it is safe to run on every deploy.
CREATE TABLE IF NOT EXISTS rate_limits (
  key TEXT PRIMARY KEY,
  count INTEGER NOT NULL DEFAULT 0,
  expires_at INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_rate_limits_expires ON rate_limits (expires_at);
