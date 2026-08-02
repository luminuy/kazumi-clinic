'use client';

import type { ReactNode } from 'react';
import { Check, Loader2 } from 'lucide-react';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { btn } from './ui';

/**
 * Replaces the old inline-expanding form (editing a row pushed the whole list down, with a tiny
 * "×" the only way out). A right-side drawer over the `components/ui/sheet.tsx` primitive —
 * that's the only modal-ish component already in the design system, so this wraps it rather than
 * introducing a new pattern. Every entity's own field JSX goes in `children` unchanged; this only
 * owns the shell, the save/cancel footer, and the busy/error state around them.
 */
export function EditorDrawer({
  open,
  onOpenChange,
  heading,
  busy,
  error,
  onSave,
  onCancel,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  heading: string;
  busy: boolean;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
  children: ReactNode;
}) {
  return (
    <Sheet
      open={open}
      onOpenChange={(next) => {
        if (!next && busy) return; // don't let a backdrop click/Escape drop mid-request
        onOpenChange(next);
      }}
    >
      <SheetContent size="lg" className="gap-0 bg-cream p-0">
        <div className="border-b border-black/[0.07] px-5 py-4 sm:px-6">
          <h4 className="pr-8 font-serif text-xl text-ink">{heading}</h4>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-5 sm:px-6">
          {error && (
            <p className="mb-4 rounded-xl bg-red-50 px-3 py-2 text-xs text-red-600">{error}</p>
          )}
          {children}
        </div>

        <div className="flex items-center gap-2 border-t border-black/[0.07] px-5 py-4 sm:px-6">
          <button type="button" onClick={onSave} disabled={busy} className={btn.primary}>
            {busy ? <Loader2 className="size-3.5 animate-spin" /> : <Check className="size-3.5" />}
            บันทึก
          </button>
          <button type="button" onClick={onCancel} disabled={busy} className={btn.secondary}>
            ยกเลิก
          </button>
        </div>
      </SheetContent>
    </Sheet>
  );
}
