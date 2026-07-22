'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, Phone, Trash2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card } from './ui';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads';

export type AdminLead = {
  id: string;
  name: string;
  phone: string;
  interest: string;
  preferredTime: string;
  message: string;
  status: LeadStatus;
  createdAt: number;
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'ใหม่',
  contacted: 'ติดต่อแล้ว',
  booked: 'นัดแล้ว',
  closed: 'ปิด',
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-forest/10 text-forest',
  contacted: 'bg-amber-50 text-amber-700',
  booked: 'bg-blue-50 text-blue-700',
  closed: 'bg-black/[0.05] text-ink/45',
};

async function errorMessage(res: Response, fallback: string): Promise<string> {
  const text = await res.text().catch(() => '');
  if (text) {
    try {
      const data = JSON.parse(text) as { error?: string };
      if (data.error) return data.error;
    } catch {
      /* non-JSON body */
    }
  }
  if (res.status === 401 || res.status === 404)
    return 'เซสชันหมดอายุ — โหลดหน้านี้ใหม่แล้วลองอีกครั้ง';
  return `${fallback} (${res.status})`;
}

function formatDateTime(ms: number) {
  return new Date(ms).toLocaleString('th-TH', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

type Filter = 'all' | LeadStatus;

export function LeadsDashboard({ leads }: { leads: AdminLead[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = busyId !== null;

  const counts = useMemo(() => {
    const base: Record<Filter, number> = { all: leads.length, new: 0, contacted: 0, booked: 0, closed: 0 };
    for (const lead of leads) base[lead.status] += 1;
    return base;
  }, [leads]);

  const visible = filter === 'all' ? leads : leads.filter((lead) => lead.status === filter);

  async function mutate(key: string, run: () => Promise<Response>) {
    setBusyId(key);
    setError(null);
    try {
      const res = await run();
      if (!res.ok) throw new Error(await errorMessage(res, 'อัปเดตไม่สำเร็จ'));
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตไม่สำเร็จ');
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(lead: AdminLead, status: LeadStatus) {
    await mutate('status-' + lead.id, () =>
      fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status }),
      }),
    );
  }

  async function remove(lead: AdminLead) {
    if (!window.confirm(`ลบรายการนัดหมายนี้?\n\n${lead.name} · ${lead.phone}`)) return;
    await mutate('del-' + lead.id, () =>
      fetch('/api/admin/leads', {
        method: 'DELETE',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: lead.id }),
      }),
    );
  }

  const filters: Filter[] = ['all', ...LEAD_STATUSES];

  return (
    <section className="mt-8">
      <div className="flex flex-wrap gap-1.5">
        {filters.map((key) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            aria-current={filter === key ? 'true' : undefined}
            className={cn(
              'rounded-full px-3.5 py-1.5 text-xs font-medium transition-colors',
              filter === key
                ? 'bg-ink text-white'
                : 'bg-black/[0.04] text-ink/55 hover:bg-black/[0.08] hover:text-ink',
            )}
          >
            {key === 'all' ? 'ทั้งหมด' : STATUS_LABEL[key]} · {counts[key]}
          </button>
        ))}
      </div>

      {error && (
        <p className="mt-4 inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">
          <TriangleAlert className="size-3.5" /> {error}
        </p>
      )}

      <ul className="mt-6 space-y-3">
        {visible.map((lead) => {
          const rowBusy = busyId === 'status-' + lead.id || busyId === 'del-' + lead.id;
          return (
            <li key={lead.id} className={cn(card, 'p-4', rowBusy && 'opacity-60')}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h4 className="font-serif text-lg leading-tight text-ink">{lead.name}</h4>
                    <span
                      className={cn(
                        'rounded-full px-2 py-0.5 text-[0.62rem] font-medium',
                        STATUS_STYLE[lead.status],
                      )}
                    >
                      {STATUS_LABEL[lead.status]}
                    </span>
                  </div>
                  <a
                    href={`tel:${lead.phone.replace(/\s+/g, '')}`}
                    className="mt-1 inline-flex items-center gap-1.5 text-sm text-forest hover:underline"
                  >
                    <Phone className="size-3.5" />
                    {lead.phone}
                  </a>
                  {lead.interest && (
                    <p className="mt-1 text-sm text-ink/70">สนใจ: {lead.interest}</p>
                  )}
                  {lead.preferredTime && (
                    <p className="text-sm text-ink/60">สะดวก: {lead.preferredTime}</p>
                  )}
                  {lead.message && (
                    <p className="mt-1.5 whitespace-pre-line rounded-lg bg-sand/60 px-3 py-2 text-sm text-ink/70">
                      {lead.message}
                    </p>
                  )}
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 text-xs text-ink/40">
                  <Clock className="size-3" />
                  {formatDateTime(lead.createdAt)}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-black/[0.05] pt-3">
                <label className="flex items-center gap-1.5 text-xs text-ink/55">
                  สถานะ
                  <select
                    value={lead.status}
                    disabled={busy}
                    onChange={(e) => changeStatus(lead, e.target.value as LeadStatus)}
                    className="rounded-lg border border-black/[0.1] bg-sand/60 px-2.5 py-1.5 text-xs text-ink outline-none focus:border-forest/45"
                  >
                    {LEAD_STATUSES.map((status) => (
                      <option key={status} value={status}>
                        {STATUS_LABEL[status]}
                      </option>
                    ))}
                  </select>
                </label>
                {rowBusy && <Loader2 className="size-4 animate-spin text-forest" />}
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => remove(lead)}
                  className={cn(btn.danger, 'ml-auto')}
                >
                  <Trash2 className="size-3.5" />
                  ลบ
                </button>
              </div>
            </li>
          );
        })}
        {visible.length === 0 && (
          <li className="rounded-2xl border border-dashed border-black/10 px-4 py-12 text-center text-sm text-ink/40">
            {leads.length === 0 ? 'ยังไม่มีคำขอนัดหมาย' : 'ไม่มีรายการในสถานะนี้'}
          </li>
        )}
      </ul>
    </section>
  );
}
