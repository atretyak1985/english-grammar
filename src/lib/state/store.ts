'use client';

import { readLocalState, writeLocalState } from '@/lib/state/storage';
import { EMPTY_STATE, type UserState } from '@/types/state';

/**
 * Стан користувача поза React: один снапшот на весь застосунок, тому будь-який
 * екран бачить ті самі прочитані розділи й статуси слів (CONCEPT 6, 7).
 */
const listeners = new Set<() => void>();
let snapshot: UserState | null = null;

export function subscribeState(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function getStateSnapshot(): UserState {
  snapshot ??= readLocalState();
  return snapshot;
}

export function getServerStateSnapshot(): UserState {
  return EMPTY_STATE;
}

/** Єдина точка запису: мутація → localStorage → підписники. */
export function mutateState(mutate: (current: UserState) => UserState): UserState {
  const current = getStateSnapshot();
  const next = mutate(current);
  if (next === current) return current;
  snapshot = next;
  writeLocalState(next);
  for (const listener of listeners) listener();
  return next;
}
