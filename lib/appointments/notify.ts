import 'server-only';
import th from '@/messages/th.json';
import en from '@/messages/en.json';
import { site } from '@/lib/site';
import { formatAppointmentDateTime } from './schedule';

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

export type AppointmentEmailDelivery = {
  status: 'sent' | 'not_configured' | 'failed';
};

type ResendAttachment = {
  filename: string;
  content: string;
  content_type?: string;
};

const messagesFor = (locale: 'th' | 'en') => (locale === 'en' ? en : th).Appointments;

function isEmailConfigured(): boolean {
  return !!process.env.RESEND_API_KEY?.trim() && !!process.env.RESEND_FROM_EMAIL?.trim();
}

async function sendViaResend(payload: {
  to: string;
  subject: string;
  text: string;
  attachments?: ResendAttachment[];
}): Promise<'sent' | 'failed'> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) return 'failed';

  try {
    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        from,
        to: payload.to,
        subject: payload.subject,
        text: payload.text,
        ...(payload.attachments ? { attachments: payload.attachments } : {}),
      }),
    });
    if (!response.ok) {
      console.error(`Resend appointment delivery failed with status ${response.status}`);
      return 'failed';
    }
    return 'sent';
  } catch (error) {
    console.error(
      'Resend appointment request failed:',
      error instanceof Error ? error.message : 'unknown error',
    );
    return 'failed';
  }
}

function replacePlaceholders(template: string, values: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(values)) {
    result = result.replaceAll(`{${key}}`, value);
  }
  return result;
}

/** Escapes text per RFC 5545 §3.3.11 (comma, semicolon, backslash, newline). */
function icsEscape(value: string): string {
  return value
    .replaceAll('\\', '\\\\')
    .replace(/\r\n|\r|\n/g, '\\n')
    .replaceAll(';', '\\;')
    .replaceAll(',', '\\,');
}

/** Formats an epoch instant as a UTC floating time per RFC 5545 (YYYYMMDDTHHMMSSZ). */
function icsTimestamp(epochMs: number): string {
  return new Date(epochMs)
    .toISOString()
    .replaceAll('-', '')
    .replaceAll(':', '')
    .replace(/\.\d{3}Z$/, 'Z');
}

function buildAppointmentIcs(params: {
  uid: string;
  summary: string;
  description: string;
  startMs: number;
  durationMinutes: number;
  location: string;
}): string {
  const endMs = params.startMs + params.durationMinutes * 60_000;
  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Kazumi Clinic//Appointments//EN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:${icsEscape(params.uid)}`,
    `DTSTAMP:${icsTimestamp(Date.now())}`,
    `DTSTART:${icsTimestamp(params.startMs)}`,
    `DTEND:${icsTimestamp(endMs)}`,
    `SUMMARY:${icsEscape(params.summary)}`,
    `DESCRIPTION:${icsEscape(params.description)}`,
    `LOCATION:${icsEscape(params.location)}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR',
    '',
  ].join('\r\n');
}

export async function sendAppointmentConfirmationEmail(params: {
  to: string;
  locale: 'th' | 'en';
  leadId: string;
  name: string;
  scheduledAt: number;
  durationMinutes: number;
  interest: string | null;
  cancelUrl: string;
}): Promise<AppointmentEmailDelivery> {
  if (!isEmailConfigured()) {
    console.warn('Appointment-confirmation email delivery is not configured.');
    return { status: 'not_configured' };
  }

  const copy = messagesFor(params.locale).confirmationEmail;
  const text = replacePlaceholders(copy.body, {
    name: params.name,
    datetime: formatAppointmentDateTime(params.scheduledAt, params.locale),
    duration: String(params.durationMinutes),
    interest: params.interest || (params.locale === 'en' ? 'Not specified' : 'ไม่ได้ระบุ'),
    cancelUrl: params.cancelUrl,
    phone: site.phone,
    address: site.addressFull,
  });
  const interest = params.interest || (params.locale === 'en' ? 'Not specified' : 'ไม่ได้ระบุ');
  const datetime = formatAppointmentDateTime(params.scheduledAt, params.locale);
  const summary =
    params.locale === 'en'
      ? `Kazumi Clinic appointment — ${interest}`
      : `นัดหมาย Kazumi Clinic — ${interest}`;
  const description =
    params.locale === 'en'
      ? `Date and time: ${datetime}\nEstimated duration: ${params.durationMinutes} minutes\nService of interest: ${interest}\nPhone: ${site.phone}`
      : `วันและเวลา: ${datetime}\nระยะเวลาโดยประมาณ: ${params.durationMinutes} นาที\nบริการที่สนใจ: ${interest}\nโทร: ${site.phone}`;
  const ics = buildAppointmentIcs({
    uid: `${params.leadId}@${new URL(site.url).hostname}`,
    summary,
    description,
    startMs: params.scheduledAt,
    durationMinutes: params.durationMinutes,
    location: site.addressFull,
  });
  return {
    status: await sendViaResend({
      to: params.to,
      subject: copy.subject,
      text,
      attachments: [
        {
          filename: 'kazumi-clinic-appointment.ics',
          content: btoa(unescape(encodeURIComponent(ics))),
          content_type: 'text/calendar; charset=utf-8',
        },
      ],
    }),
  };
}

export async function sendAppointmentReminderEmail(params: {
  to: string;
  locale: 'th' | 'en';
  name: string;
  scheduledAt: number;
  durationMinutes: number;
  interest: string | null;
  cancelUrl: string;
}): Promise<AppointmentEmailDelivery> {
  if (!isEmailConfigured()) {
    console.warn('Appointment-reminder email delivery is not configured.');
    return { status: 'not_configured' };
  }

  const copy = messagesFor(params.locale).reminderEmail;
  const text = replacePlaceholders(copy.body, {
    name: params.name,
    datetime: formatAppointmentDateTime(params.scheduledAt, params.locale),
    duration: String(params.durationMinutes),
    interest: params.interest || (params.locale === 'en' ? 'Not specified' : 'ไม่ได้ระบุ'),
    cancelUrl: params.cancelUrl,
    phone: site.phone,
    address: site.addressFull,
  });
  return { status: await sendViaResend({ to: params.to, subject: copy.subject, text }) };
}

export async function sendAppointmentCancelledEmail(params: {
  to: string;
  locale: 'th' | 'en';
  name: string;
  scheduledAt: number | null;
}): Promise<AppointmentEmailDelivery> {
  if (!isEmailConfigured()) {
    console.warn('Appointment-cancelled email delivery is not configured.');
    return { status: 'not_configured' };
  }

  const copy = messagesFor(params.locale).cancelledEmail;
  const datetime = params.scheduledAt
    ? formatAppointmentDateTime(params.scheduledAt, params.locale)
    : params.locale === 'en'
      ? 'Appointment request (time not yet confirmed)'
      : 'คำขอนัดหมายที่ยังไม่ได้ยืนยันเวลา';
  const text = replacePlaceholders(copy.body, {
    name: params.name,
    datetime,
    phone: site.phone,
    address: site.addressFull,
  });
  return { status: await sendViaResend({ to: params.to, subject: copy.subject, text }) };
}

/** Keeps optional staff notifications from turning a successful appointment mutation into an error. */
export async function notifyStaffWebhook(payload: Record<string, unknown>): Promise<void> {
  const url = process.env.LEAD_WEBHOOK_URL?.trim();
  if (!url) return;
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch {
    // The lead is already saved or cancelled; notification delivery is best-effort only.
  }
}
