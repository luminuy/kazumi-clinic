-- Gives blog posts a soft-delete/restore path, matching service_products/promotions. Before this,
-- "ลบ" on a post was a hard DELETE with no undo — `published = 0` already lets a post be hidden
-- as a draft, but there was no way back once actually deleted.
-- Applied once to the remote D1 by hand like 0008/0012/0015/0016 — NOT wired into cf:deploy,
-- because `ALTER TABLE ADD COLUMN` is not idempotent and would fail on the second deploy.
ALTER TABLE posts ADD COLUMN deleted INTEGER NOT NULL DEFAULT 0;
