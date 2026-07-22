import { cookies } from 'next/headers';
import type { D1Database } from '@cloudflare/workers-types';
import { memberDb, requireDb, newId } from './db';
import { getCurrentMemberRow } from './session';
import { findPurchasableProduct } from './catalog';

/**
 * The shopping cart, on D1. A guest cart is keyed by the `kz_cart` cookie (member_id NULL); a
 * member's cart is keyed by member_id. On sign-in the guest cart is merged into the member's
 * (mergeGuestCartIntoMember, called from the login/register handlers).
 *
 * cookies().set() only works inside a Route Handler or Server Action, so any path that may CREATE a
 * cart (and thus set the cookie) must run there — hence the `create` flag: read paths pass false
 * and never write a cookie; write paths (add/set) pass true.
 */

export const CART_COOKIE = 'kz_cart';
const MAX_QTY = 99;

export type CartLine = {
  productId: string;
  title: string;
  unitPriceSatang: number;
  quantity: number;
  lineTotalSatang: number;
};

export type CartSummary = {
  items: CartLine[];
  count: number;
  subtotalSatang: number;
};

function emptyCart(): CartSummary {
  return { items: [], count: 0, subtotalSatang: 0 };
}

const cartCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge: 60 * 60 * 24 * 60, // 60 days
};

/**
 * Resolves the current cart id. With `create: false` it never writes (safe in a Server Component);
 * with `create: true` it may INSERT a cart and set the cookie, so only call that from a Route
 * Handler / Server Action.
 */
async function currentCartId(db: D1Database, create: boolean): Promise<string | null> {
  const member = await getCurrentMemberRow();
  const now = Date.now();

  if (member) {
    const row = await db
      .prepare("SELECT id FROM carts WHERE member_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1")
      .bind(member.id)
      .first<{ id: string }>();
    if (row) return row.id;
    if (!create) return null;
    const id = newId('cart');
    await db
      .prepare("INSERT INTO carts (id, member_id, status, created_at, updated_at) VALUES (?, ?, 'active', ?, ?)")
      .bind(id, member.id, now, now)
      .run();
    return id;
  }

  const jar = await cookies();
  const cookieId = jar.get(CART_COOKIE)?.value;
  if (cookieId) {
    const row = await db
      .prepare("SELECT id FROM carts WHERE id = ? AND status = 'active'")
      .bind(cookieId)
      .first<{ id: string }>();
    if (row) return cookieId;
  }
  if (!create) return null;
  const id = newId('cart');
  await db
    .prepare("INSERT INTO carts (id, member_id, status, created_at, updated_at) VALUES (?, NULL, 'active', ?, ?)")
    .bind(id, now, now)
    .run();
  jar.set(CART_COOKIE, id, cartCookieOptions);
  return id;
}

async function readCart(db: D1Database, cartId: string): Promise<CartSummary> {
  const res = await db
    .prepare(
      'SELECT product_id, title, unit_price_satang, quantity FROM cart_items WHERE cart_id = ? ORDER BY created_at',
    )
    .bind(cartId)
    .all<{ product_id: string; title: string; unit_price_satang: number; quantity: number }>();

  const items: CartLine[] = (res.results ?? []).map((r) => ({
    productId: r.product_id,
    title: r.title,
    unitPriceSatang: r.unit_price_satang,
    quantity: r.quantity,
    lineTotalSatang: r.unit_price_satang * r.quantity,
  }));
  return {
    items,
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotalSatang: items.reduce((n, i) => n + i.lineTotalSatang, 0),
  };
}

/** Read-only cart for the current visitor. Never creates a cart or writes a cookie. */
export async function getCart(): Promise<CartSummary> {
  const db = await memberDb();
  if (!db) return emptyCart();
  const cartId = await currentCartId(db, false);
  if (!cartId) return emptyCart();
  return readCart(db, cartId);
}

/**
 * The current visitor's active cart WITH its id, for the checkout/order path. Read-only (never
 * creates or writes a cookie). Returns null when there's no active cart or it's empty.
 */
export async function getActiveCartForOrder(): Promise<{
  id: string;
  items: CartLine[];
  subtotalSatang: number;
} | null> {
  const db = await memberDb();
  if (!db) return null;
  const cartId = await currentCartId(db, false);
  if (!cartId) return null;
  const summary = await readCart(db, cartId);
  if (summary.items.length === 0) return null;
  return { id: cartId, items: summary.items, subtotalSatang: summary.subtotalSatang };
}

/** Item count only — cheap enough for the header badge on every request. */
export async function getCartCount(): Promise<number> {
  const db = await memberDb();
  if (!db) return 0;
  const cartId = await currentCartId(db, false);
  if (!cartId) return 0;
  const row = await db
    .prepare('SELECT COALESCE(SUM(quantity), 0) AS n FROM cart_items WHERE cart_id = ?')
    .bind(cartId)
    .first<{ n: number }>();
  return row?.n ?? 0;
}

function clampQty(qty: number): number {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(MAX_QTY, Math.floor(qty)));
}

/**
 * Adds a purchasable product (or increments its quantity). Throws `NOT_PURCHASABLE` for an unknown
 * or price-less product. Snapshots the title + price so a later catalog change never rewrites the
 * line. Returns the updated cart.
 */
export async function addItem(productId: string, qty = 1): Promise<CartSummary> {
  const db = await memberDb();
  requireDb(db);
  const product = findPurchasableProduct(productId);
  if (!product) throw new Error('NOT_PURCHASABLE');

  const cartId = await currentCartId(db, true);
  requireCartId(cartId);
  const quantity = clampQty(qty);
  const now = Date.now();

  await db
    .prepare(
      `INSERT INTO cart_items (id, cart_id, product_id, title, unit_price_satang, quantity, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT (cart_id, product_id)
       DO UPDATE SET quantity = MIN(${MAX_QTY}, quantity + excluded.quantity)`,
    )
    .bind(newId('ci'), cartId, product.id, product.title, product.priceSatang, quantity, now)
    .run();
  await touchCart(db, cartId, now);
  return readCart(db, cartId);
}

/** Sets an absolute quantity; 0 or less removes the line. Returns the updated cart. */
export async function setItemQty(productId: string, qty: number): Promise<CartSummary> {
  const db = await memberDb();
  requireDb(db);
  const cartId = await currentCartId(db, false);
  if (!cartId) return emptyCart();
  const now = Date.now();

  if (qty <= 0) {
    await db
      .prepare('DELETE FROM cart_items WHERE cart_id = ? AND product_id = ?')
      .bind(cartId, productId)
      .run();
  } else {
    await db
      .prepare('UPDATE cart_items SET quantity = ? WHERE cart_id = ? AND product_id = ?')
      .bind(clampQty(qty), cartId, productId)
      .run();
  }
  await touchCart(db, cartId, now);
  return readCart(db, cartId);
}

/** Removes a single line. Returns the updated cart. */
export async function removeItem(productId: string): Promise<CartSummary> {
  return setItemQty(productId, 0);
}

/**
 * Merges the guest cart (from the cookie) into the signed-in member's active cart, summing
 * quantities on collisions, then abandons the guest cart and clears the cookie. Call this right
 * after createSession() in the login/register handlers. Best-effort: any failure is swallowed so a
 * cart hiccup never blocks sign-in.
 */
export async function mergeGuestCartIntoMember(memberId: string): Promise<void> {
  try {
    const db = await memberDb();
    if (!db) return;
    const jar = await cookies();
    const guestId = jar.get(CART_COOKIE)?.value;
    if (!guestId) return;

    const guest = await db
      .prepare("SELECT id FROM carts WHERE id = ? AND member_id IS NULL AND status = 'active'")
      .bind(guestId)
      .first<{ id: string }>();
    // Always drop the guest cookie — it has no business surviving into a member session.
    jar.set(CART_COOKIE, '', { ...cartCookieOptions, maxAge: 0 });
    if (!guest) return;

    const now = Date.now();
    const memberCart = await db
      .prepare("SELECT id FROM carts WHERE member_id = ? AND status = 'active' ORDER BY created_at DESC LIMIT 1")
      .bind(memberId)
      .first<{ id: string }>();

    if (!memberCart) {
      // No member cart yet — simply adopt the guest cart.
      await db
        .prepare("UPDATE carts SET member_id = ?, updated_at = ? WHERE id = ?")
        .bind(memberId, now, guestId)
        .run();
      return;
    }

    const guestItems = await db
      .prepare('SELECT product_id, title, unit_price_satang, quantity FROM cart_items WHERE cart_id = ?')
      .bind(guestId)
      .all<{ product_id: string; title: string; unit_price_satang: number; quantity: number }>();

    for (const it of guestItems.results ?? []) {
      await db
        .prepare(
          `INSERT INTO cart_items (id, cart_id, product_id, title, unit_price_satang, quantity, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?)
           ON CONFLICT (cart_id, product_id)
           DO UPDATE SET quantity = MIN(${MAX_QTY}, quantity + excluded.quantity)`,
        )
        .bind(newId('ci'), memberCart.id, it.product_id, it.title, it.unit_price_satang, it.quantity, now)
        .run();
    }
    await db.prepare("UPDATE carts SET status = 'abandoned', updated_at = ? WHERE id = ?").bind(now, guestId).run();
    await touchCart(db, memberCart.id, now);
  } catch {
    // Non-fatal: sign-in already succeeded; a failed merge just leaves the guest cart behind.
  }
}

async function touchCart(db: D1Database, cartId: string, now: number): Promise<void> {
  await db.prepare('UPDATE carts SET updated_at = ? WHERE id = ?').bind(now, cartId).run();
}

function requireCartId(id: string | null): asserts id is string {
  if (!id) throw new Error('CART_UNAVAILABLE');
}
