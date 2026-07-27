import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import {
  cancelLeadById,
  deleteLead,
  ensureCancelToken,
  findConflictingLeads,
  markConfirmationSent,
  scheduleLead,
  setLeadStatus,
} from '@/lib/leads-store';
import { LEAD_STATUSES } from '@/lib/leads';
import { rateLimit, clientIp } from '@/lib/rate-limit';
import { APPOINTMENT_DEFAULT_DURATION_MINUTES } from '@/lib/appointments/schedule';
import {
  sendAppointmentCancelledEmail,
  sendAppointmentConfirmationEmail,
} from '@/lib/appointments/notify';

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const statusSchema = z.object({
  id: z.string().min(1).max(80),
  status: z.enum(LEAD_STATUSES),
  scheduledAt: z.number().int().positive().optional(),
  durationMinutes: z.number().int().min(15).max(480).optional(),
  cancelReason: z.string().trim().max(500).optional(),
});

const deleteSchema = z.object({ id: z.string().min(1).max(80) });

export async function PATCH(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (!(await rateLimit('admin-write', clientIp(request), { limit: 60, windowSec: 300 }))) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    const { id, status, scheduledAt, cancelReason } = parsed.data;
    if (status === 'booked') {
      if (!scheduledAt) {
        return NextResponse.json({ error: 'ต้องระบุเวลานัด' }, { status: 400 });
      }
      const durationMinutes =
        parsed.data.durationMinutes ?? APPOINTMENT_DEFAULT_DURATION_MINUTES;
      const conflicts = await findConflictingLeads({
        scheduledAt,
        durationMinutes,
        excludeId: id,
      });
      const lead = await scheduleLead({ id, scheduledAt, durationMinutes, handledBy: email });
      if (!lead) return NextResponse.json({ error: 'ไม่พบรายการนัดหมาย' }, { status: 404 });

      if (lead.email) {
        try {
          const token = await ensureCancelToken(id);
          const path =
            lead.locale === 'en' ? '/en/appointments/cancel' : '/appointments/cancel';
          const cancelUrl = `${new URL(request.url).origin}${path}?token=${encodeURIComponent(token)}`;
          const delivery = await sendAppointmentConfirmationEmail({
            to: lead.email,
            locale: lead.locale,
            name: lead.name,
            scheduledAt,
            durationMinutes,
            interest: lead.interest,
            cancelUrl,
          });
          if (delivery.status === 'sent') await markConfirmationSent(id);
        } catch {
          console.error('Appointment confirmation delivery failed.');
        }
      }
      revalidatePath('/admin/leads');
      return NextResponse.json({ ok: true, conflict: conflicts.length > 0 });
    }

    if (status === 'cancelled') {
      const lead = await cancelLeadById({
        id,
        reason: cancelReason ?? null,
        cancelledBy: email,
      });
      if (!lead) return NextResponse.json({ error: 'ไม่พบรายการนัดหมาย' }, { status: 404 });
      if (lead.email) {
        try {
          await sendAppointmentCancelledEmail({
            to: lead.email,
            locale: lead.locale,
            name: lead.name,
            scheduledAt: lead.scheduled_at,
          });
        } catch {
          console.error('Appointment cancellation delivery failed.');
        }
      }
      revalidatePath('/admin/leads');
      return NextResponse.json({ ok: true });
    }

    await setLeadStatus(id, status, email);
    revalidatePath('/admin/leads');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'อัปเดตไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });
  if (!(await rateLimit('admin-write', clientIp(request), { limit: 60, windowSec: 300 }))) {
    return NextResponse.json({ error: 'ทำรายการบ่อยเกินไป กรุณาลองใหม่ภายหลัง' }, { status: 429 });
  }

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    await deleteLead(parsed.data.id);
    revalidatePath('/admin/leads');
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: 'ลบไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
