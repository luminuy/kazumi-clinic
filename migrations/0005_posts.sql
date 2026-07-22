-- Blog / knowledge-hub posts the clinic writes through /admin/blog. The whole source of truth for
-- /blog and /blog/[slug]; an empty table leaves /blog in its empty state. Same degrade-to-safe D1
-- philosophy as the other stores.
--
-- `slug` is the URL segment (/blog/<slug>) and is unique. `body` is a small markdown subset
-- (headings, lists, bold, links, blockquotes) rendered without dangerouslySetInnerHTML — see
-- components/prose.tsx. `published_at` is epoch ms, stamped when a post is first published and used
-- as the public sort key (newest first). COMPLIANCE (CLAUDE.md §0.2): medical content must be
-- reviewed by the clinic before publishing — the admin owns that; nothing is seeded here.
CREATE TABLE IF NOT EXISTS posts (
  id                    TEXT PRIMARY KEY NOT NULL,
  slug                  TEXT NOT NULL UNIQUE,
  title                 TEXT NOT NULL,
  excerpt               TEXT,
  body                  TEXT NOT NULL,
  cover_image_public_id TEXT,
  author                TEXT,
  published             INTEGER NOT NULL DEFAULT 0,
  published_at          INTEGER,
  updated_at            INTEGER NOT NULL,
  updated_by            TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_posts_published ON posts (published, published_at);
