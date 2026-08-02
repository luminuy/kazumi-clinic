-- Gives promotions a soft-delete/restore path, matching service_products (which already has
-- `deleted`). Before this, "ลบ" on a promotion was a hard DELETE with no undo — the only other
-- way a promo left the public list was its valid_until date passing, which isn't the same thing
-- as the clinic manually hiding one that hasn't expired yet.
-- Applied once to the remote D1 by hand like 0008/0012/0015 — NOT wired into cf:deploy, because
-- `ALTER TABLE ADD COLUMN` is not idempotent and would fail on the second deploy.
ALTER TABLE promotions ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0;
