import { NextResponse } from 'next/server';
import { getCurrentMember } from '@/lib/members/session';

// Header chrome is optional account context; a missing session or unavailable D1 must not break it.
export async function GET() {
  try {
    const member = await getCurrentMember();
    return NextResponse.json({ ok: true, isLoggedIn: !!member });
  } catch {
    return NextResponse.json({ ok: true, isLoggedIn: false });
  }
}
