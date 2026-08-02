-- Gives reviews a soft-delete/restore path, matching service_products/promotions/posts. Before
-- this, "ลบ" on a review was a hard DELETE with no undo — `published`/`consent` already let a
-- review be hidden without deleting it, but there was no way back once actually deleted.
-- Applied once to the remote D1 by hand like 0008/0012/0015/0016/0017 — NOT wired into
-- cf:deploy, because `ALTER TABLE ADD COLUMN` is not idempotent and would fail on the second deploy.
ALTER TABLE reviews ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0;
