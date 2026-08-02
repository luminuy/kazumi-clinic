-- One shared gallery table for extra photos on products/promotions/blog posts, instead of three
-- near-identical per-entity tables — all three need the exact same shape ("ordered list of
-- Cloudinary public IDs attached to a parent row"). These are ADDITIONAL photos: the existing
-- single image_public_id/cover_image_public_id column on each entity stays as-is and keeps
-- driving every public-facing render (cards, OG images, JSON-LD) unchanged — this table is
-- purely the admin-managed "extra photos" gallery, capped at 6 per parent (enforced in
-- lib/entity-images-store.ts, not here).
--
-- Idempotent (CREATE TABLE/INDEX IF NOT EXISTS) — safe to wire into cf:deploy, like
-- 0007_tag_cache_revalidations.sql already is.
CREATE TABLE IF NOT EXISTS entity_images (
  id TEXT PRIMARY KEY NOT NULL,
  entity_type TEXT NOT NULL, -- 'product' | 'promotion' | 'post'
  entity_id TEXT NOT NULL,
  public_id TEXT NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_entity_images_entity ON entity_images (entity_type, entity_id, sort_order);
