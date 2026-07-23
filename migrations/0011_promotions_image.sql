-- Make price optional and add image_public_id
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

INSERT INTO promotions_new (id, name, detail, price, original_price, note, valid_until, category_slug, sort_order, updated_at, updated_by)
SELECT id, name, detail, price, original_price, note, valid_until, category_slug, sort_order, updated_at, updated_by
FROM promotions;

DROP TABLE promotions;
ALTER TABLE promotions_new RENAME TO promotions;

CREATE INDEX IF NOT EXISTS idx_promotions_sort ON promotions (sort_order);
