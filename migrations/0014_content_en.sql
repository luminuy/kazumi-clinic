-- One-time manual migration only. Never wire this file into cf:deploy: ALTER TABLE ADD COLUMN
-- fails with "duplicate column" when run more than once. This replaces the broken
-- migrations/0008_add_en_columns.sql, whose column names do not match the production schema.
ALTER TABLE posts ADD COLUMN title_en TEXT;
ALTER TABLE posts ADD COLUMN excerpt_en TEXT;
ALTER TABLE posts ADD COLUMN body_en TEXT;

ALTER TABLE promotions ADD COLUMN name_en TEXT;
ALTER TABLE promotions ADD COLUMN detail_en TEXT;
ALTER TABLE promotions ADD COLUMN note_en TEXT;

ALTER TABLE service_products ADD COLUMN name_en TEXT;
ALTER TABLE service_products ADD COLUMN detail_en TEXT;
ALTER TABLE service_products ADD COLUMN tagline_en TEXT;
ALTER TABLE service_products ADD COLUMN benefits_en TEXT;

ALTER TABLE reviews ADD COLUMN quote_en TEXT;
ALTER TABLE reviews ADD COLUMN procedure_en TEXT;
