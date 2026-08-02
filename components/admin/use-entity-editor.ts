'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { errorMessage } from './ui';

/**
 * The add/edit/save state machine every /admin content editor (products, promotions, blog,
 * reviews) reimplemented identically: which row is open ('new', an id, or none), its draft, which
 * key is mid-request, and the last error. Each entity keeps its own `save()`/`remove()`/`move()`
 * — those differ per entity (validation, request shape) — this only owns the state and the
 * generic "run a request, surface its error, refresh on success" wrapper.
 */
export function useEntityEditor<TItem extends { id: string }, TDraft>({
  emptyDraft,
  draftFrom,
}: {
  emptyDraft: TDraft;
  draftFrom: (item: TItem) => TDraft;
}) {
  const router = useRouter();
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<TDraft>(emptyDraft);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const busy = busyId !== null;

  /** `overrides` lets a caller seed the blank draft — e.g. reviews mint a temp id upfront so a
   *  photo can upload before the row is saved. */
  function openAdd(overrides?: Partial<TDraft>) {
    setError(null);
    setDraft(overrides ? { ...emptyDraft, ...overrides } : emptyDraft);
    setEditing('new');
  }

  function openEdit(item: TItem) {
    setError(null);
    setDraft(draftFrom(item));
    setEditing(item.id);
  }

  function close() {
    setEditing(null);
    setError(null);
  }

  async function mutate(
    key: string,
    run: () => Promise<Response>,
    onOk?: (res: Response) => void | Promise<void>,
  ): Promise<boolean> {
    setBusyId(key);
    setError(null);
    try {
      const res = await run();
      if (!res.ok) throw new Error(await errorMessage(res, 'บันทึกไม่สำเร็จ'));
      await onOk?.(res);
      router.refresh();
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'บันทึกไม่สำเร็จ');
      return false;
    } finally {
      setBusyId(null);
    }
  }

  return {
    editing,
    draft,
    setDraft,
    busyId,
    busy,
    error,
    setError,
    openAdd,
    openEdit,
    close,
    mutate,
  };
}
