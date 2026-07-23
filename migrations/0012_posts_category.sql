-- Add an optional service-category tag to blog posts so /blog can offer a working category filter
-- (the tabs were previously static and did nothing). `category` holds a serviceCategories slug
-- (lib/services.ts) or NULL for an uncategorised post. Applied once to the remote D1 by hand like
-- 0008_add_en_columns.sql — NOT wired into cf:deploy, because `ALTER TABLE ADD COLUMN` is not
-- idempotent and would fail on the second deploy.
ALTER TABLE posts ADD COLUMN category TEXT;
