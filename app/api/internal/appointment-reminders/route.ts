import { NextResponse, type NextRequest } from 'next/server';
import {
  ensureCancelToken,
  getLeadsNeedingReminder,
  markReminderSent,
} from '@/lib/leads-store';
import { sendAppointmentReminderEmail } from '@/lib/appointments/notify';
import { APPOINTMENT_DEFAULT_DURATION_MINUTES } from '@/lib/appointments/schedule';

const HOUR_MS = 60 * 60 * 1000;

export async function POST(request: NextRequest) {
  const secret = request.headers.get('x-internal-secret');
  const expected = process.env.INTERNAL_TASK_SECRET;
  if (!expected || !secret || secret !== expected) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const now = Date.now();
  const leads = await getLeadsNeedingReminder(now + 23 * HOUR_MS, now + 25 * HOUR_MS);
  let sent = 0;

  for (const lead of leads) {
    if (!lead.email || lead.scheduled_at === null) continue;
    try {
      const token = await ensureCancelToken(lead.id);
      const path = lead.locale === 'en' ? '/en/appointments/cancel' : '/appointments/cancel';
      const cancelUrl = `${new URL(request.url).origin}${path}?token=${encodeURIComponent(token)}`;
      const delivery = await sendAppointmentReminderEmail({
        to: lead.email,
        locale: lead.locale,
        name: lead.name,
        scheduledAt: lead.scheduled_at,
        durationMinutes: lead.duration_minutes ?? APPOINTMENT_DEFAULT_DURATION_MINUTES,
        interest: lead.interest,
        cancelUrl,
      });
      if (delivery.status === 'sent') {
        await markReminderSent(lead.id);
        sent += 1;
      }
    } catch (error) {
      console.error(
        `Reminder send failed for lead ${lead.id}:`,
        error instanceof Error ? error.message : 'unknown error',
      );
    }
  }

  return NextResponse.json({ ok: true, checked: leads.length, sent });
}
