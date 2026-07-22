import { NextResponse, type NextRequest } from 'next/server';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { setLeadStatus, deleteLead } from '@/lib/leads-store';
import { LEAD_STATUSES } from '@/lib/leads';

function adminEmail(request: NextRequest) {
  return request.headers.get('x-admin-email');
}

const statusSchema = z.object({
  id: z.string().min(1).max(80),
  status: z.enum(LEAD_STATUSES),
});

const deleteSchema = z.object({ id: z.string().min(1).max(80) });

export async function PATCH(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = statusSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    await setLeadStatus(parsed.data.id, parsed.data.status, email);
    revalidatePath('/admin/leads');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'อัปเดตไม่สำเร็จ' },
      { status: 502 },
    );
  }
}

export async function DELETE(request: NextRequest) {
  const email = adminEmail(request);
  if (!email) return NextResponse.json({ error: 'ไม่ได้รับอนุญาต' }, { status: 401 });

  const parsed = deleteSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'ข้อมูลไม่ถูกต้อง' }, { status: 400 });

  try {
    await deleteLead(parsed.data.id);
    revalidatePath('/admin/leads');
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'ลบไม่สำเร็จ' },
      { status: 502 },
    );
  }
}
