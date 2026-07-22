import type { Metadata } from 'next';
import { getAllLeads } from '@/lib/leads-store';
import { LeadsDashboard, type AdminLead } from '@/components/admin/leads-dashboard';
import { PageHeading } from '@/components/admin/ui';

export const metadata: Metadata = { title: 'นัดหมาย' };

// Leads are live data, never build output.
export const dynamic = 'force-dynamic';

export default async function AdminLeadsPage() {
  const rows = await getAllLeads();
  const leads: AdminLead[] = rows.map((row) => ({
    id: row.id,
    name: row.name,
    phone: row.phone,
    interest: row.interest ?? '',
    preferredTime: row.preferred_time ?? '',
    message: row.message ?? '',
    status: row.status,
    createdAt: row.created_at,
  }));

  const fresh = leads.filter((lead) => lead.status === 'new').length;

  return (
    <>
      <PageHeading
        eyebrow="Appointments / Leads"
        title="นัดหมาย"
        description="คำขอนัดหมายที่ลูกค้าส่งผ่านฟอร์มในหน้า /contact — โทรกลับแล้วอัปเดตสถานะเพื่อไม่ให้ตกหล่น"
        stat={
          <span>
            ทั้งหมด {leads.length} · ใหม่ <span className="text-forest">{fresh}</span>
          </span>
        }
      />

      <LeadsDashboard leads={leads} />
    </>
  );
}
