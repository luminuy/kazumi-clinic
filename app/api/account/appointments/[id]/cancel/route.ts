import { NextResponse, type NextRequest } from 'next/server';
import { getCurrentMember } from '@/lib/members/session';
import { cancelLeadById, findLeadById } from '@/lib/leads-store';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { notifyStaffWebhook } from '@/lib/appointments/notify';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const member = await getCurrentMember();
  if (!member) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (
    !(await rateLimit('appointment-cancel', clientIp(request), {
      limit: 10,
      windowSec: 300,
    }))
  ) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const { id } = await params;
  if (!id || id.length > 80) {
    return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });
  }

  try {
    const lead = await findLeadById(id);
    if (!lead || lead.member_id !== member.id) {
      return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 403 });
    }
    if (lead.status === 'cancelled' || lead.status === 'closed') {
      return NextResponse.json({ error: 'ไม่สามารถยกเลิกรายการนี้ได้' }, { status: 409 });
    }

    const cancelled = await cancelLeadById({
      id,
      reason: null,
      cancelledBy: `member:${member.id}`,
    });
    if (!cancelled) {
      return NextResponse.json({ error: 'ไม่พบรายการนัดหมาย' }, { status: 404 });
    }
    await notifyStaffWebhook({
      event: 'appointment.cancelled',
      id: cancelled.id,
      name: cancelled.name,
      phone: cancelled.phone,
      scheduledAt: cancelled.scheduled_at,
      cancelledBy: 'member',
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'ยกเลิกไม่สำเร็จ' }, { status: 502 });
  }
}
