import { NextResponse, type NextRequest } from 'next/server';
import { z } from 'zod';
import {
  cancelLeadById,
  findLeadByCancelToken,
} from '@/lib/leads-store';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import {
  notifyStaffWebhook,
  sendAppointmentCancelledEmail,
} from '@/lib/appointments/notify';

const schema = z.object({
  token: z.string().min(1).max(200),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(request: NextRequest) {
  if (
    !(await rateLimit('appointment-cancel-public', clientIp(request), {
      limit: 10,
      windowSec: 600,
    }))
  ) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'ไม่สามารถยกเลิกนัดหมายนี้ได้' }, { status: 400 });
  }

  try {
    const lead = await findLeadByCancelToken(parsed.data.token);
    if (!lead || lead.status === 'cancelled') {
      return NextResponse.json({ error: 'ไม่สามารถยกเลิกนัดหมายนี้ได้' }, { status: 400 });
    }
    const cancelled = await cancelLeadById({
      id: lead.id,
      reason: parsed.data.reason ?? null,
      cancelledBy: 'guest-link',
    });
    if (!cancelled) {
      return NextResponse.json({ error: 'ไม่สามารถยกเลิกนัดหมายนี้ได้' }, { status: 400 });
    }

    await notifyStaffWebhook({
      event: 'appointment.cancelled',
      id: cancelled.id,
      name: cancelled.name,
      phone: cancelled.phone,
      scheduledAt: cancelled.scheduled_at,
      cancelledBy: 'guest-link',
    });
    if (cancelled.email) {
      await sendAppointmentCancelledEmail({
        to: cancelled.email,
        locale: cancelled.locale,
        name: cancelled.name,
        scheduledAt: cancelled.scheduled_at,
      });
    }
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ยกเลิกไม่สำเร็จ' }, { status: 502 });
  }
}
