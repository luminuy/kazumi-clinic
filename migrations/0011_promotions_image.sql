-- Make price optional and add image_public_id.
--
-- ⚠️ ONE-TIME ONLY. This rebuilds the promotions table (DROP + recreate) and the copy below does
-- NOT carry image_public_id (the source table has no such column at this point). It MUST NOT be
-- wired into cf:deploy: running it a second time — when the table already has posters — drops them
-- all. That is exactly what happened (removed from cf:deploy 2026-07-24). Already applied to
-- production; kept only as historical record. Fresh DBs run migrations once, in order, by hand.
CREATE TABLE IF NOT EXISTS promotions_new (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  detail         TEXT,
  price          INTEGER,
  original_price INTEGER,
  note           TEXT,
  valid_until    TEXT NOT NULL,
  category_slug  TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  updated_at     INTEGER NOT NULL,
  updated_by     TEXT NOT NULL,
  image_public_id TEXT
);

-- NB: the source table (from 0003) has no image_public_id yet, so it is intentionally not copied —
-- the new column starts NULL. This is exactly why re-running the migration is destructive: on a
-- second run the source DOES have image_public_id and this copy would drop it. One-time only.
INSERT INTO promotions_new (id, name, detail, price, original_price, note, valid_until, category_slug, sort_order, updated_at, updated_by)
SELECT id, name, detail, price, original_price, note, valid_until, category_slug, sort_order, updated_at, updated_by
FROM promotions;

DROP TABLE promotions;
ALTER TABLE promotions_new RENAME TO promotions;

CREATE INDEX IF NOT EXISTS idx_promotions_sort ON promotions (sort_order);
