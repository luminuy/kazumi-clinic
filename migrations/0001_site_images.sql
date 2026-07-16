-- Images the clinic has replaced through /admin. A row here overrides the public ID compiled
-- into lib/site-images.ts; no row means the site renders the shipped default, which is why
-- creating this table changes nothing on its own.
--
-- `key` matches SiteImageKey in lib/site-images.ts and is the contract between the two —
-- renaming a key there silently orphans the clinic's uploaded image.
CREATE TABLE IF NOT EXISTS site_images (
  key         TEXT PRIMARY KEY NOT NULL,
  public_id   TEXT NOT NULL,
  updated_at  INTEGER NOT NULL,
  updated_by  TEXT NOT NULL
);
