-- Turn lead callbacks into structured appointment requests without replacing the existing leads
-- table or losing its history. The requested slot remains distinct from the time staff eventually
-- confirm, while member ownership, locale, cancellation, and delivery timestamps let customers
-- manage appointments safely after the initial request.
--
-- Apply this migration once by hand with `pnpm cf:migrate:appointments`. It intentionally uses
-- ALTER TABLE and must never be added to cf:deploy, where a second run would fail on duplicate
-- columns.
ALTER TABLE leads ADD COLUMN email TEXT;
ALTER TABLE leads ADD COLUMN member_id TEXT REFERENCES members(id) ON DELETE SET NULL;
ALTER TABLE leads ADD COLUMN locale TEXT NOT NULL DEFAULT 'th';
ALTER TABLE leads ADD COLUMN requested_date TEXT;
ALTER TABLE leads ADD COLUMN requested_time TEXT;
ALTER TABLE leads ADD COLUMN scheduled_at INTEGER;
ALTER TABLE leads ADD COLUMN duration_minutes INTEGER;
ALTER TABLE leads ADD COLUMN confirmation_sent_at INTEGER;
ALTER TABLE leads ADD COLUMN reminder_sent_at INTEGER;
ALTER TABLE leads ADD COLUMN cancel_token TEXT;
ALTER TABLE leads ADD COLUMN cancelled_at INTEGER;
ALTER TABLE leads ADD COLUMN cancel_reason TEXT;

CREATE INDEX IF NOT EXISTS idx_leads_scheduled_at ON leads (scheduled_at);
CREATE INDEX IF NOT EXISTS idx_leads_member_id ON leads (member_id);
CREATE UNIQUE INDEX IF NOT EXISTS idx_leads_cancel_token ON leads (cancel_token);
