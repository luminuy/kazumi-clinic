import type { ReactNode } from 'react';

/**
 * Shared visual language for the whole /admin area, so the images and products pages read as one
 * tool. Apple-minimal to match the public site's current system (see app/globals.css): white
 * cards on a soft grey field, hairline borders, soft radii, forest green for the one affirmative
 * action per context, a neutral grey for everything secondary, and a serif display voice.
 */

export const btn = {
  /** The single affirmative action in a context — save, add. */
  primary:
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-forest px-4 py-2 text-xs font-medium text-white transition-opacity hover:opacity-90 disabled:opacity-40',
  /** Neutral actions — change photo, edit, upload. */
  secondary:
    'inline-flex items-center justify-center gap-1.5 rounded-full bg-black/[0.05] px-3.5 py-2 text-xs font-medium text-ink transition-colors hover:bg-black/[0.09] disabled:opacity-40',
  /** Destructive — delete, hide, reset. */
  danger:
    'inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium text-red-600 transition-colors hover:bg-red-50 disabled:opacity-40',
  /** Square icon control — reorder, close. */
  icon: 'grid size-8 place-items-center rounded-full bg-black/[0.04] text-ink/70 transition-colors hover:bg-black/[0.09] hover:text-ink disabled:opacity-25',
};

/** Interactive surface — a hairline card that lifts a touch on hover. */
export const card =
  'rounded-2xl border border-black/[0.07] bg-cream transition-shadow duration-200 hover:shadow-[0_2px_16px_rgba(0,0,0,0.05)]';

export const inputClass =
  'w-full rounded-xl border border-black/[0.1] bg-sand/60 px-3.5 py-2.5 text-sm text-ink outline-none transition-colors placeholder:text-ink/35 focus:border-forest/45 focus:bg-white';

/** Green-dotted micro-label above a page title. */
function Eyebrow({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.16em] text-forest">
      <span className="size-1 rounded-full bg-forest" />
      {children}
    </span>
  );
}

export function PageHeading({
  eyebrow,
  title,
  description,
  stat,
}: {
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  stat?: ReactNode;
}) {
  return (
    <header className="border-b border-black/[0.07] pb-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="max-w-xl">
          {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
          <h1 className="mt-3 font-serif text-3xl leading-tight text-ink md:text-[2.5rem]">
            {title}
          </h1>
          {description && (
            <p className="mt-2.5 text-sm leading-relaxed text-ink/55">{description}</p>
          )}
        </div>
        {stat && <div className="shrink-0 pb-1 text-sm text-ink/45">{stat}</div>}
      </div>
    </header>
  );
}

export function SectionHeading({
  title,
  count,
  action,
}: {
  title: string;
  count?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="flex items-baseline gap-3">
        <h2 className="font-serif text-2xl text-ink">{title}</h2>
        {count != null && <span className="text-xs text-ink/40">{count}</span>}
      </div>
      {action}
    </div>
  );
}

/** A labelled form field — every editor form uses this for every input/select/textarea. */
export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="text-xs font-medium text-ink/65">{label}</span>
      {hint && <span className="ml-2 text-[0.65rem] text-ink/35">{hint}</span>}
      <span className="mt-1.5 block">{children}</span>
    </label>
  );
}

/** Sits under every "(อังกฤษ)" field — the site falls back to Thai when the English is empty. */
export function EnglishFallbackNote() {
  return (
    <p className="mt-1.5 text-[0.68rem] text-ink/40">
      ปล่อยว่างได้ ถ้าไม่กรอกหน้าอังกฤษจะแสดงภาษาไทย
    </p>
  );
}

/** Reads a failed response without throwing "Unexpected end of JSON input" on an empty body. */
export async function errorMessage(res: Response, fallback: string): Promise<string> {
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
