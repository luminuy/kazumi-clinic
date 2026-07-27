'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { CalendarCheck, Clock, Loader2, Mail, Phone, Trash2, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import { btn, card } from './ui';
import { LEAD_STATUSES, type LeadStatus } from '@/lib/leads';
import {
  APPOINTMENT_DEFAULT_DURATION_MINUTES,
  formatAppointmentDateTime,
  toEpochMs,
} from '@/lib/appointments/schedule';

export type AdminLead = {
  id: string;
  name: string;
  phone: string;
  email: string;
  interest: string;
  preferredTime: string;
  requestedDate: string;
  requestedTime: string;
  scheduledAt: number | null;
  durationMinutes: number | null;
  cancelledAt: number | null;
  cancelReason: string | null;
  message: string;
  status: LeadStatus;
  createdAt: number;
};

const STATUS_LABEL: Record<LeadStatus, string> = {
  new: 'ใหม่',
  contacted: 'ติดต่อแล้ว',
  booked: 'นัดแล้ว',
  cancelled: 'ยกเลิกแล้ว',
  closed: 'ปิด',
};

const STATUS_STYLE: Record<LeadStatus, string> = {
  new: 'bg-forest/10 text-forest',
  contacted: 'bg-amber-50 text-amber-700',
  booked: 'bg-blue-50 text-blue-700',
  cancelled: 'bg-red-50 text-red-600',
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
  const [bookingEditorId, setBookingEditorId] = useState<string | null>(null);
  const [bookingDraft, setBookingDraft] = useState({
    date: '',
    time: '',
    durationMinutes: APPOINTMENT_DEFAULT_DURATION_MINUTES,
  });
  const [conflictIds, setConflictIds] = useState<Set<string>>(() => new Set());
  const busy = busyId !== null;

  const counts = useMemo(() => {
    const base: Record<Filter, number> = {
      all: leads.length,
      new: 0,
      contacted: 0,
      booked: 0,
      cancelled: 0,
      closed: 0,
    };
    for (const lead of leads) base[lead.status] += 1;
    return base;
  }, [leads]);

  const visible = filter === 'all' ? leads : leads.filter((lead) => lead.status === filter);

  async function mutate(
    key: string,
    run: () => Promise<Response>,
  ): Promise<{ conflict?: boolean } | null> {
    setBusyId(key);
    setError(null);
    try {
      const res = await run();
      if (!res.ok) throw new Error(await errorMessage(res, 'อัปเดตไม่สำเร็จ'));
      const data = (await res.json().catch(() => ({}))) as { conflict?: boolean };
      router.refresh();
      return data;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'อัปเดตไม่สำเร็จ');
      return null;
    } finally {
      setBusyId(null);
    }
  }

  function openBookingEditor(lead: AdminLead) {
    const scheduled = lead.scheduledAt ? new Date(lead.scheduledAt + 7 * 60 * 60 * 1000) : null;
    setBookingDraft({
      date: scheduled?.toISOString().slice(0, 10) ?? '',
      time: scheduled?.toISOString().slice(11, 16) ?? '',
      durationMinutes: lead.durationMinutes ?? APPOINTMENT_DEFAULT_DURATION_MINUTES,
    });
    setBookingEditorId(lead.id);
  }

  async function changeStatus(lead: AdminLead, status: LeadStatus) {
    if (status === 'booked') {
      openBookingEditor(lead);
      return;
    }

    let cancelReason: string | undefined;
    if (status === 'cancelled') {
      const reason = window.prompt('เหตุผลที่ยกเลิกนัดหมาย (ไม่บังคับ)', '');
      if (reason === null) return;
      cancelReason = reason;
    }

    setBookingEditorId(null);
    await mutate('status-' + lead.id, () =>
      fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id: lead.id, status, cancelReason }),
      }),
    );
  }

  async function confirmSchedule(lead: AdminLead) {
    if (!bookingDraft.date || !bookingDraft.time) {
      setError('กรุณาระบุวันที่และเวลานัด');
      return;
    }
    const scheduledAt = toEpochMs(bookingDraft.date, bookingDraft.time);
    if (!Number.isFinite(scheduledAt)) {
      setError('วันที่หรือเวลานัดไม่ถูกต้อง');
      return;
    }
    const result = await mutate('status-' + lead.id, () =>
      fetch('/api/admin/leads', {
        method: 'PATCH',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          id: lead.id,
          status: 'booked',
          scheduledAt,
          durationMinutes: bookingDraft.durationMinutes,
        }),
      }),
    );
    if (!result) return;
    setBookingEditorId(null);
    setConflictIds((current) => {
      const next = new Set(current);
      if (result.conflict) next.add(lead.id);
      else next.delete(lead.id);
      return next;
    });
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
                  {lead.email && (
                    <a
                      href={`mailto:${lead.email}`}
                      className="ml-3 inline-flex items-center gap-1.5 text-sm text-forest hover:underline"
                    >
                      <Mail className="size-3.5" />
                      {lead.email}
                    </a>
                  )}
                  {lead.interest && (
                    <p className="mt-1 text-sm text-ink/70">สนใจ: {lead.interest}</p>
                  )}
                  {lead.preferredTime && (
                    <p className="text-sm text-ink/60">สะดวกเพิ่มเติม: {lead.preferredTime}</p>
                  )}
                  {(lead.requestedDate || lead.requestedTime) && (
                    <p className="text-sm text-ink/60">
                      ขอวันที่/เวลา:{' '}
                      {[lead.requestedDate, lead.requestedTime].filter(Boolean).join(' · ')}
                    </p>
                  )}
                  {lead.scheduledAt && (
                    <div className="mt-2 inline-flex items-center gap-2 rounded-xl bg-blue-50 px-3 py-2 text-sm font-medium text-blue-700">
                      <CalendarCheck className="size-4" />
                      ยืนยันแล้ว: {formatAppointmentDateTime(lead.scheduledAt, 'th')}
                      {lead.durationMinutes ? ` · ${lead.durationMinutes} นาที` : ''}
                    </div>
                  )}
                  {lead.cancelReason && (
                    <p className="mt-1 text-xs text-red-600">
                      เหตุผลที่ยกเลิก: {lead.cancelReason}
                    </p>
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

              {bookingEditorId === lead.id && (
                <div className="mt-3 grid gap-3 rounded-2xl border border-blue-100 bg-blue-50/60 p-3 sm:grid-cols-[1fr_1fr_8rem_auto] sm:items-end">
                  <label className="text-xs text-ink/60">
                    วันที่
                    <input
                      type="date"
                      value={bookingDraft.date}
                      onChange={(event) =>
                        setBookingDraft((draft) => ({ ...draft, date: event.target.value }))
                      }
                      className="mt-1 block w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-forest/45"
                    />
                  </label>
                  <label className="text-xs text-ink/60">
                    เวลา
                    <input
                      type="time"
                      value={bookingDraft.time}
                      onChange={(event) =>
                        setBookingDraft((draft) => ({ ...draft, time: event.target.value }))
                      }
                      className="mt-1 block w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-forest/45"
                    />
                  </label>
                  <label className="text-xs text-ink/60">
                    ระยะเวลา (นาที)
                    <input
                      type="number"
                      min={15}
                      max={480}
                      step={15}
                      value={bookingDraft.durationMinutes}
                      onChange={(event) =>
                        setBookingDraft((draft) => ({
                          ...draft,
                          durationMinutes: Number(event.target.value),
                        }))
                      }
                      className="mt-1 block w-full rounded-lg border border-black/10 bg-white px-2.5 py-2 text-xs text-ink outline-none focus:border-forest/45"
                    />
                  </label>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => confirmSchedule(lead)}
                    className={btn.primary}
                  >
                    ยืนยันนัด
                  </button>
                </div>
              )}

              {conflictIds.has(lead.id) && (
                <p className="mt-3 inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-3 py-2 text-xs text-amber-700">
                  <TriangleAlert className="size-3.5" />
                  เวลานี้ทับซ้อนกับนัดอื่น — ตรวจสอบว่าตั้งใจหรือไม่
                </p>
              )}

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
                {lead.status === 'booked' && (
                  <button
                    type="button"
                    disabled={busy}
                    onClick={() => openBookingEditor(lead)}
                    className={btn.secondary}
                  >
                    {lead.scheduledAt ? 'แก้เวลานัด' : 'กำหนดเวลานัด'}
                  </button>
                )}
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
