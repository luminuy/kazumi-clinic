import { NextResponse } from 'next/server';
import { destroySession } from '@/lib/members/session';

// Ends the current session. POST-only so a stray link/prefetch can't log a member out.
export async function POST() {
  try {
    await destroySession();
  } catch {
    // Even if the DB delete fails, the cookie is cleared — treat logout as best-effort success.
  }
  return NextResponse.json({ ok: true });
}
