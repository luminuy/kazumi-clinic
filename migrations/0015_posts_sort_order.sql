-- Gives blog posts manual ordering, matching service_products/promotions/reviews (which already
-- have sort_order). Before this, /admin/blog had no reorder controls at all — the admin list
-- just followed `updated_at DESC`, so there was no way to arrange articles deliberately.
-- Applied once to the remote D1 by hand like 0008/0012 — NOT wired into cf:deploy, because
-- `ALTER TABLE ADD COLUMN` is not idempotent and would fail on the second deploy.
ALTER TABLE posts ADD COLUMN sort_order INTEGER NOT NULL DEFAULT 0;
CREATE INDEX IF NOT EXISTS idx_posts_sort ON posts (sort_order);
