-- Patient reviews and before/after results the clinic manages through /admin/reviews. Like the
-- promotions table, this is the whole source of truth — there is no hardcoded list to override —
-- and an empty table leaves /reviews in its "gathering reviews" scaffold state.
--
-- COMPLIANCE (CLAUDE.md §0.2): reviews and especially before/after photos are regulated medical
-- advertising. A row is only shown publicly when BOTH `consent` = 1 (the clinic confirmed the
-- patient consented to publishing their words/photos) AND `published` = 1. Before/after images
-- are additionally gated on consent. Never seed this table with fabricated content.
--
-- `rating` is 1–5 or NULL (a written testimonial without a star rating). `category_slug`, when set,
-- must match a ServiceCategory.slug so the review can link to the relevant service.
CREATE TABLE IF NOT EXISTS reviews (
  id                     TEXT PRIMARY KEY NOT NULL,
  name                   TEXT NOT NULL,
  rating                 INTEGER,
  quote                  TEXT,
  procedure              TEXT,
  category_slug          TEXT,
  before_image_public_id TEXT,
  after_image_public_id  TEXT,
  consent                INTEGER NOT NULL DEFAULT 0,
  published              INTEGER NOT NULL DEFAULT 0,
  sort_order             INTEGER NOT NULL DEFAULT 0,
  updated_at             INTEGER NOT NULL,
  updated_by             TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_reviews_sort ON reviews (sort_order);
