-- Member + basket system. Adds customer accounts (email/password + OAuth), server-side sessions,
-- a persistent shopping cart, and orders/payments for booking clinic services. Lives in the same
-- D1 database (`kazumi-clinic-tag-cache`) as every other app table — see lib/members/*.
--
-- Money is stored as INTEGER satang (THB * 100) everywhere to avoid floating-point drift on
-- deposits and percentages. Catalog data (title, price) is SNAPSHOTTED into cart_items/order_items
-- so a later price change in lib/services.ts never rewrites a customer's existing cart or order.

-- Customer accounts. `password_hash` is null for OAuth-only users; `email` is unique when present
-- (LINE may not return an email, so it stays nullable — SQLite allows multiple NULLs in a UNIQUE).
CREATE TABLE IF NOT EXISTS members (
  id             TEXT PRIMARY KEY NOT NULL,
  email          TEXT UNIQUE,
  email_verified INTEGER NOT NULL DEFAULT 0,
  name           TEXT,
  password_hash  TEXT,
  avatar_url     TEXT,
  phone          TEXT,
  created_at     INTEGER NOT NULL,
  updated_at     INTEGER NOT NULL
);

-- Linked social logins. One member can have several (google + line); a provider account maps to at
-- most one member. Sign-in matches on (provider, provider_account_id), then links by email.
CREATE TABLE IF NOT EXISTS member_oauth_accounts (
  id                  TEXT PRIMARY KEY NOT NULL,
  member_id           TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  provider            TEXT NOT NULL,
  provider_account_id TEXT NOT NULL,
  created_at          INTEGER NOT NULL,
  UNIQUE (provider, provider_account_id)
);
CREATE INDEX IF NOT EXISTS idx_member_oauth_member ON member_oauth_accounts (member_id);

-- Server-side sessions. `id` is sha256(token); the raw token lives only in the HttpOnly cookie, so
-- a DB read never exposes a usable credential. Expired rows are ignored on read and swept lazily.
CREATE TABLE IF NOT EXISTS member_sessions (
  id         TEXT PRIMARY KEY NOT NULL,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  user_agent TEXT
);
CREATE INDEX IF NOT EXISTS idx_member_sessions_member ON member_sessions (member_id);
CREATE INDEX IF NOT EXISTS idx_member_sessions_expires ON member_sessions (expires_at);

-- Single-use tokens for email verification and password reset. `id` is sha256(token), same as
-- sessions. `type` is 'email_verify' | 'password_reset'.
CREATE TABLE IF NOT EXISTS member_tokens (
  id         TEXT PRIMARY KEY NOT NULL,
  member_id  TEXT NOT NULL REFERENCES members(id) ON DELETE CASCADE,
  type       TEXT NOT NULL,
  expires_at INTEGER NOT NULL,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_member_tokens_member ON member_tokens (member_id);

-- Carts. A guest cart is keyed by a cookie id with member_id NULL; on login it's merged into the
-- member's cart. `status` is 'active' | 'ordered' | 'abandoned'.
CREATE TABLE IF NOT EXISTS carts (
  id         TEXT PRIMARY KEY NOT NULL,
  member_id  TEXT REFERENCES members(id) ON DELETE SET NULL,
  status     TEXT NOT NULL DEFAULT 'active',
  created_at INTEGER NOT NULL,
  updated_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_carts_member ON carts (member_id);

CREATE TABLE IF NOT EXISTS cart_items (
  id                TEXT PRIMARY KEY NOT NULL,
  cart_id           TEXT NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,
  title             TEXT NOT NULL,
  unit_price_satang INTEGER NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1,
  created_at        INTEGER NOT NULL,
  UNIQUE (cart_id, product_id)
);
CREATE INDEX IF NOT EXISTS idx_cart_items_cart ON cart_items (cart_id);

-- Orders. `fulfillment` is 'booking_request' | 'deposit' | 'full_payment'. `status` moves
-- pending → awaiting_payment → paid → confirmed → completed (or cancelled). `amount_due_satang` is
-- what the customer pays now (0 for a booking request, the deposit for deposit, subtotal for full).
CREATE TABLE IF NOT EXISTS orders (
  id                TEXT PRIMARY KEY NOT NULL,
  member_id         TEXT REFERENCES members(id) ON DELETE SET NULL,
  status            TEXT NOT NULL DEFAULT 'pending',
  fulfillment       TEXT NOT NULL,
  payment_method    TEXT,
  subtotal_satang   INTEGER NOT NULL,
  deposit_satang    INTEGER NOT NULL DEFAULT 0,
  amount_due_satang INTEGER NOT NULL DEFAULT 0,
  currency          TEXT NOT NULL DEFAULT 'THB',
  contact_name      TEXT NOT NULL,
  contact_phone     TEXT NOT NULL,
  contact_email     TEXT,
  preferred_time    TEXT,
  note              TEXT,
  created_at        INTEGER NOT NULL,
  updated_at        INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_orders_member ON orders (member_id);
CREATE INDEX IF NOT EXISTS idx_orders_created ON orders (created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders (status);

CREATE TABLE IF NOT EXISTS order_items (
  id                TEXT PRIMARY KEY NOT NULL,
  order_id          TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        TEXT NOT NULL,
  title             TEXT NOT NULL,
  unit_price_satang INTEGER NOT NULL,
  quantity          INTEGER NOT NULL DEFAULT 1
);
CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items (order_id);

-- Payment attempts against an order. `provider` is 'manual' (bank transfer / pay at clinic) or a
-- gateway id ('omise', 'stripe'…). `status` is 'initiated' | 'succeeded' | 'failed' | 'refunded'.
CREATE TABLE IF NOT EXISTS payments (
  id            TEXT PRIMARY KEY NOT NULL,
  order_id      TEXT NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  provider      TEXT NOT NULL,
  provider_ref  TEXT,
  amount_satang INTEGER NOT NULL,
  status        TEXT NOT NULL DEFAULT 'initiated',
  raw           TEXT,
  created_at    INTEGER NOT NULL,
  updated_at    INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_payments_order ON payments (order_id);
