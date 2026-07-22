-- Promotions the clinic manages through /admin/promotions. Unlike `service_products`, this is NOT
-- an override layer on top of a hardcoded list: it is the whole source of truth for the offers on
-- /promotions. An empty table means the site shows its "no current promotions" empty state — which
-- is the correct default, since the offers transcribed into lib/promotions.ts are expired templates.
--
-- The code list in lib/promotions.ts stays only as the fallback for environments with no D1 binding
-- (e.g. `next dev` on a machine that can't run workerd), so the page still renders something sane.
--
-- `valid_until` is an inclusive ISO date (YYYY-MM-DD); the public page hides a row once today is
-- past it, so an expired promo drops off on its own without anyone editing the table. `price` and
-- `original_price` are whole baht. `category_slug`, when set, must match a ServiceCategory.slug.
CREATE TABLE IF NOT EXISTS promotions (
  id             TEXT PRIMARY KEY NOT NULL,
  name           TEXT NOT NULL,
  detail         TEXT,
  price          INTEGER NOT NULL,
  original_price INTEGER,
  note           TEXT,
  valid_until    TEXT NOT NULL,
  category_slug  TEXT,
  sort_order     INTEGER NOT NULL DEFAULT 0,
  updated_at     INTEGER NOT NULL,
  updated_by     TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_promotions_sort ON promotions (sort_order);
