-- Appointment / consultation requests submitted through the public booking form on /contact. This
-- is the ONE table written by an unauthenticated endpoint (POST /api/leads) — every other write in
-- the app goes through the Cloudflare-Access-gated /api/admin/*. The public write is validated with
-- Zod and shielded by a honeypot field; the admin reads and manages rows through /admin/leads.
--
-- `status` moves new → contacted → booked → closed as the clinic works a lead. `interest` is a free
-- string (a service the visitor picked, or their own words). No medical data is collected — just
-- contact details and a preferred time, so the clinic can call the person back.
CREATE TABLE IF NOT EXISTS leads (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  phone          TEXT NOT NULL,
  interest       TEXT,
  preferred_time TEXT,
  message        TEXT,
  status         TEXT NOT NULL DEFAULT 'new',
  source         TEXT,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL,
  handled_by     TEXT
);

CREATE INDEX IF NOT EXISTS idx_leads_created ON leads (created_at);
CREATE INDEX IF NOT EXISTS idx_leads_status ON leads (status);
