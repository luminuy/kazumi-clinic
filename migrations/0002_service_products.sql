-- Products the clinic manages through /admin. Same override philosophy as `site_images`: a row
-- here is a DELTA on top of the hardcoded catalogue in lib/services.ts, so an empty table means
-- the site renders exactly the products compiled into the code — creating it changes nothing.
--
-- `id` matches ServiceItem.id in lib/services.ts. Three kinds of row live here:
--   • an EDIT of a hardcoded product        → id equals the code's id, `deleted` = 0
--   • a brand-NEW product the clinic added  → id the admin generated, not in the code
--   • a DELETE of a hardcoded product        → the row exists only to carry `deleted` = 1
--
-- A row is self-contained: when the clinic edits a product the admin writes every field, so the
-- public merge can take the row wholesale rather than diffing it against the code.
--
-- `category` must match a ServiceCategory.slug — the category structure itself stays in code.
-- `benefits` is a JSON array of strings (or NULL). `price_from` NULL renders as "สอบถามราคา".
-- `sort_order` orders products within their category; the merge falls back to the code's order
-- for hardcoded products that have no row.
CREATE TABLE IF NOT EXISTS service_products (
  id              TEXT PRIMARY KEY NOT NULL,
  category        TEXT NOT NULL,
  name            TEXT NOT NULL,
  detail          TEXT,
  tagline         TEXT,
  benefits        TEXT,
  collection      TEXT,
  price_from      INTEGER,
  unit            TEXT NOT NULL DEFAULT 'ครั้ง',
  image_public_id TEXT,
  sort_order      INTEGER NOT NULL DEFAULT 0,
  deleted         INTEGER NOT NULL DEFAULT 0,
  updated_at      INTEGER NOT NULL,
  updated_by      TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_service_products_category ON service_products (category, sort_order);
