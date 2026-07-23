import type { D1Database } from '@cloudflare/workers-types';
import { newId } from './db';

/**
 * Payment provider seam. The clinic will connect a real gateway (Omise / Stripe / 2C2P / GB
 * PrimePay) here later — this file is the ONLY place that needs to change to do it.
 *
 * `initiatePayment` is called by the checkout API for any order that owes money online. Until a
 * gateway is wired, it returns `pending_integration`: the order is created and saved, the customer
 * sees a "we'll send a payment link / contact you" confirmation, and nothing is charged. When the
 * gateway is ready, create a checkout session here and return `{ status: 'redirect', url }` (plus
 * record the provider ref on the payment row); the checkout API already forwards a redirect URL to
 * the client.
 *
 * Do NOT hardcode secret keys — read them from env (set via `wrangler secret put`). Handling raw
 * card/bank credentials in this codebase is out of scope; the gateway's hosted page collects them.
 */

export type PaymentInitiation =
  | { status: 'not_required' }
  | { status: 'pending_integration' }
  | { status: 'redirect'; url: string };

export type OrderForPayment = {
  id: string;
  amountDueSatang: number;
  currency: string;
  contactEmail: string | null;
  contactName: string;
};

/** True once a gateway's credentials are present in the environment. */
export function isGatewayConfigured(): boolean {
  // Placeholder env name — rename to match the chosen provider when wiring it up.
  return !!process.env.PAYMENT_GATEWAY_SECRET?.trim();
}

export async function initiatePayment(order: OrderForPayment): Promise<PaymentInitiation> {
  if (order.amountDueSatang <= 0) return { status: 'not_required' };
  if (!isGatewayConfigured()) return { status: 'pending_integration' };

  // TODO(payment-gateway): create a hosted checkout session with the provider SDK/REST API here,
  // using the amount + currency + order id (as the provider reference), then:
  //   return { status: 'redirect', url: session.url };
  // Until that's implemented, fall back to pending so the flow stays consistent.
  return { status: 'pending_integration' };
}

/** Records a payment attempt against an order (provider 'gateway' | 'manual'). */
export async function recordPayment(
  db: D1Database,
  params: { orderId: string; provider: string; amountSatang: number; status: string; ref?: string | null },
): Promise<void> {
  const now = Date.now();
  await db
    .prepare(
      `INSERT INTO payments (id, order_id, provider, provider_ref, amount_satang, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .bind(newId('pay'), params.orderId, params.provider, params.ref ?? null, params.amountSatang, params.status, now, now)
    .run();
}
