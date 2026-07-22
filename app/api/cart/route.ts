import { NextResponse } from 'next/server';
import { getCart } from '@/lib/members/cart';

// Read-only snapshot of the current visitor's cart (guest or member). Never mutates.
export async function GET() {
  try {
    const cart = await getCart();
    return NextResponse.json({ ok: true, cart });
  } catch {
    return NextResponse.json({ ok: true, cart: { items: [], count: 0, subtotalSatang: 0 } });
  }
}
