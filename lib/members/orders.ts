import type { D1Database } from '@cloudflare/workers-types';
import { memberDb, requireDb, newId } from './db';
import { getCurrentMemberRow } from './session';
import { getActiveCartForOrder } from './cart';
import { CURRENCY, depositSatang } from './config';
import { initiatePayment, recordPayment, type PaymentInitiation } from './payments';

/**
 * Orders: created at checkout from the current cart. `fulfillment` is what the customer commits to;
 * `amount_due_satang` is what they owe online now (0 for a booking request, the deposit, or the
 * full subtotal). Line items are snapshotted from the cart so a later catalog/price change never
 * rewrites a placed order. Prices for medical procedures are indicative — the order is a booking
 * request the clinic confirms, not an irreversible sale (CLAUDE.md §0.2).
 */

export type Fulfillment = 'booking_request' | 'deposit' | 'full_payment';
export type PaymentMethod = 'pay_at_clinic' | 'gateway';
export type OrderStatus =
  | 'pending'
  | 'awaiting_payment'
  | 'paid'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type OrderItem = {
  productId: string;
  title: string;
  unitPriceSatang: number;
  quantity: number;
  lineTotalSatang: number;
};

export type Order = {
  id: string;
  memberId: string | null;
  status: OrderStatus;
  fulfillment: Fulfillment;
  paymentMethod: PaymentMethod | null;
  subtotalSatang: number;
  depositSatang: number;
  amountDueSatang: number;
  currency: string;
  contactName: string;
  contactPhone: string;
  contactEmail: string | null;
  preferredTime: string | null;
  note: string | null;
  createdAt: number;
  items: OrderItem[];
};

export type CreateOrderInput = {
  contactName: string;
  contactPhone: string;
  contactEmail?: string | null;
  preferredTime?: string | null;
  note?: string | null;
  fulfillment: Fulfillment;
  /** Required when the order owes money online (deposit / full_payment). */
  paymentMethod?: PaymentMethod | null;
};

export type CreateOrderResult = {
  orderId: string;
  amountDueSatang: number;
  payment: PaymentInitiation;
};

function computeAmounts(fulfillment: Fulfillment, subtotal: number) {
  const deposit = fulfillment === 'deposit' ? depositSatang(subtotal) : 0;
  const amountDue =
    fulfillment === 'booking_request' ? 0 : fulfillment === 'deposit' ? deposit : subtotal;
  return { deposit, amountDue };
}

/**
 * Creates an order from the current cart and marks the cart 'ordered' (atomic D1 batch). For orders
 * that owe money online it also records a payment attempt and asks the payment seam what to do next
 * (redirect / pending-integration). Throws `CART_EMPTY` if there's nothing to order.
 */
export async function createOrder(input: CreateOrderInput): Promise<CreateOrderResult> {
  const db = await memberDb();
  requireDb(db);

  const cart = await getActiveCartForOrder();
  if (!cart) throw new Error('CART_EMPTY');

  const subtotal = cart.subtotalSatang;
  const { deposit, amountDue } = computeAmounts(input.fulfillment, subtotal);
  const method: PaymentMethod | null = amountDue > 0 ? (input.paymentMethod ?? 'gateway') : null;

  const status: OrderStatus =
    amountDue === 0 || method === 'pay_at_clinic' ? 'pending' : 'awaiting_payment';

  const member = await getCurrentMemberRow();
  const orderId = newId('ord');
  const now = Date.now();

  const statements: ReturnType<D1Database['prepare']>[] = [
    db
      .prepare(
        `INSERT INTO orders
           (id, member_id, status, fulfillment, payment_method, subtotal_satang, deposit_satang,
            amount_due_satang, currency, contact_name, contact_phone, contact_email, preferred_time,
            note, created_at, updated_at)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .bind(
        orderId,
        member?.id ?? null,
        status,
        input.fulfillment,
        method,
        subtotal,
        deposit,
        amountDue,
        CURRENCY,
        input.contactName,
        input.contactPhone,
        input.contactEmail ?? null,
        input.preferredTime ?? null,
        input.note ?? null,
        now,
        now,
      ),
  ];

  for (const item of cart.items) {
    statements.push(
      db
        .prepare(
          `INSERT INTO order_items (id, order_id, product_id, title, unit_price_satang, quantity)
           VALUES (?, ?, ?, ?, ?, ?)`,
        )
        .bind(newId('oi'), orderId, item.productId, item.title, item.unitPriceSatang, item.quantity),
    );
  }

  statements.push(
    db.prepare("UPDATE carts SET status = 'ordered', updated_at = ? WHERE id = ?").bind(now, cart.id),
  );

  await db.batch(statements);

  let payment: PaymentInitiation = { status: 'not_required' };
  if (amountDue > 0 && method === 'gateway') {
    await recordPayment(db, {
      orderId,
      provider: 'gateway',
      amountSatang: amountDue,
      status: 'initiated',
    });
    payment = await initiatePayment({
      id: orderId,
      amountDueSatang: amountDue,
      currency: CURRENCY,
      contactEmail: input.contactEmail ?? null,
      contactName: input.contactName,
    });
  }

  return { orderId, amountDueSatang: amountDue, payment };
}

function mapRow(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    memberId: row.member_id,
    status: row.status as OrderStatus,
    fulfillment: row.fulfillment as Fulfillment,
    paymentMethod: (row.payment_method as PaymentMethod | null) ?? null,
    subtotalSatang: row.subtotal_satang,
    depositSatang: row.deposit_satang,
    amountDueSatang: row.amount_due_satang,
    currency: row.currency,
    contactName: row.contact_name,
    contactPhone: row.contact_phone,
    contactEmail: row.contact_email,
    preferredTime: row.preferred_time,
    note: row.note,
    createdAt: row.created_at,
    items,
  };
}

type OrderRow = {
  id: string;
  member_id: string | null;
  status: string;
  fulfillment: string;
  payment_method: string | null;
  subtotal_satang: number;
  deposit_satang: number;
  amount_due_satang: number;
  currency: string;
  contact_name: string;
  contact_phone: string;
  contact_email: string | null;
  preferred_time: string | null;
  note: string | null;
  created_at: number;
};

/** One order with its items, or null if it doesn't exist. Access control is the caller's job. */
export async function getOrderById(id: string): Promise<Order | null> {
  const db = await memberDb();
  if (!db) return null;
  const row = await db.prepare('SELECT * FROM orders WHERE id = ?').bind(id).first<OrderRow>();
  if (!row) return null;
  const items = await db
    .prepare(
      'SELECT product_id, title, unit_price_satang, quantity FROM order_items WHERE order_id = ?',
    )
    .bind(id)
    .all<{ product_id: string; title: string; unit_price_satang: number; quantity: number }>();
  const mapped: OrderItem[] = (items.results ?? []).map((r) => ({
    productId: r.product_id,
    title: r.title,
    unitPriceSatang: r.unit_price_satang,
    quantity: r.quantity,
    lineTotalSatang: r.unit_price_satang * r.quantity,
  }));
  return mapRow(row, mapped);
}

export type OrderListItem = {
  id: string;
  status: OrderStatus;
  fulfillment: Fulfillment;
  subtotalSatang: number;
  amountDueSatang: number;
  createdAt: number;
  itemCount: number;
  summary: string;
};

/** A member's orders, newest first, for the account history list. */
export async function listMemberOrders(memberId: string): Promise<OrderListItem[]> {
  const db = await memberDb();
  if (!db) return [];
  const res = await db
    .prepare(
      `SELECT o.id, o.status, o.fulfillment, o.subtotal_satang, o.amount_due_satang, o.created_at,
              COALESCE(SUM(i.quantity), 0) AS item_count,
              (SELECT title FROM order_items WHERE order_id = o.id ORDER BY rowid LIMIT 1) AS first_title
       FROM orders o
       LEFT JOIN order_items i ON i.order_id = o.id
       WHERE o.member_id = ?
       GROUP BY o.id
       ORDER BY o.created_at DESC`,
    )
    .bind(memberId)
    .all<{
      id: string;
      status: string;
      fulfillment: string;
      subtotal_satang: number;
      amount_due_satang: number;
      created_at: number;
      item_count: number;
      first_title: string | null;
    }>();

  return (res.results ?? []).map((r) => ({
    id: r.id,
    status: r.status as OrderStatus,
    fulfillment: r.fulfillment as Fulfillment,
    subtotalSatang: r.subtotal_satang,
    amountDueSatang: r.amount_due_satang,
    createdAt: r.created_at,
    itemCount: r.item_count,
    summary:
      r.item_count > 1 && r.first_title
        ? `${r.first_title} +${r.item_count - 1}`
        : (r.first_title ?? '—'),
  }));
}
