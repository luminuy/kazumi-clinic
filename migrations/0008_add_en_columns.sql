-- Migration: Add English translation columns to tables

-- 1. service_products
ALTER TABLE service_products ADD COLUMN name_en TEXT;
ALTER TABLE service_products ADD COLUMN short_desc_en TEXT;
ALTER TABLE service_products ADD COLUMN detail_html_en TEXT;
ALTER TABLE service_products ADD COLUMN benefits_en TEXT; -- JSON array of strings

-- 2. promotions
ALTER TABLE promotions ADD COLUMN title_en TEXT;
ALTER TABLE promotions ADD COLUMN description_en TEXT;
ALTER TABLE promotions ADD COLUMN terms_html_en TEXT;

-- 3. posts (blogs)
ALTER TABLE posts ADD COLUMN title_en TEXT;
ALTER TABLE posts ADD COLUMN excerpt_en TEXT;
ALTER TABLE posts ADD COLUMN body_en TEXT;

-- 4. reviews (if any text needs translation, like patient feedback)
ALTER TABLE reviews ADD COLUMN text_en TEXT;
